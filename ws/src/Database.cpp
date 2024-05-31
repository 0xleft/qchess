#include "Game.h"

ws::Database::Database() {
    init();
}

void ws::Database::init() {
    dbConnection->prepare("insert_game", "INSERT INTO games (game_id, moves) VALUES ($1, $2)");
    dbConnection->prepare("select_game", "SELECT * FROM games WHERE game_id = $1");
}

void ws::Database::saveGame(ws::Game *game) {
    tao::pq::result result = dbConnection->execute("insert_game", game->getGameId(), game->getMovesString());
    if (result.rows_affected() != 1) {
        throw std::runtime_error("Failed to save game");
    }
}

ws::Game* ws::Database::loadGame(std::string gameId) {
    if (gameId.empty()) {
        return nullptr;
    }

    if (!utils::isAlphanumeric(gameId)) {
        return nullptr;
    }

    tao::pq::result result = dbConnection->execute("select_game", gameId);
    if (result.size() != 1) {
        return nullptr;
    }

    ws::Game* game = new ws::Game();
    game->setGameId(result[0]["game_id"].as<std::string>());
    game->setMovesFromString(result[0]["moves"].as<std::string>());
    game->setCreated(result[0]["created_at"].as<std::string>());

    return game;
}

