#include "../ws/include/chess.hpp"
#include "Engine.h"

int main() {
    
    chess::Board board = chess::Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    chess::Movelist moves;
    chess::movegen::legalmoves(moves, board);

    for (const auto &move : moves) {
        std::cout << chess::uci::moveToUci(move) << std::endl;
    }


    return 0;
}