import React from "react";
import { V2Layout } from "../src/layout";
import { Stage } from "../src/stage-v2";

const V2Page: React.FC = () => {
    return (
        <V2Layout title="New Website - Stage">
            <main>
                <Stage />
                <section style={{ height: "100vh", background: "#fff" }}>
                    {/* Blank testing area */}
                </section>
            </main>
        </V2Layout>
    );
};

export default V2Page;
