#include "Game.h"

void ws::Game::handleMove(crow::websocket::connection &connection, crow::json::rvalue json) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn == nullptr) {
        connection.send_text("{\"error\": \"Not in game\"}");
        return;
    }

    if (conn->getRole() == ws::ConnectionRole::SPECTATOR) {
        conn->send("{\"error\": \"Spectators cannot make moves\"}");
        return;
    }

    if (state != ws::GameState::IN_PROGRESS) {
        conn->send("{\"error\": \"Game not in progress\"}");
        return;
    }

    if (board.sideToMove() != conn->getColor()) {
        conn->send("{\"error\": \"Not your turn\"}");
        return;
    }

    std::string move = json["move"].s();

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
        connection->send("{\"board\": \"" + board.getFen() + "\"}");
    }

    if (board.isGameOver().first != chess::GameResultReason::NONE) {
        state = ws::GameState::FINISHED;
        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"gameOver\": true}");
        }
    }
}

void ws::Game::handleJoin(crow::websocket::connection &connection, crow::json::rvalue json) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn != nullptr) {
        return;
    }

    std::string joinId = json["joinId"].s();
    
    ws::ChessConnection *ws_connection = new ws::ChessConnection(&connection, ws::ConnectionRole::SPECTATOR);

    bool spectator = false;    

    if (joinId == whiteId) {
        ws_connection->setColor(chess::Color::WHITE);
        ws_connection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(ws_connection);
    } else if (joinId == blackId) {
        ws_connection->setColor(chess::Color::BLACK);
        ws_connection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(ws_connection);
    } else {
        spectator = true;
        connections.push_back(ws_connection);
    }

    ws_connection->send("{\"gameId\": \"" + gameId + "\", \"color\": \"" + (ws_connection->getColor() == chess::Color::WHITE ? "white" : "black") + "\", \"role\": \"" + (ws_connection->getRole() == ws::ConnectionRole::PLAYER ? "player" : "spectator") + "\"}");
    ws_connection->send("{\"board\": \"" + board.getFen() + "\"}");

    if (getNumPlayers() == 2 && !spectator) {
        state = ws::GameState::IN_PROGRESS;

        for (ws::ChessConnection *connection : connections) {
            ws_connection->send("{\"playing\": true}");
        }
    }
}