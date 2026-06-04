import React, { useEffect, useRef, useState } from "react";
import { CompanyEntry, Entry, ProjectEntry } from "data/definitions";
import cx from "classnames";
import { Company } from "./company";
import styles from "./companies.module.css";

/**
 * Maps a pointer event to a signed value in [-1, 1] describing how far the
 * cursor sits from the horizontal center of the hovered element.
 */
function pointerNormFromEvent(e: React.MouseEvent<HTMLDivElement>): number {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const norm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    return Math.max(-1, Math.min(1, norm));
}

interface MarqueeRowProps {
    companies: CompanyEntry[];
    projects: ProjectEntry[];
    // Base scroll direction: +1 scrolls content to the left (right-to-left),
    // -1 scrolls content to the right (left-to-right).
    direction?: 1 | -1;
    // Whether the cursor can steer the scroll speed/direction (desktop only).
    interactive?: boolean;
    // Multiplier applied to the base auto-scroll speed.
    speedFactor?: number;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({
    companies,
    projects,
    direction = 1,
    interactive = true,
    speedFactor = 1,
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const offsetRef = useRef(0);
    const setWidthRef = useRef(0);
    const isHoveringRef = useRef(false);
    const pointerNormRef = useRef(0);

    const duplicatedCompanies = [...companies, ...companies, ...companies];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const updateSetWidth = () => {
            if (track.children.length > 0) {
                const firstSetWidth =
                    track.scrollWidth / duplicatedCompanies.length;
                setWidthRef.current = firstSetWidth * companies.length;
            }
        };

        updateSetWidth();

        const speed = 0.35 * direction * speedFactor;
        // Max scroll speed when the cursor reaches the very edge of the module.
        const MAX_HOVER_SPEED = 3;

        const animate = () => {
            if (setWidthRef.current === 0) {
                updateSetWidth();
            }

            // Determine the per-frame delta:
            //  - not hovering: normal auto-scroll.
            //  - hovering: speed scales with how far the cursor is from the
            //    module center. Center = no movement; the further toward an
            //    edge, the faster it scrolls in that direction.
            let delta = speed;
            if (interactive && isHoveringRef.current) {
                // Cubic easing keeps the center calm and ramps up near edges.
                const norm = pointerNormRef.current;
                delta = norm * Math.abs(norm) * MAX_HOVER_SPEED;
            }

            offsetRef.current += delta;

            // Wrap in both directions so reverse scrolling stays seamless.
            const setWidth = setWidthRef.current;
            if (setWidth > 0) {
                if (offsetRef.current >= setWidth) {
                    offsetRef.current -= setWidth;
                } else if (offsetRef.current < 0) {
                    offsetRef.current += setWidth;
                }
            }

            track.style.transform = `translateX(-${offsetRef.current}px)`;

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            updateSetWidth();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener("resize", handleResize);
        };
    }, [
        companies,
        duplicatedCompanies.length,
        direction,
        interactive,
        speedFactor,
    ]);

    return (
        <div
            className={styles.marquee}
            onMouseEnter={
                interactive
                    ? (e) => {
                          isHoveringRef.current = true;
                          pointerNormRef.current = pointerNormFromEvent(e);
                      }
                    : undefined
            }
            onMouseMove={
                interactive
                    ? (e) => {
                          pointerNormRef.current = pointerNormFromEvent(e);
                      }
                    : undefined
            }
            onMouseLeave={
                interactive
                    ? () => {
                          isHoveringRef.current = false;
                      }
                    : undefined
            }
        >
            <div ref={trackRef} className={styles.track}>
                {duplicatedCompanies.map((company, index) => (
                    <div
                        key={`${company.id}-${index}`}
                        className={styles.company}
                    >
                        <Company
                            {...company}
                            projects={projects.filter(
                                (p) => p.company.id === company.id,
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export interface CompaniesProps extends Entry {
    id: string;
    title: string;
    companies: CompanyEntry[];
    projects: ProjectEntry[];
}

export const Companies: React.FC<CompaniesProps> = (props) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
    }, []);

    // On mobile, split the companies into two halves so the two rows show
    // different logos instead of duplicating the same sequence.
    const half = Math.ceil(props.companies.length / 2);
    const firstRow = props.companies.slice(0, half);
    const secondRow = props.companies.slice(half);

    return (
        <div className={cx("relative z-[2]", "md:-my-10")}>
            {isMobile ? (
                <div className={styles.rows}>
                    <MarqueeRow
                        companies={firstRow}
                        projects={props.projects}
                        direction={1}
                        interactive={false}
                        speedFactor={0.75}
                    />
                    <MarqueeRow
                        companies={secondRow.length ? secondRow : firstRow}
                        projects={props.projects}
                        direction={-1}
                        interactive={false}
                        speedFactor={0.75}
                    />
                </div>
            ) : (
                <MarqueeRow
                    companies={props.companies}
                    projects={props.projects}
                    direction={1}
                    interactive
                />
            )}
        </div>
    );
};

export default Companies;
