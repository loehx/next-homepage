import React from "react";
import { V2Layout } from "../../src/v2/layout";
import { Stage } from "../../src/v2/stage";

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
