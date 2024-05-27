#include "Game.h"

void ws::Game::handleMove(crow::websocket::connection &connection, std::string move) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn == nullptr) {
        return;
    }

    if (conn->getRole() == ws::ConnectionRole::SPECTATOR) {
        return;
    }

    if (state != ws::GameState::IN_PROGRESS) {
        return;
    }

    if (board.sideToMove() != conn->getColor()) {
        return;
    }

    chess::Movelist moves;
    chess::movegen::legalmoves(moves, board);

    bool found = false;
    for (const chess::Move &m : moves) {
        if (chess::uci::moveToUci(m) == move) {
            found = true;
            break;
        }
    }    

    if (!found) {
        connection.send_text("{\"error\": \"Invalid move\"}");
        return;
    }

    chess::Move m = chess::uci::uciToMove(board, move);
    board.makeMove(m);

    for (ws::ChessConnection *connection : connections) {
        connection->send("{\"move\": \"" + move + "\"}");
    }

    if (board.isGameOver().first == chess::GameResultReason::NONE) {
        state = ws::GameState::FINISHED;
        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"gameOver\": true}");
        }
    }
}

void ws::Game::handleJoin(crow::websocket::connection &connection, std::string name) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn != nullptr) {
        return;
    }

    connections.insert(new ws::ChessConnection(&connection, ws::ConnectionRole::SPECTATOR));
}

void ws::Game::handleTeam(crow::websocket::connection &connection, std::string team) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn == nullptr) {
        return;
    }

    if (getNumPlayers() == 2) {
        connection.send_text("{\"error\": \"Game is full\"}");
        return;
    }

    conn->setRole(ws::ConnectionRole::PLAYER);
    conn->setColor(team == "white" ? chess::Color::WHITE : chess::Color::BLACK);

    if (getNumPlayers() == 2) {
        state = ws::GameState::IN_PROGRESS;
        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"start\": true}");
        }
    }
}
