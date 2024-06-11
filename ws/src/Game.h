#pragma once

#include <chess.hpp>
#include <crow.h>
#include <vector>
#include <chess.hpp>
#include "Connection.hpp"
#include "Utils.h"

namespace ws
{

enum class GameState {
    WAITING,
    IN_PROGRESS,
    FINISHED
};

class Game;

class Database {
private:

public:
    Database();

    void init();
    void saveGame(ws::Game* game);

    ws::Game* loadGame(std::string gameId);
};


class Game {
    const float MAX_CREATION_TIME_SECONDS = 500.0f;

private:
    chess::Board board = chess::Board();
    std::vector<ws::ChessConnection*> connections;
    GameState state = GameState::WAITING;
    std::string gameId;
    std::string whiteId = "";
    std::string blackId = "";
    bool privateGame = false;

    std::thread timerThread;

    int initialWhiteTime = 300;
    int initialBlackTime = 300;
    int increment = 0;

    bool hasWhiteJoined = false;
    bool hasBlackJoined = false;

    std::string reconnectWhiteId = "";
    std::string reconnectBlackId = "";
    
    std::string winner = "";

    bool whiteOfferedDraw = false;
    bool blackOfferedDraw = false;

    std::chrono::system_clock::time_point lastDrawOffer = std::chrono::system_clock::now();

    std::vector<std::string> moves;
    std::chrono::system_clock::time_point created = std::chrono::system_clock::now();
    std::chrono::system_clock::time_point lastMove = std::chrono::system_clock::now();
    
    void init() {
        gameId = utils::sha256(std::to_string(rand()) + std::to_string(std::chrono::system_clock::now().time_since_epoch().count()));
        whiteId = utils::sha256(std::to_string(rand())).substr(0, 20);
        blackId = utils::sha256(std::to_string(rand())).substr(0, 20);
        reconnectWhiteId = utils::sha256(std::to_string(rand())).substr(0, 20);
        reconnectBlackId = utils::sha256(std::to_string(rand())).substr(0, 20);

        timerThread = std::thread([&]() {
            while (true) {
                std::this_thread::sleep_for(std::chrono::seconds(1));
                if (state == GameState::IN_PROGRESS) {

                    if (std::chrono::system_clock::now() - lastDrawOffer > std::chrono::seconds(10) && (whiteOfferedDraw || blackOfferedDraw)) {
                        whiteOfferedDraw = false;
                        blackOfferedDraw = false;

                        for (ws::ChessConnection* connection : connections) {
                            connection->send("{\"drawOffered\": false}");
                        }
                    }

                    if (board.sideToMove() == chess::Color::WHITE) {
                        initialWhiteTime -= 1.0f;
                    } else {
                        initialBlackTime -= 1.0f;
                    }

                    for (ws::ChessConnection* connection : connections) {
                        connection->send("{\"whiteTime\": " + std::to_string(initialWhiteTime) + ", \"blackTime\": " + std::to_string(initialBlackTime) + "}");
                    }

                    if (initialWhiteTime < 0 || initialBlackTime < 0) {
                        winner = initialWhiteTime <= 0 ? "black" : "white";
                        state = GameState::FINISHED;
                        for (ws::ChessConnection* connection : connections) {
                            connection->send("{\"gameOver\": true}");
                            connection->send("{\"winner\": \"" + winner + "\"}");
                        }
                    }
                }
            }
        });

        timerThread.detach();
    }

public:
    Game() {
        init();
    }
    Game(crow::websocket::connection& conn) {
        init();
        connections.push_back(new ws::ChessConnection(&conn, ws::ConnectionRole::SPECTATOR));
    }
    inline void addConnection(ws::ChessConnection* connection) {
        connections.push_back(connection);
    }
    inline void removeConnection(ws::ChessConnection* connection) {
        connections.erase(std::remove(connections.begin(), connections.end(), connection), connections.end());
    }
    bool isWhiteOfferingDraw() {
        return whiteOfferedDraw;
    }
    bool isBlackOfferingDraw() {
        return blackOfferedDraw;
    }
    void setWhiteOfferingDraw(bool offering) {
        whiteOfferedDraw = offering;
    }
    void setBlackOfferingDraw(bool offering) {
        blackOfferedDraw = offering;
    }
    void setLastDrawOffer(std::chrono::system_clock::time_point time) {
        lastDrawOffer = time;
    }
    std::chrono::system_clock::time_point getLastDrawOffer() {
        return lastDrawOffer;
    }
    void setInitialTime(int time) {
        initialWhiteTime = time;
        initialBlackTime = time;
    }
    std::string getWinner() {
        return winner;
    }
    void setWinner(std::string winner) {
        this->winner = winner;
    }
    void setIncrement(int increment) {
        this->increment = increment;
    }
    int getIncrement() {
        return increment;
    }
    bool hasWhiteJoinedGame() {
        return hasWhiteJoined;
    }
    bool hasBlackJoinedGame() {
        return hasBlackJoined;
    }
    void setWhiteJoinedGame(bool joined) {
        hasWhiteJoined = joined;
    }
    void setBlackJoinedGame(bool joined) {
        hasBlackJoined = joined;
    }
    void incrementTime() {
        if (board.sideToMove() == chess::Color::WHITE) {
            initialWhiteTime += increment;
        } else {
            initialBlackTime += increment;
        }
    }
    std::string getWhiteReconnectId() {
        return reconnectWhiteId;
    }
    std::string getBlackReconnectId() {
        return reconnectBlackId;
    }
    GameState getGameState() {
        return state;
    }
    int getWhiteTime() {
        return initialWhiteTime;
    }
    int getBlackTime() {
        return initialBlackTime;
    }
    void handleMove(crow::websocket::connection& connection, crow::json::rvalue json);
    void handleJoin(crow::websocket::connection& connection, crow::json::rvalue json);

