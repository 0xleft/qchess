#include <crow.h>
#include <unordered_set>
#include <mutex>
#include "Game.h"

void onMessage(crow::websocket::connection& conn, const std::string& data, bool is_binary) {
}

int main() {

	crow::SimpleApp app;

	std::mutex mtx;
	std::unordered_set<crow::websocket::connection*> users;
	std::unordered_set<ws::Game*> games;

	CROW_WEBSOCKET_ROUTE(app, "/ws")
		.onopen([&](crow::websocket::connection& conn) {
			std::lock_guard<std::mutex> _(mtx);
			users.insert(&conn);
		})
		.onclose([&](crow::websocket::connection& conn, const std::string& reason) {
			std::lock_guard<std::mutex> _(mtx);
			users.erase(&conn);
		})
	  	.onmessage([&](crow::websocket::connection& conn, const std::string& data, bool is_binary) {
			std::lock_guard<std::mutex> _(mtx);
			for (auto u : users) {
				if (u != &conn) {
					u->send_text(data);
				}
			}
		});


	app.port(8080)
		.multithreaded()
		.run();

	return 0;
}