import React, { FC } from "react";
import { Entry } from "data/definitions";
import { Stage, StageProps } from "./contentParts/stage";
import { Text, TextProps } from "./contentParts/text";
import { LinksModule, LinksModuleProps } from "./contentParts/linksModule";

const Page: FC<Entry> = (props: Entry) => {
    return (
        <div data-id={props.id} data-type={props.type}>
            {props.type === "stage" && <Stage {...(props as StageProps)} />}
            {props.type === "text" && <Text {...(props as TextProps)} />}
            {props.type === "linksmodule" && (
                <LinksModule {...(props as LinksModuleProps)} />
            )}

            {/* ADD MORE COMPONENTS HERE ... */}
        </div>
    );
};

export default Page;
