import * as React from 'react';
import { useRouter } from 'next/router';

export default function ExploreID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
        </>
    );
}