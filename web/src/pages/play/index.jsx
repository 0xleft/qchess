import Chessboard from '@/components/chess/Chessboard';
import * as React from 'react';

export default function PlayIndex() {
    return (
        <>
            <Button onClick={async () => {
                fetch('http://localhost:2425/ws/create').then(response => response.json()).then(data => {
                    router.push(`/play/${data.id}/${data.joinId}`);
                }).catch(console.error);
            }}>
                Create Game
            </Button>
        </>
    )
}