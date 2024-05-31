#include <crow.h>
#include <vector>
#include <mutex>
#include "Game.h"

int main() {
	std::cout << "Starting server... :)" << std::endl;

	crow::Crow<> app;

	std::mutex mtx;
	std::vector<crow::websocket::connection*> users;
	std::vector<ws::Game*> games;

	ws::Database database;

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

			if (!json.has("type")) {
				return;
			}

			if (json["type"].s() == "join") {
				ws::Game* game = ws::Game::getGame(json["id"].s(), games);

				if (!game) {
					conn.send_text("{\"error\": \"Game not found\"}");
					return;
				}

				game->handleJoin(conn, json);
				return;
			}

			if (json["type"].s() == "move") {
				ws::Game* game = ws::Game::getGame(json["id"].s(), games);

				if (!game) {
					conn.send_text("{\"error\": \"Game not found\"}");
					return;
				}

				game->handleMove(conn, json);
				return;
			}
		});

	CROW_ROUTE(app, "/ws/create")
		([&](const crow::request& req) {
			std::lock_guard<std::mutex> _(mtx);
			ws::Game* game = new ws::Game();
			game->setPrivate(req.url_params.get("private") == "true");
			games.push_back(game);

			crow::json::wvalue json({
				{"id", game->getGameId()}
			});

			json["whiteId"] = game->getWhiteId();
			json["blackId"] = game->getBlackId();

			crow::response response;
			response.set_header("Content-Type", "application/json");
			response.write(json.dump());
			response.set_header("Access-Control-Allow-Origin", "*"); // for development purposes only
			return response;
		});

	CROW_ROUTE(app, "/ws/game")
		([&](const crow::request& req) {

			if (!req.url_params.get("id")) {
				crow::response response;
				response.set_header("Content-Type", "application/json");
				response.write("{\"error\": \"Invalid request\"}");
				response.set_header("Access-Control-Allow-Origin", "*"); // for development purposes only
				return response;
			}

			ws::Game* game = database.loadGame(req.url_params.get("id"));

			if (!game) {
				crow::response response;
				response.set_header("Content-Type", "application/json");
				response.write("{\"error\": \"Game not found\"}");
				response.set_header("Access-Control-Allow-Origin", "*"); // for development purposes only
				return response;
			}

			crow::json::wvalue json({
				{"id", game->getGameId()},
				{"whiteId", game->getWhiteId()},
				{"blackId", game->getBlackId()},
				{"moves", game->getMovesString()}
			});

			delete game;

			crow::response response;
			response.set_header("Content-Type", "application/json");
			response.write(json.dump());
			response.set_header("Access-Control-Allow-Origin", "*"); // for development purposes only
			return response;
		});

	app.port(2425)
		.multithreaded()
		.run();

	return 0;
}