    void setGameId(std::string id) {
        gameId = id;
    }

    void setMovesFromString(std::string movesString) {
        std::vector<std::string> moves = utils::split(movesString, ",");
        for (std::string move : moves) {
            this->moves.push_back(move);
        }
    }

    void setPrivate(bool isPrivate) {
        privateGame = isPrivate;
    }
    bool isPrivate() {
        return privateGame;
    }
    std::vector<std::string> getMoves() {
        return moves;
    }

    std::string getMovesString() {
        std::string result = "";
        for (std::string move : moves) {
            result += move + ",";
        }

        return result.substr(0, result.size() - 1);
    }

    bool hasExpired() {
        std::chrono::duration<float> elapsed = std::chrono::system_clock::now() - created;
        std::chrono::duration<float> lastMoveElapsed = std::chrono::system_clock::now() - lastMove;
        return 
        (elapsed.count() > MAX_CREATION_TIME_SECONDS && state != GameState::IN_PROGRESS) ||
        // (state == GameState::IN_PROGRESS && getNumPlayers() < 2 && lastMoveElapsed.count() > 60.0f) || // todo
        (state == GameState::FINISHED);
    }

    void setCreated(std::string created) {
        this->created = utils::stringToTime(created);
    }

    std::string getCreated() {
        return utils::timeToString(created);
    }

    ws::ChessConnection* getConnection(crow::websocket::connection& conn) {
        for (ws::ChessConnection* connection : connections) {
            if (connection->getConnection() == &conn) {
                return connection;
            }
        }
        return nullptr;
    }

    int getNumPlayers() {
        int count = 0;
        for (ws::ChessConnection* connection : connections) {
            if (connection->getRole() == ws::ConnectionRole::PLAYER) {
                count++;
            }
        }
        return count;
    }

    int getNumConnections() {
        return connections.size();
    }

    std::string getGameId() { return gameId; }
    std::string getWhiteId() { return whiteId; }
    std::string getBlackId() { return blackId; }

    static inline ws::Game* getGame(std::string id, std::vector<ws::Game*>& games) {
        for (ws::Game* game : games) {
            if (game->getGameId() == id) {
                return game;
            }
        }
        return nullptr;
    }

    static inline ws::Game* getGame(crow::websocket::connection& conn, std::vector<ws::Game*>& games) {
        for (ws::Game* game : games) {
            for (ws::ChessConnection* connection : game->connections) {
                if (connection->getConnection() == &conn) {
                    return game;
                }
            }
        }
        return nullptr;
    }

    ~Game() {
        for (ws::ChessConnection* connection : connections) {
            connection->send("{\"playing\": false}");
            delete connection;
        }

        state = GameState::FINISHED;
    }
};


} // namespace ws