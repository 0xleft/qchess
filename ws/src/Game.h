#include <chess.hpp>
#include <crow.h>
#include <unordered_set>
#include "Connection.h"

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
private:
    chess::Board board;
    std::unordered_set<ws::ChessConnection*> connections;
    GameState state;

public:
    Game();
    void addConnection(ws::ChessConnection* connection);
    void removeConnection(ws::ChessConnection* connection);
    void handleMove(ws::ChessConnection* connection, std::string move);
};


} // namespace ws

#endif