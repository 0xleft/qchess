#include "Engine.h"

#include <emscripten.h>
#include <emscripten/bind.h>

#ifdef __cplusplus
extern "C" {
#endif

Engine::Engine(std::string fen) {
	board = chess::Board(fen);
}

Engine::~Engine() {
}

float Engine::evaluate() {
	return 42;
}

void Engine::move(std::string move) {
	chess::Move m = chess::uci::uciToMove(board, move);
    board.makeMove(m);
}

void Engine::setFen(std::string fen) {
	board = chess::Board(fen);
}

#ifdef __cplusplus
}
#endif

EMSCRIPTEN_BINDINGS (c) {
	emscripten::class_<Engine>("Engine")
		.constructor<std::string>()
		.function("move", &Engine::move)
		.function("setFen", &Engine::setFen)
		.function("evaluate", &Engine::evaluate);
}