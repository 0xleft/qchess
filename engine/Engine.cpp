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

	score += board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() - board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() - board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() - board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count();

	score += board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() * 1;
	score += board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() * 3;
	score += board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() * 3;
	score += board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() * 5;
	score += board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() * 9;

	score -= board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count() * 1;
	score -= board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count() * 3;
	score -= board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count() * 3;
	score -= board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count() * 5;
	score -= board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count() * 9;

	return score;
}

float Engine::evaluate(chess::Board& board) {
	float score = materialEval(board);

	return score;
}

float Engine::quiescence(float alpha, float beta, chess::Board& boardCopy) {
	float standPat = evaluate(boardCopy);

	if (standPat >= beta) {
		return beta;
	}

	if (alpha < standPat) {
		alpha = standPat;
	}

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	for (chess::Move move : legalMoves) {
		if (boardCopy.isCapture(move)) {
			boardCopy.makeMove(move);
			float eval = -quiescence(-beta, -alpha, boardCopy);
			boardCopy.unmakeMove(move);

			if (eval >= beta) {
				return beta;
			}

			if (eval > alpha) {
				alpha = eval;
			}
		}
	}

	return alpha;
}

float Engine::negamax(int depth, float alpha, float beta, chess::Board& boardCopy) {
	if (depth == 0) {
		return quiescence(alpha, beta, boardCopy);
	}

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, boardCopy);

	float maxEval = -100000;

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = -negamax(depth - 1, -beta, -alpha, boardCopy);
		boardCopy.unmakeMove(move);

		if (eval >= beta) {
			return beta;
		}

		if (eval > maxEval) {
			maxEval = eval;
		}

		if (eval > alpha) {
			alpha = eval;
		}
	}

	return maxEval;
}

std::string Engine::getBestMove(bool isWhite) {
	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	chess::Move bestMove = legalMoves[0];

	float maxEval = -100000;

	chess::Board boardCopy = chess::Board(board.getFen());

	for (chess::Move move : legalMoves) {
		boardCopy.makeMove(move);
		float eval = negamax(4, -100000, 100000, boardCopy) * (isWhite ? 1 : -1);
		boardCopy.unmakeMove(move);

		if (eval > maxEval) {
			maxEval = eval;
			bestMove = move;
		}

		std::cout << "Move: " << chess::uci::moveToUci(move) << " Eval: " << eval << std::endl;
	}

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