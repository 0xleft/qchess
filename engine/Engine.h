#pragma once

#include "../ws/include/chess.hpp"

class Engine {

private:
    chess::Board board;

    float evaluate();
    float minimax(int depth, bool isWhite, chess::Board& board);

public:
    Engine(std::string fen);
    ~Engine();
    void move(std::string move);
    void setFen(std::string fen);
    void printFen();
    std::string getBestMove(bool isWhite);
};