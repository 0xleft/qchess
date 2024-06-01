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
	board.setFen(fen);
}

void Engine::printFen() {
	std::cout << board.getFen() << std::endl;
}

float Engine::materialEval(chess::Board& board) {
	float score = 0;

	score += board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count() * 100;
	score += board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() - board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count() * 300;
	score += board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() - board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count() * 300;
	score += board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() - board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count() * 500;
	score += board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count() * 900;

	return score;
}

float Engine::evaluate(chess::Board& board) {
	this->nodes++;
	float score = 0;

	score += materialEval(board);

	return score * (board.sideToMove() == chess::Color::WHITE ? 1 : -1);
}

float Engine::negamax(int depth, chess::Board& boardCopy) {
	if (depth == 0) return evaluate(boardCopy);
	
	float max = -1000000;

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = -negamax(depth - 1, boardCopy);
		boardCopy.unmakeMove(move);
		if (eval > max) max = eval;
	}

	return max;
}

std::string Engine::getBestMove(bool isWhite) {
	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	this->nodes = 0;
	float max = -1000000;
	chess::Move bestMove = legalMoves[0];

	chess::Board boardCopy = chess::Board(board.getFen());

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = -negamax(3, boardCopy);
		boardCopy.unmakeMove(move);

		if (eval > max) {
			max = eval;
			bestMove = move;
		}

		std::cout << "Move: " << chess::uci::moveToUci(move) << " Eval: " << eval << std::endl;
	}

	std::cout << "Score: " << max << " Nodes: " << this->nodes << " Move: " << chess::uci::moveToUci(bestMove) << std::endl;
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