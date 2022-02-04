import { FC } from "react";
import { Entry, LinkEntry } from "data/definitions";
import styles from "./linksModule.module.css";
import { useConfig } from "src/hooks";

export interface LinksModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<LinkEntry>;
}

const renderLink = (link: LinkEntry) => {
    if (link.url === "config.currentCV") {
        const config = useConfig();
        if (config) link.url = config.currentCV.url;
    }

    const readableUrl = link.url.replace(/[\w]+[:][/]*|^[/]+/gi, "");
    return (
        <li key={link.id}>
            <a href={link.url} target="_blank">
                <div className={styles.imageWrapper}>
                    <img src={link.image.url} alt={link.image.name} />
                </div>
                <div className={styles.textWrapper}>
                    <span className={styles.name}>{link.name}</span>
                    <span className={styles.url}>{readableUrl}</span>
                </div>
            </a>
        </li>
    );
};

export const LinksModule: FC<LinksModuleProps> = (props) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                {props.title && <h2 className={styles.h2}>{props.title}</h2>}

                <ul className={styles.list}>{props.links.map(renderLink)}</ul>
            </div>
        </div>
    );
};
