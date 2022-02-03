import React, { FC, useEffect } from "react";
import { PageEntry, ConfigEntry } from "data/definitions";
import ContentPart from "../src/contentPart";
import { Footer, FooterProps } from "@components/footer";

interface Props extends PageEntry {
    config: ConfigEntry;
}

const Page: FC<Props> = (props: Props) => {
    useEffect(() => {
        document.title = props.title;
    }, []);
    return (
        <div>
            {props.mainContent.map((cp) => (
                <ContentPart key={cp.id} {...cp} />
            ))}
            <Footer {...(props.config.footer as FooterProps)} />
        </div>
    );
};

export default Page;
