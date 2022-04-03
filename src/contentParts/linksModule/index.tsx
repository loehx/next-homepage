import { FC } from "react";
import { Entry, LinkEntry } from "data/definitions";
import styles from "./linksModule.module.css";
import { useConfig } from "src/hooks";
import Tilt from "react-parallax-tilt";

export interface LinksModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<LinkEntry>;
}

const renderLink = (link: LinkEntry) => {
    return (
        <li key={link.id}>
            <Tilt
                className={styles.tilt}
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                scale={1.05}
            >
                <a
                    href={link.file?.url || link.url}
                    target="_blank"
                    title={link.description || styles.name}
                >
                    <div className={styles.imageWrapper}>
                        <img
                            src={link.image.url + "?w=100"}
                            alt={link.image.name}
                        />
                    </div>
                    <div className={styles.textWrapper}>
                        <span className={styles.name}>{link.name}</span>
                        <span className={styles.description}>
                            {link.description}
                        </span>
                    </div>
                </a>
            </Tilt>
        </li>
    );
};

export const LinksModule: FC<LinksModuleProps> = (props) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                {props.title && (
                    <h2 className="text-3xl mb-6">{props.title}</h2>
                )}

                <ul className={styles.list}>{props.links.map(renderLink)}</ul>
            </div>
        </div>
    );
};
