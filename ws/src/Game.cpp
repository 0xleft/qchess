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

    if (!json.has("move")) {
        connection.send_text("{\"error\": \"Invalid move\"}");
        return;
    }

    std::string move = json["move"].s();

    chess::Movelist movelist;
    chess::movegen::legalmoves(movelist, board);

    bool found = false;
    for (const chess::Move &m : movelist) {
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
    moves.push_back(move);

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

    if (!json.has("joinId")) {
        connection.send_text("{\"error\": \"Invalid join request\"}");
        return;
    }

    std::string joinId = json["joinId"].s();
    
    ws::ChessConnection *newConnection = new ws::ChessConnection(&connection, ws::ConnectionRole::SPECTATOR);

    bool spectator = false;

    if (joinId == whiteId) {
        newConnection->setColor(chess::Color::WHITE);
        newConnection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(newConnection);
    } else if (joinId == blackId) {
        newConnection->setColor(chess::Color::BLACK);
        newConnection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(newConnection);
    } else {
        spectator = true;
        connections.push_back(newConnection);
    }

    newConnection->send("{\"gameId\": \"" + gameId + "\", \"color\": \"" + (newConnection->getColor() == chess::Color::BLACK ? "black" : "white") + "\", \"role\": \"" + (newConnection->getRole() == ws::ConnectionRole::PLAYER ? "player" : "spectator") + "\"}");
    newConnection->send("{\"board\": \"" + board.getFen() + "\"}");

    if (getNumPlayers() == 2 && !spectator) {
        state = ws::GameState::IN_PROGRESS;

        for (ws::ChessConnection *w_connection : connections) {
            w_connection->send("{\"playing\": true}");
        }
    }
}