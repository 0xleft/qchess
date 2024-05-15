import * as React from 'react';
import { useRouter } from 'next/router';

export default function PlayID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
            <h1>Play {id}</h1>
        </>
    );
}