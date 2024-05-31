#include <iostream>
#include <vector>
#include <string>
#include <tao/pq.hpp>

#ifndef DATABASE_H
#define DATABASE_H

#include "Game.h"

namespace ws
{
    class Database
    {
    private:
        std::shared_ptr<tao::pq::connection> dbConnection = tao::pq::connection::create("dbname=movedb user=postgres password=postgres host=localhost");

    public:
        Database();

        void init();
        void saveGame(ws::Game* game);

        ws::Game loadGame(const std::string& gameId);
    };

} // namespace ws

#endif