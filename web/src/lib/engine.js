class ChessEngine {
    constructor(engine) {
        this.engine = engine;
        this.boardState = null;
        this.depth = 0;
        this.score = 0;
        this.bestMove = null;
        this.ponder = null;
        this.moveLine = [];
        this.searching = false;
        this.bestMoveListeners = [];

        this.engine.addMessageListener((event) => {

            console.log(event);
            if (event.startsWith('bestmove')) {
                const [_, bestMove, __, ponder] = event.split(' ');
                this.bestMove = bestMove;
                this.ponder = ponder;

                this.bestMoveListeners.forEach((listener) => {
                    listener({
                        bestMove: this.bestMove,
                        ponder: this.ponder,
                        score: this.score,
                        moveLine: this.moveLine,
                        depth: this.depth
                    });
                });
            }

            if (event.startsWith('info')) {
                this.bestMoveListeners.forEach((listener) => {
                    listener({
                        bestMove: this?.moveLine[0],
                        ponder: this.ponder, 
                        score: this.score, 
                        moveLine: this.moveLine, 
                        depth: this.depth 
                    });
                });
                const info = event.split(' ');

                if (info.includes('depth')) {
                    this.depth = parseInt(info[info.indexOf('depth') + 1]);
                }

                if (info.includes('score')) {
                    const scoreIndex = info.indexOf('score') + 1;
                    const score = info[scoreIndex];

                    if (score === 'cp') {
                        this.score = parseInt(info[scoreIndex + 1]);
                    } else if (score === 'mate') {
                        this.score = `Mate in ${parseInt(info[scoreIndex + 1])}`;
                    }
                }

                if (info.includes('pv')) {
                    const pvIndex = info.indexOf('pv') + 1;
                    if (info.slice(pvIndex).length === 1) {
                        return;
                    }
                    this.moveLine = info.slice(pvIndex);
                }
            }
        });
    }

    addBestMoveListener(listener) {
        this.bestMoveListeners.push(listener);
    };

    setBoardState(boardState) {
        this.boardState = boardState;
    }

    getScore() {
        return this.score;
    }

    getBestMove() {
        return this.bestMove;
    }

    getMoveLine() {
        return this.moveLine;
    }

    stop() {
        this.engine.postMessage('stop');
    }
    
    async search(depth, time) {
        if (this.searching) {
            this.engine.postMessage('stop');
            setTimeout(() => {
                this.searching = false;
                return this.search(depth, time);
            }, 100);
        }
        if (this.boardState === null) {
            throw new Error('Board state not set');
        }

        this.searching = true;
        this.engine.postMessage(`position fen ${this.boardState.fen()}`);
        this.engine.postMessage(`go depth ${depth} movetime ${time}`);

        return new Promise((resolve) => {
            setTimeout(() => {
                this.searching = false;
                this.engine.postMessage('stop');

                setTimeout(() => {
                    resolve({
                        bestMove: this.bestMove,
                        ponder: this.ponder,
                        score: this.score,
                        moveLine: this.moveLine,
                        depth: this.depth,                        
                    });
                }, 100);
            }, time);
        });
    }

    async search(depth) {
        if (this.searching) {
            this.engine.postMessage('stop');
            setTimeout(() => {
                this.searching = false;
                return this.search(depth);
            }, 100);
        }
        if (this.boardState === null) {
            throw new Error('Board state not set');
        }

        this.searching = true;
        this.engine.postMessage(`position fen ${this.boardState.fen()}`);
        this.engine.postMessage(`go depth ${depth}`);

        return new Promise((resolve) => {
            this.addBestMoveListener((bestMove, ponder, score, moveLine, depth) => {
                if (depth === depth) {
                    this.searching = false;
                    resolve({
                        bestMove: bestMove,
                        ponder: ponder,
                        score: score,
                        moveLine: moveLine,
                        depth: depth,
                    });
                }
            });
        });
    }
}

export default ChessEngine;