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

	score += (board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count()) * 1;
	score += (board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() - board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count()) * 3;
	score += (board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() - board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count()) * 3;
	score += (board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() - board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count()) * 5;
	score += (board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count()) * 9;

	return score;
}

float Engine::evaluate(chess::Board& board) {
	this->nodes++;
	float score = 0;

	score += materialEval(board);

	return score * (board.sideToMove() == chess::Color::WHITE ? 1 : -1);
}

float Engine::quiescence(float alpha, float beta, chess::Board& boardCopy) {
	float stand_pat = evaluate(boardCopy);
	if (stand_pat >= beta) return beta;
	if (alpha < stand_pat) alpha = stand_pat;

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		if (boardCopy.isCapture(move)) {
			boardCopy.makeMove(move);
			float score = -quiescence(-beta, -alpha, boardCopy);
			boardCopy.unmakeMove(move);

			if (score >= beta) return beta;
			if (score > alpha) alpha = score;
		}
	}

	return alpha;
}

float Engine::negamax(int depth, float alpha, float beta, chess::Board& boardCopy) {
	if (depth == 0) return quiescence(alpha, beta, boardCopy);
	
	float max = -1000000;

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float score = -negamax(depth - 1, -alpha, -beta, boardCopy);
		boardCopy.unmakeMove(move);

		if (score >= beta) return score;
		if (score > max) {
			max = score;
			if (score > alpha) {
				alpha = score;
			}
		} 
	}

	return alpha;
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
		float eval = -negamax(4, -100000, 100000, boardCopy);
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