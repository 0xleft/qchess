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
    std::chrono::system_clock::time_point created = std::chrono::system_clock::now();
    std::thread syncThread;

    void createId() {
        gameId = utils::sha256(std::to_string(std::chrono::system_clock::now().time_since_epoch().count()));
    }

    void startSyncThread() {
        syncThread = std::thread([&]() {
            while (state == GameState::IN_PROGRESS) {
                std::this_thread::sleep_for(std::chrono::seconds(2));
                sendSyncState();
            }
        });

        syncThread.detach();
    }

public:
    Game() {
        createId();
        startSyncThread();
    }
    Game(crow::websocket::connection& conn) {
        createId();
        connections.push_back(new ws::ChessConnection(&conn, ws::ConnectionRole::SPECTATOR));
        startSyncThread();
    }
    inline void addConnection(ws::ChessConnection* connection) {
        connections.push_back(connection);
    }
    inline void removeConnection(ws::ChessConnection* connection) {
        connections.erase(std::remove(connections.begin(), connections.end(), connection), connections.end());
    }
    void handleMove(crow::websocket::connection& connection, std::string move);
    void handleJoin(crow::websocket::connection& connection, std::string name);
    void handleTeam(crow::websocket::connection& connection, std::string team);

    void sendSyncState() {
        for (ws::ChessConnection* connection : connections) {
            connection->send("{\"sync\": \"" + board.getFen() + "\"}");
            if (connection->getRole() == ws::ConnectionRole::PLAYER) {
                if (connection->getColor() == chess::Color::WHITE) {
                    connection->send("{\"role\": \"white\"}");
                } else {
                    connection->send("{\"role\": \"black\"}");
                }
            }
        }
    }

    bool hasExpired() {
        std::chrono::duration<float> elapsed = std::chrono::system_clock::now() - created;
        return elapsed.count() > MAX_CREATION_TIME_SECONDS && state != GameState::IN_PROGRESS;
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

    std::string getGameId() {
        return gameId;
    }

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
            delete connection;
        }

        state = GameState::FINISHED;
        if (syncThread.joinable())
            syncThread.join();
        std::cout << "Game destroyed" << std::endl;
    }
};


} // namespace ws

#endif