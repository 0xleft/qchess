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

float Engine::getPieceValue(chess::PieceType piece) {
	switch (piece.internal()) {
		case chess::PieceType::PAWN:
			return 1;
		case chess::PieceType::KNIGHT:
			return 3;
		case chess::PieceType::BISHOP:
			return 3;
		case chess::PieceType::ROOK:
			return 5;
		case chess::PieceType::QUEEN:
			return 9;
		default:
			return 0;
	}
}

float Engine::materialEval() {
	float score = 0;

	score += board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() - board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() - board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() - board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count();
	score += board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() - board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count();

	score += board.pieces(chess::PieceType::PAWN, chess::Color::WHITE).count() * getPieceValue(chess::PieceType::PAWN);
	score += board.pieces(chess::PieceType::KNIGHT, chess::Color::WHITE).count() * getPieceValue(chess::PieceType::KNIGHT);
	score += board.pieces(chess::PieceType::BISHOP, chess::Color::WHITE).count() * getPieceValue(chess::PieceType::BISHOP);
	score += board.pieces(chess::PieceType::ROOK, chess::Color::WHITE).count() * getPieceValue(chess::PieceType::ROOK);
	score += board.pieces(chess::PieceType::QUEEN, chess::Color::WHITE).count() * getPieceValue(chess::PieceType::QUEEN);

	score -= board.pieces(chess::PieceType::PAWN, chess::Color::BLACK).count() * getPieceValue(chess::PieceType::PAWN);
	score -= board.pieces(chess::PieceType::KNIGHT, chess::Color::BLACK).count() * getPieceValue(chess::PieceType::KNIGHT);
	score -= board.pieces(chess::PieceType::BISHOP, chess::Color::BLACK).count() * getPieceValue(chess::PieceType::BISHOP);
	score -= board.pieces(chess::PieceType::ROOK, chess::Color::BLACK).count() * getPieceValue(chess::PieceType::ROOK);
	score -= board.pieces(chess::PieceType::QUEEN, chess::Color::BLACK).count() * getPieceValue(chess::PieceType::QUEEN);

	return score;
}

int Engine::partition(chess::Movelist& moves, int low, int high) {
	chess::Move pivot = moves[high];
	int i = low - 1;

	for (int j = low; j <= high - 1; j++) {
		if (moves[j].score() < pivot.score()) {
			i++;
			std::swap(moves[i], moves[j]);
		}
	}

	std::swap(moves[i + 1], moves[high]);
	return i + 1;
}

void Engine::quickSort(chess::Movelist& moves, int low, int high) {
	if (low < high) {
		int pi = partition(moves, low, high);

		quickSort(moves, low, pi - 1);
		quickSort(moves, pi + 1, high);
	}
}

void Engine::orderMoves(chess::Movelist& moves, bool isWhite) {
	for (chess::Move& move : moves) {
		// promotions
		if (move.PROMOTION) {
			move.setScore(100);
		}

		// captures
		if (board.isCapture(move)) {
			move.setScore(move.score() + getPieceValue(board.at(move.to()).type()) * 10);
		}

		// enemy pawn attacks
		chess::Bitboard pawnAttacks = board.pieces(chess::PieceType::PAWN, isWhite ? chess::Color::BLACK : chess::Color::WHITE).getBits();
		
		if (pawnAttacks.check(move.to().index())) {
			move.setScore(move.score() - getPieceValue(board.at(move.from()).type()) * 10);
		}
	}

	quickSort(moves, 0, moves.size() - 1);
}

float Engine::evaluate() {
	float score = materialEval();

	this->nodes++;

	return score;
}

float Engine::quiescence(float alpha, float beta) {
	float standPat = evaluate();

	if (standPat >= beta) {
		return beta;
	}

	if (alpha < standPat) {
		alpha = standPat;
	}

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	for (chess::Move move : legalMoves) {
		if (board.isCapture(move)) {
			board.makeMove(move);
			float eval = -quiescence(-beta, -alpha);
			board.unmakeMove(move);

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

float Engine::negamax(int depth) {
	if (depth == 0) {
		return evaluate();
	}

	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	// orderMoves(legalMoves, board, board.sideToMove() == chess::Color::WHITE);

	float maxEval = -100000;

	for (chess::Move move : legalMoves) {
		board.makeMove(move);
		float eval = -negamax(depth - 1);
		board.unmakeMove(move);

		if (eval > maxEval) {
			maxEval = eval;
		}
	}

	return maxEval;
}

std::string Engine::getBestMove(bool isWhite) {
	chess::Movelist legalMoves;
	chess::movegen::legalmoves(legalMoves, board);

	chess::Move bestMove = legalMoves[0];

	this->nodes = 0;
	float maxEval = -100000;

	for (chess::Move move : legalMoves) {
		board.makeMove(move);
		float eval = negamax(3) * (isWhite ? -1 : 1);
		board.unmakeMove(move);

		if (eval > maxEval) {
			maxEval = eval;
			bestMove = move;
		}

		std::cout << "Move: " << chess::uci::moveToUci(move) << " Eval: " << eval << " Nodes: " << this->nodes << std::endl;
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