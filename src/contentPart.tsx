import React, { FC } from "react";
import { Entry } from "data/definitions";
import { Stage, StageProps } from "./contentParts/stage";

const Page: FC<Entry> = (props: Entry) => {
    return (
        <div data-id={props.id} data-type={props.type}>
            {props.type === "stage" && <Stage {...(props as StageProps)} />}

            {/* ADD MORE COMPONENTS HERE ... */}
        </div>
    );
};

export default Page;
