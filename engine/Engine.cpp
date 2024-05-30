//#include "../ws/include/chess.hpp"
#include "Engine.h"
#include <math.h>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#ifdef __cplusplus
extern "C" {
#endif

int main() {
    
    // chess::Board board = chess::Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
// 
    // chess::Movelist moves;
    // chess::movegen::legalmoves(moves, board);
// 
    // for (const auto &move : moves) {
    //     std::cout << chess::uci::moveToUci(move) << std::endl;
    // }


    return 0;
}

int int_sqrt(int x) {
  return sqrt(x);
}

#ifdef __cplusplus
}
#endif