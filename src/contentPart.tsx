import React, { FC } from "react";
import dynamic from "next/dynamic";
import { ConfigEntry, Entry } from "data/definitions";
import { Stage, StageProps } from "./contentParts/stage";
import { Text, TextProps } from "./contentParts/text";
import { LinksModule, LinksModuleProps } from "./contentParts/linksModule";
import { ImageText, ImageTextProps } from "./contentParts/imageText";
import { Timeline } from "./contentParts/timeline";
import {
    ProjectsModule,
    ProjectsModuleProps,
} from "./contentParts/projectsModule";
import { TechnologySkillset } from "./contentParts/technologySkillset";
const LetterImageGenerator = dynamic(
    () => import("./contentParts/letterImageGenerator"),
);

interface Props extends Entry {
    config: ConfigEntry;
}

const Page: FC<Props> = (props: Props) => {
    return (
        <div data-id={props.id} data-type={props.type}>
            {props.type === "stage" && <Stage {...(props as any)} />}
            {props.type === "text" && <Text {...(props as any)} />}
            {props.type === "imagetext" && <ImageText {...(props as any)} />}
            {props.type === "linksmodule" && (
                <LinksModule {...(props as any)} />
            )}
            {props.type === "projectsmodule" && (
                <ProjectsModule
                    {...(props as any)}
                    projects={props.config.projects}
                />
            )}
            {props.type === "letterimagegenerator" && (
                <LetterImageGenerator {...(props as any)} />
            )}
            {props.type === "technologyskillset" && (
                <TechnologySkillset {...(props as any)} />
            )}
            {props.type === "timeline" && <Timeline {...(props as any)} />}

            {/* ADD MORE COMPONENTS HERE ... */}
        </div>
    );
};

export default Page;
