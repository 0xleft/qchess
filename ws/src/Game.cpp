#include "Game.h"

void ws::Game::handleMove(crow::websocket::connection &connection, crow::json::rvalue json) {
    ws::ChessConnection *conn = getConnection(connection);
    if (conn == nullptr) {
        connection.send_text("{\"error\": \"Not in game\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

    if (conn->getRole() == ws::ConnectionRole::SPECTATOR) {
        conn->send("{\"error\": \"Spectators cannot make moves\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

    if (state != ws::GameState::IN_PROGRESS) {
        conn->send("{\"error\": \"Game not in progress\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

    if (!json.has("move")) {
        connection.send_text("{\"error\": \"Invalid move\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

    std::string move = json["move"].s();

    if (std::string(move) == "resign") {
        winner = conn->getColor() == chess::Color::WHITE ? "black" : "white";
        state = ws::GameState::FINISHED;
        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"gameOver\": true}");
            connection->send("{\"winner\": \"" + winner + "\"}");
        }
        return;
    }

    if (std::string(move) == "draw") {
        if (conn->getColor() == chess::Color::WHITE) {
            whiteOfferedDraw = true;

            if (blackOfferedDraw) {
                winner = "draw";
                state = ws::GameState::FINISHED;
                for (ws::ChessConnection *connection : connections) {
                    connection->send("{\"gameOver\": true}");
                    connection->send("{\"winner\": \"draw\"}");
                }
            }
        } else {
            blackOfferedDraw = true;

            if (whiteOfferedDraw) {
                winner = "draw";
                state = ws::GameState::FINISHED;
                for (ws::ChessConnection *connection : connections) {
                    connection->send("{\"gameOver\": true}");
                    connection->send("{\"winner\": \"draw\"}");
                }
            }
        }

        lastDrawOffer = std::chrono::system_clock::now();

        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"drawOffered\": true}");
        }

        return;
    }

    if (board.sideToMove() != conn->getColor()) {
        conn->send("{\"error\": \"Not your turn\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

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
        connection.send_text("{\"error\": \"Invalid move\", \"board\": \"" + board.getFen() + "\"}");
        return;
    }

    incrementTime();

    chess::Move m = chess::uci::uciToMove(board, move);
    board.makeMove(m);
    moves.push_back(move);

    lastMove = std::chrono::system_clock::now();

    for (ws::ChessConnection *connection : connections) {
        connection->send("{\"board\": \"" + board.getFen() + "\"}");
    }

    if (board.isGameOver().first != chess::GameResultReason::NONE) {
        winner = board.isGameOver().first == chess::GameResultReason::CHECKMATE ? (board.sideToMove() == chess::Color::WHITE ? "black" : "white") : "draw";
        state = ws::GameState::FINISHED;
        for (ws::ChessConnection *connection : connections) {
            connection->send("{\"gameOver\": true}");
            connection->send("{\"winner\": \"" + winner + "\"}");
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
        if (hasWhiteJoined && json["reconnectId"].s() != reconnectWhiteId) {
            newConnection->send("{\"error\": \"Incorrect reconnectId\"}");
            delete newConnection;
            return;
        }
        if (!hasWhiteJoined) {
            newConnection->send("{\"reconnectId\": \"" + reconnectWhiteId + "\"}");
        }

        newConnection->setColor(chess::Color::WHITE);
        newConnection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(newConnection);
        hasWhiteJoined = true;
    } else if (joinId == blackId) {
        if (hasBlackJoined && json["reconnectId"].s() != reconnectBlackId) {
            newConnection->send("{\"error\": \"Incorrect reconnectId\"}");
            delete newConnection;
            return;
        }
        if (!hasBlackJoined) {
            newConnection->send("{\"reconnectId\": \"" + reconnectBlackId + "\"}");
        }

        newConnection->setColor(chess::Color::BLACK);
        newConnection->setRole(ws::ConnectionRole::PLAYER);
        connections.push_back(newConnection);
        hasBlackJoined = true;
    } else {
        spectator = true;
        connections.push_back(newConnection);
    }

    for (ws::ChessConnection *connection : connections) {
        if (connection->getColor() == newConnection->getColor() && connection != newConnection) {
            newConnection->setRole(ws::ConnectionRole::SPECTATOR);
            break;
        }
    }

    newConnection->send("{\"gameId\": \"" + gameId + "\", \"color\": \"" + (newConnection->getColor() == chess::Color::BLACK ? "black" : "white") + "\", \"role\": \"" + (newConnection->getRole() == ws::ConnectionRole::PLAYER ? "player" : "spectator") + "\", \"whiteTime\": " + std::to_string(initialWhiteTime) + ", \"blackTime\": " + std::to_string(initialBlackTime) + ", \"increment\": " + std::to_string(increment) + "}");
    newConnection->send("{\"board\": \"" + board.getFen() + "\"}");

    if (getNumPlayers() == 2 && !spectator && state == ws::GameState::WAITING) {
        state = ws::GameState::IN_PROGRESS;
    }
}