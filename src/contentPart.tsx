import React, { FC } from "react";
import { Entry } from "data/definitions";
import { Stage, StageProps } from "./contentParts/stage";
import { Text, TextProps } from "./contentParts/text";
import { LinksModule, LinksModuleProps } from "./contentParts/linksModule";
import { ImageText, ImageTextProps } from "./contentParts/imageText";
import {
    ProjectsModule,
    ProjectsModuleProps,
} from "./contentParts/projectsModule";
import {
    LetterImageGenerator,
    LetterImageGeneratorProps,
} from "./contentParts/letterImageGenerator";

const Page: FC<Entry> = (props: Entry) => {
    return (
        <div data-id={props.id} data-type={props.type}>
            {props.type === "stage" && <Stage {...(props as StageProps)} />}
            {props.type === "text" && <Text {...(props as TextProps)} />}
            {props.type === "imagetext" && (
                <ImageText {...(props as ImageTextProps)} />
            )}
            {props.type === "linksmodule" && (
                <LinksModule {...(props as LinksModuleProps)} />
            )}
            {props.type === "projectsmodule" && (
                <ProjectsModule {...(props as ProjectsModuleProps)} />
            )}
            {props.type === "letterimagegenerator" && (
                <LetterImageGenerator
                    {...(props as LetterImageGeneratorProps)}
                />
            )}

            {/* ADD MORE COMPONENTS HERE ... */}
        </div>
    );
};

export default Page;
