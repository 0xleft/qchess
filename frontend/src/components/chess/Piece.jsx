import { Chess } from "chess.js";
import Image from "next/image";
import { useState } from "react";



export default function Piece({ type, color, width, height }) {

	return (
        <>
            <div className="piece">
                <Image src={`/pieces/${type}-${color}.svg`} alt={`${color} ${type}`} width={width} height={height} />
            </div>
		</>
    );
};