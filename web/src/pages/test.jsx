import Script from "next/script";
import { useEffect, useRef } from "react";

export default function Test() {

    const test = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            if(typeof window.Engine === 'function' && WebAssembly.current === undefined){
                window.Engine()
                    .then(wasm => {
                        console.log("got WASM!");
                        WebAssembly.current = wasm;
                        // returns a string
                        test.current = WebAssembly.current.cwrap("test", "number", []);

                        console.log(test.current());
                    });

            }
        }, 1000);
    }, []);

    return (
		<>
            <Script src="/engine.js" strategy='beforeInteractive'/>
        </>
	);
}