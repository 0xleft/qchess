#include <chess.hpp>
#include <crow.h>
#include <vector>
#include <chess.hpp>
#include "Connection.hpp"
#include "Utils.h"

#ifndef GAME_H
#define GAME_H

namespace ws
{

enum class GameState {
    WAITING,
    IN_PROGRESS,
    FINISHED
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
    std::vector<std::string> moves;
    std::chrono::system_clock::time_point created = std::chrono::system_clock::now();
    std::chrono::system_clock::time_point lastMove = std::chrono::system_clock::now();

    void createId() {
        gameId = utils::sha256(std::to_string(rand()) + std::to_string(std::chrono::system_clock::now().time_since_epoch().count()));
        whiteId = utils::sha256(std::to_string(rand())).substr(0, 20);
        blackId = utils::sha256(std::to_string(rand())).substr(0, 20);
    }

public:
    Game() {
        createId();
    }
    Game(crow::websocket::connection& conn) {
        createId();
        connections.push_back(new ws::ChessConnection(&conn, ws::ConnectionRole::SPECTATOR));
    }
    inline void addConnection(ws::ChessConnection* connection) {
        connections.push_back(connection);
    }
    inline void removeConnection(ws::ChessConnection* connection) {
        connections.erase(std::remove(connections.begin(), connections.end(), connection), connections.end());
    }
    void handleMove(crow::websocket::connection& connection, crow::json::rvalue json);
    void handleJoin(crow::websocket::connection& connection, crow::json::rvalue json);

    void setPrivate(bool isPrivate) {
        privateGame = isPrivate;
    }
    bool isPrivate() {
        return privateGame;
    }

    bool hasExpired() {
        std::chrono::duration<float> elapsed = std::chrono::system_clock::now() - created;
        std::chrono::duration<float> lastMoveElapsed = std::chrono::system_clock::now() - lastMove;
        return (elapsed.count() > MAX_CREATION_TIME_SECONDS && state != GameState::IN_PROGRESS) || (state == GameState::IN_PROGRESS && getNumPlayers() < 2 && lastMoveElapsed.count() > 60.0f);
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
        // todo save the board and players to a db
    }
};


} // namespace ws

#endif