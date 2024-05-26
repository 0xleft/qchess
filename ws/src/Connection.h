#include <crow.h>
#include <unordered_set>

#ifndef CONNECTION_H
#define CONNECTION_H

namespace ws
{

enum class ConnectionRole {
    WHITE,
    BLACK,
    SPECTATOR
};

class ChessConnection {
private:
    crow::websocket::connection* connection;
    ConnectionRole role;

public:
    ChessConnection(crow::websocket::connection* connection, ConnectionRole role) {
        this->connection = connection;
        this->role = role;
    }
    crow::websocket::connection* getConnection() {
        return connection;
    }
    ConnectionRole getRole() {
        return role;
    }
};

} // namespace ws

#endif