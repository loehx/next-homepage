import React from "react";
import { V2Layout } from "../../src/v2/layout";
import { Stage } from "../../src/v2/stage";

const V2Page = () => {
    return (
        <V2Layout title="New Website - Stage">
            <main>
                <Stage />
            </main>
        </V2Layout>
    );
};

export default V2Page;

