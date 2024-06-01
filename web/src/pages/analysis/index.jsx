import Chessboard from '@/components/chess/AnalysisChessboard';
import { Chess } from 'chess.js';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function AnalysisIndex() {

    const [engineLoaded, setEngineLoaded] = useState(false);
    const [boardState, setBoardState] = useState(new Chess());

    function onMove(move) {
        boardState.move(move);
    }

    const engine = useRef(null);

    function loadEngine() {
        if(typeof window.Engine === 'function' && WebAssembly.current === undefined){
            window.Engine().then((loadedEngine) => {
                engine.current = new loadedEngine.Engine();
                setEngineLoaded(true);
            });
        }
    }

    useEffect(() => {
        loadEngine();
    }, []);

    // todo remove this effect
    useEffect(() => {
        if(engineLoaded){
            console.log(engine.current.test());
        }
    }, [engineLoaded]);

    return (
        <>
            <Script src="/engine.js" strategy='beforeInteractive'/>

            <Chessboard onMove={onMove} fen={undefined} />
        </>
    )
}