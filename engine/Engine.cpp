#include "Engine.h"

#include <emscripten.h>
#include <emscripten/bind.h>

#ifdef __cplusplus
extern "C" {
#endif

Engine::Engine(std::string fen) {
	board = chess::Board(fen);
}

Engine::~Engine() {}

void Engine::move(std::string move) {
	chess::Move m = chess::uci::uciToMove(board, move);
    board.makeMove(m);
}

void Engine::setFen(std::string fen) {
	board = chess::Board(fen);
}

void Engine::printFen() {
	std::cout << board.getFen() << std::endl;
}

float Engine::evaluate() {
	if (board.isGameOver().first == chess::GameResultReason::CHECKMATE) {
		return (board.sideToMove() == chess::Color::WHITE ? -1000000 : 1000000);
	}

	return 0;
}

float Engine::minimax(int depth, bool isWhite, chess::Board& boardCopy) {
	if (depth == 0) return evaluate() * (isWhite ? 1 : -1);
	
	float score = (isWhite ? -100000 : 100000);

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = minimax(depth - 1, !isWhite, boardCopy);
		boardCopy.unmakeMove(move);
		if (eval > score) {
			score = eval;
		}
	}

	return score;
}

std::string Engine::getBestMove(bool isWhite) {
	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	float score = (isWhite ? -1000000 : 1000000);
	chess::Move bestMove;

	chess::Board boardCopy = chess::Board(board.getFen());

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = minimax(3, !isWhite, boardCopy);
		boardCopy.unmakeMove(move);
		if (eval > score) {
			score = eval;
			bestMove = move;
		}
	}

	std::cout << "Score: " << score << std::endl;
	return chess::uci::moveToUci(bestMove);
}

#ifdef __cplusplus
}
#endif

EMSCRIPTEN_BINDINGS (c) {
	emscripten::class_<Engine>("Engine")
		.constructor<std::string>()
		.function("move", &Engine::move)
		.function("setFen", &Engine::setFen)
		.function("printFen", &Engine::printFen)
		.function("getBestMove", &Engine::getBestMove);
}