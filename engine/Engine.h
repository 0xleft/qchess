#pragma once

#include "../ws/include/chess.hpp"

class Engine {

private:
    chess::Board board;

public:
    Engine(std::string fen);
    ~Engine();
    float evaluate();
    void move(std::string move);
    void setFen(std::string fen);
};