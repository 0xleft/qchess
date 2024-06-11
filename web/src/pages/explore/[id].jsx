import * as React from 'react';
import { useRouter } from 'next/router';

export function getServerSideProps({ params }) {

    

    return {
        props: {
            id: params.id,
        },
    };
}

export default function ExploreID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>

        </>
    );
}