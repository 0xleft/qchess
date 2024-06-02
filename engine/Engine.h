#pragma once

#include "../ws/include/chess.hpp"

class Engine {

private:
    chess::Board board;
    int nodes;

    float evaluate();
    float negamax(int depth);
    float quiescence(float alpha, float beta);
    float materialEval();
    float getPieceValue(chess::PieceType piece);


    int partition(chess::Movelist& moves, int low, int high);
    void quickSort(chess::Movelist& moves, int low, int high);
    void orderMoves(chess::Movelist& moves, bool isWhite);
public:
    Engine(std::string fen);
    ~Engine();
    void move(std::string move);
    void setFen(std::string fen);
    void printFen();
    std::string getBestMove(bool isWhite);
};