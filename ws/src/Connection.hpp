#include <crow.h>
#include <unordered_set>

#ifndef CONNECTION_H
#define CONNECTION_H

namespace ws
{

enum class ConnectionRole {
    PLAYER,
    SPECTATOR
};

class ChessConnection {
private:
    crow::websocket::connection* connection;
    ConnectionRole role;
    chess::Color color;

    std::string id = "";

public:
    ChessConnection(crow::websocket::connection* connection, ConnectionRole role) {
        this->connection = connection;
        this->role = role;
    }
    std::string getId() {
        return id;
    }
    crow::websocket::connection* getConnection() {
        return connection;
    }
    ConnectionRole getRole() {
        return role;
    }
    chess::Color getColor() {
        return color;
    }

    void setColor(chess::Color color) {
        this->color = color;
    }
    void setRole(ConnectionRole role) {
        this->role = role;
    }
    void setId(const std::string& id) {
        this->id = id;
    }

    void send(const std::string& message) {
        connection->send_text(message);
    }

    ~ChessConnection() {
        connection->close();
    }
};

} // namespace ws

#endif