import { Chess, SQUARES } from "chess.js";
import { useState } from "react";
import Piece from "./Piece";

const Role = {
    WHITE: 'w',
    BLACK: 'b',
    SPECTATOR: 's'
};



export default function Chessboard({ id }) {
    const [boardState, setBoardState] = useState(new Chess()); // new Chess()
    const [role, setRole] = useState(Role.SPECTATOR);
    const [hoverSquare, setHoverSquare] = useState(null);

    // const client = new WebSocket('ws://localhost:8080/ws');
    // client.onopen = () => {
    //     console.log('WebSocket connection established');
    // };
    // client.onmessage = (message) => {
    //     const data = JSON.parse(message.data);
    //     if (data.type === 'state') {
    //     }
    // };

	return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 flex flex-row">
                    {Array.from({ length: 8 }).map((_, j) => (
                        <div key={j} className={`square ${i % 2 === j % 2 ? 'bg-white' : 'bg-black'} w-12 h-12`}
                            onMouseDown={() => {
                                if (boardState.get(SQUARES[8 * i + j])) {
                                    console.log(boardState.get(SQUARES[8 * i + j]));
                                }
                            }}

                            onMouseUp={() => {
                                if (hoverSquare) {
                                }
                            }}
                        >
                            {boardState.get(SQUARES[8 * i + j]) ? (
                                <Piece
                                    type={boardState.get(SQUARES[8 * i + j]).type}
                                    color={boardState.get(SQUARES[8 * i + j]).color}
                                    width={50}
                                    height={50}
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            ))}
		</>
    );
};