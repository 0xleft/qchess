import * as React from 'react';
import { useRouter } from 'next/router';

export default function ViewID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
        </>
    );
}