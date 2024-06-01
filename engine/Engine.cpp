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
	float score = 0;

	score += materialEval(board);

	return score;
}

float Engine::minimax(int depth, bool isWhite, chess::Board& boardCopy) {
	if (depth == 0) return evaluate(boardCopy) * (isWhite ? 1 : -1);
	
	float score = (isWhite ? -1000000 : 1000000);

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = minimax(depth - 1, !isWhite, boardCopy);
		boardCopy.unmakeMove(move);
		if (isWhite && eval > score) {
			score = eval;
		}
		if (!isWhite && eval < score) {
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
		float eval = evaluate(boardCopy);
		boardCopy.unmakeMove(move);
		if (isWhite && eval > score) {
			score = eval;
			bestMove = move;
		}
		if (!isWhite && eval < score) {
			score = eval;
			bestMove = move;
		}
	}

	std::cout << "Score: " << score << "Board: " << board.getFen() << std::endl;
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