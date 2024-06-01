#pragma once

#include "../ws/include/chess.hpp"

class Engine {

private:
    chess::Board board;
    int nodes;

    float evaluate(chess::Board& board);
    float negamax(int depth, chess::Board& board);
    float materialEval(chess::Board& board);

public:
    Engine(std::string fen);
    ~Engine();
    void move(std::string move);
    void setFen(std::string fen);
    void printFen();
    std::string getBestMove(bool isWhite);
};