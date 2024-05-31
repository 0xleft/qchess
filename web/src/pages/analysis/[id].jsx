import * as React from 'react';
import { useRouter } from 'next/router';

export default function AnalysisID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
        </>
    );
}