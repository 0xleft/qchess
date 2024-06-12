#include <crow.h>
#include <vector>
#include <mutex>
#include "Game.h"
#include <cpr/cpr.h>

int main() {
	std::cout << "Starting server... :)" << std::endl;

	crow::Crow<> app;
	// app.loglevel(crow::LogLevel::WARNING);

	std::mutex mtx;
	std::vector<ws::Game*> games;

	// start thread to check for inactive games
	std::thread([&]() {
		while (true) {
			std::this_thread::sleep_for(std::chrono::seconds(1));
			std::lock_guard<std::mutex> _(mtx);
			for (ws::Game* game : games) {
				if (game->hasExpired()) {
					// todo
					std::cout << "Game " << game->getGameId() << " has expired" << std::endl;
					if (game->getMoves().size() > 0) {
						crow::json::wvalue json;
						json["gameId"] = game->getGameId();
						json["winner"] = game->getWinner();
						json["moves"] = game->getMovesString();
						json["playedAt"] = game->getCreated();

						auto response = cpr::Post(cpr::Url{"http://qchess-web:3000/api/ws/uploadGame"}, cpr::Body{json.dump()}, cpr::Header{{"Content-Type", "application/json"}});
						std::cout << response.text << std::endl;
						std::cout << "Game " << game->getGameId() << " has been uploaded" << std::endl;
					}

					delete game;
				}
			}

			games.erase(std::remove_if(games.begin(), games.end(), [](ws::Game* game) {
				return game->hasExpired();
			}), games.end());
		}
	}).detach();

	CROW_WEBSOCKET_ROUTE(app, "/ws/socket")
		.onopen([&](crow::websocket::connection& conn) {
			std::lock_guard<std::mutex> _(mtx);
		})
		.onclose([&](crow::websocket::connection& conn, const std::string& reason) {
			std::lock_guard<std::mutex> _(mtx);
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
			game->setPrivate(std::string(req.url_params.get("private")) == "true");
			if (req.url_params.get("time")) {
				game->setInitialTime(std::stoi(req.url_params.get("time")));
			}
			if (req.url_params.get("increment")) {
				game->setIncrement(std::stoi(req.url_params.get("increment")));
			}
			games.push_back(game);

			crow::json::wvalue json({
				{"id", game->getGameId()}
			});

			json["whiteId"] = game->getWhiteId();
			json["blackId"] = game->getBlackId();

			crow::response response;
			response.set_header("Content-Type", "application/json");
			response.write(json.dump());
			return response;
		});

	CROW_ROUTE(app, "/ws/public")
		([&](const crow::request& req) {
			std::lock_guard<std::mutex> _(mtx);
			crow::json::wvalue json;
			
			int skip = 0;
			if (req.url_params.get("skip")) {
				skip = std::stoi(req.url_params.get("skip"));
			}

			int count = 0;

			for (int i = games.size() - 1; i >= 0; i--) {
				ws::Game* game = games[i];
				if (!game->isPrivate() && game->getGameState() == ws::GameState::WAITING) {
					skip--;
					if (skip >= 0) {
						continue;
					}
					count++;
					if (count > 10) {
						break;
					}
					crow::json::wvalue gameJson({
						{"id", game->getGameId()},
						{"whiteId", game->hasWhiteJoinedGame() ? "" : game->getWhiteId()},
						{"blackId", game->hasBlackJoinedGame() ? "" : game->getBlackId()},
						{"whiteTime", game->getWhiteTime()},
						{"blackTime", game->getBlackTime()},
						{"created", game->getCreated()},
						{"increment", game->getIncrement()}
					});
					json[std::to_string(count)] = gameJson.dump();
				}
			}

			crow::response response;
			response.set_header("Content-Type", "application/json");
			response.write(json.dump());
			return response;
		});

	app.port(2425)
		.multithreaded()
		.run();

	return 0;
}