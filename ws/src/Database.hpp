#include <iostream>
#include <pqxx/pqxx>
#include <vector>
#include <string>

#ifndef DATABASE_H
#define DATABASE_H

#include "Game.h"

namespace ws
{
    class Database
    {
    private:
        pqxx::connection conn;

    public:
        Database() {
            conn = pqxx::connection("dbname=mydb user=keutoi");
        }

        void createSchema() {
            pqxx::work w(conn);
            w.exec("CREATE TABLE IF NOT EXISTS games ("
                    "id SERIAL PRIMARY KEY,"
                    "game_id TEXT NOT NULL,"
                    "moves TEXT[] NOT NULL,"
                    ")");
            w.commit();
        }

        void saveGame(ws::Game* game) {
            pqxx::work w(conn);
            w.exec("INSERT INTO games (game_id, moves) VALUES ('" + game->getGameId() + "', '{" + game->getMovesString() + "}')");
            w.commit();
        }

        ws::Game loadGame(const std::string& gameId) {
            pqxx::work w(conn);
            if (!isAlphanumeric(gameId)) {
                return ws::Game();
            }
            pqxx::result r = w.exec("SELECT * FROM games WHERE game_id = '" + gameId + "'");
            w.commit();

            if (r.empty()) {
                return ws::Game();
            }

            ws::Game game;
            // game.setGameId(r[0]["game_id"].as<std::string>());
            // game.setMoves(r[0]["moves"].as<std::vector<std::string>>());

            return game;
        }
    };

} // namespace ws

#endif