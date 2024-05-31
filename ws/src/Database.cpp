#include "Database.h"

ws::Database::Database() {
    init();
}

void ws::Database::init() {
    // pqxx::work w(conn);
    dbConnection->execute("CREATE TABLE IF NOT EXISTS games ("
        "id SERIAL PRIMARY KEY,"
        "game_id TEXT NOT NULL,"
        "moves TEXT[] NOT NULL"
    ")");

    dbConnection->prepare("insert_game", "INSERT INTO games (game_id, moves) VALUES ($1, $2)");
    dbConnection->prepare("select_game", "SELECT * FROM games WHERE game_id = $1");

}

void ws::Database::saveGame(ws::Game *game) {
    const auto tr = dbConnection->transaction();

    dbConnection->execute("insert_game", game->getGameId(), game->getMovesString());

    tr->commit();
}

ws::Game ws::Database::loadGame(const std::string &gameId) {
    // pqxx::work w(conn);
    // if (!utils::isAlphanumeric(gameId)) {
    //     return ws::Game();
    // }
    // pqxx::result r = w.exec("SELECT * FROM games WHERE game_id = '" + gameId + "'");
    // w.commit();
// 
    // if (r.empty()) {
    //     return ws::Game();
    // }

    ws::Game game;
    // game.setGameId(r[0]["game_id"].as<std::string>());
    // game.setMoves(r[0]["moves"].as<std::vector<std::string>>());

    return game;
}

