import { Chess } from "chess.js";
import Image from "next/image";
import { useState } from "react";



export default function Piece({ props, type, color, width, height }) {

	return (
        <Image {...props}
        draggable="false" src={`/pieces/${type}-${color}.svg`} alt={`${color} ${type}`} width={width} height={height} className="pointer-events-none"
        />
    );
};