import React, { FC } from "react";
import dynamic from "next/dynamic";
import LazyHydrate from "react-lazy-hydration";
import { ConfigEntry, Entry } from "data/definitions";
const Stage = dynamic(() => import("./contentParts/stage"));
const Text = dynamic(() => import("./contentParts/text"));
const LinksModule = dynamic(() => import("./contentParts/linksModule"));
const ImageText = dynamic(() => import("./contentParts/imageText"));
const Companies = dynamic(() => import("./contentParts/companies"));
const Timeline = dynamic(() => import("./contentParts/timeline"));
const ProjectsModule = dynamic(() => import("./contentParts/projectsModule"));
const SecretLinkModule = dynamic(
    () => import("./contentParts/secretLinkModule"),
);
const LetterImageGenerator = dynamic(
    () => import("./contentParts/letterImageGenerator"),
);

interface Props extends Entry {
    config: ConfigEntry;
}

const Page: FC<Props> = (props: Props) => {
    return (
        <LazyHydrate whenVisible>
            <div data-id={props.id} data-type={props.type}>
                {props.type === "stage" && <Stage {...(props as any)} />}
                {props.type === "text" && <Text {...(props as any)} />}
                {props.type === "imagetext" && (
                    <ImageText {...(props as any)} />
                )}
                {props.type === "companies" && (
                    <Companies
                        {...(props as any)}
                        projects={props.config.projects}
                    />
                )}
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
                {props.type === "gallery" && (
                    <Gallery {...(props as any)} config={props.config} />
                )}
                {props.type === "secretlinkmodule" && (
                    <SecretLinkModule {...(props as any)} />
                )}

                {props.type === "timeline" && <Timeline {...(props as any)} />}

                {/* ADD MORE COMPONENTS HERE ... */}
            </div>
        </LazyHydrate>
    );
};

export default Page;
