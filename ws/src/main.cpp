#include <crow.h>
#include <vector>
#include <mutex>
#include "Game.h"

int main() {
	crow::Crow<> app;

	std::mutex mtx;
	std::vector<crow::websocket::connection*> users;
	std::vector<ws::Game*> games;

	// start thread to check for inactive games
	std::thread([&]() {
		while (true) {
			std::this_thread::sleep_for(std::chrono::seconds(1));
			std::lock_guard<std::mutex> _(mtx);
			for (ws::Game* game : games) {
				if (game->hasExpired()) {
					delete game;
				}
			}

			games.erase(std::remove_if(games.begin(), games.end(), [](ws::Game* game) {
				return game->hasExpired();
			}), games.end());
		}
	}).detach();

	CROW_WEBSOCKET_ROUTE(app, "/ws")
		.onopen([&](crow::websocket::connection& conn) {
			std::lock_guard<std::mutex> _(mtx);
			users.push_back(&conn);
		})
		.onclose([&](crow::websocket::connection& conn, const std::string& reason) {
			std::lock_guard<std::mutex> _(mtx);
			users.erase(std::remove(users.begin(), users.end(), &conn), users.end());
			for (ws::Game* game : games) {
				ws::ChessConnection* connection = game->getConnection(conn);
				if (connection) {
					game->removeConnection(connection);
					delete connection;
				}
			}
		})
	  	.onmessage([&](crow::websocket::connection& conn, const std::string& data, bool is_binary) {
			std::lock_guard<std::mutex> _(mtx);
			if (is_binary) {
				return;
			}

			crow::json::rvalue json = crow::json::load(data);
			if (!json) {
				return;
			}

			// handle create message
			if (json.has("create")) {
				ws::Game* game = new ws::Game(conn);
				games.push_back(game);

				conn.send_text("{\"gameId\": \"" + game->getGameId() + "\"}");
				return;
			}

			// handle join message
			if (json.has("join")) {
				ws::Game* game = ws::Game::getGame(json["join"].s(), games);

				if (!game) {
					conn.send_text("{\"error\": \"Game not found\"}");
					return;
				}

				game->handleJoin(conn, json["join"].s());
				return;
			}


			if (json.has("team")) {
				ws::Game* game = ws::Game::getGame(conn, games);

				if (!game) {
					conn.send_text("{\"error\": \"Game not found\"}");
					return;
				}

				game->handleTeam(conn, json["team"].s());
				return;
			}

			// handle move message
			if (json.has("move")) {
				ws::Game* game = ws::Game::getGame(conn, games);

				if (!game) {
					conn.send_text("{\"error\": \"Game not found\"}");
					return;
				}

				game->handleMove(conn, json["move"].s());
				return;
			}
		});

	app.port(2425)
		.multithreaded()
		.run();

	return 0;
}