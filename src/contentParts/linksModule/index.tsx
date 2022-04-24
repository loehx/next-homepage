import { FC } from "react";
import { Entry, LinkEntry } from "data/definitions";
import styles from "./linksModule.module.css";
import Tilt from "react-parallax-tilt";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";

export interface LinksModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<LinkEntry>;
}

const renderLink = (link: LinkEntry) => {
    return (
        <FadeIn key={link.id} className="col-span-1">
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
        </FadeIn>
    );
};

export const LinksModule: FC<LinksModuleProps> = (props) => {
    return (
        <div className="container">
            <FadeIn>
                {props.title && (
                    <h2 className="text-3xl mb-6">{props.title}</h2>
                )}
            </FadeIn>

            <ul
                className={cx(
                    styles.list,
                    "grid grid-cols-1 md:grid-cols-2 gap-4",
                )}
            >
                {props.links.map(renderLink)}
            </ul>
        </div>
    );
};
