import React, { useEffect, useRef } from "react";
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

export interface CompaniesProps extends Entry {
    id: string;
    title: string;
    companies: CompanyEntry[];
    projects: ProjectEntry[];
}

export const Companies: React.FC<CompaniesProps> = (props) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>();
    const offsetRef = useRef(0);
    const setWidthRef = useRef(0);
    // Whether the cursor is currently over the module.
    const isHoveringRef = useRef(false);
    // Signed distance of the cursor from the module center: -1 (far left) ..
    // 0 (center) .. +1 (far right). Updated on pointer move.
    const pointerNormRef = useRef(0);

    const duplicatedCompanies = [
        ...props.companies,
        ...props.companies,
        ...props.companies,
    ];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const updateSetWidth = () => {
            if (track.children.length > 0) {
                const firstSetWidth =
                    track.scrollWidth / duplicatedCompanies.length;
                setWidthRef.current = firstSetWidth * props.companies.length;
            }
        };

        updateSetWidth();

        const isMobile = window.innerWidth <= 768;
        const speed = isMobile ? 0.5 : 0.5;
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
            if (isHoveringRef.current) {
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
    }, [props.companies, duplicatedCompanies.length]);

    return (
        <div className={cx("relative z-[2]", "md:-my-10")}>
            <div
                className={styles.marquee}
                onMouseEnter={(e) => {
                    isHoveringRef.current = true;
                    pointerNormRef.current = pointerNormFromEvent(e);
                }}
                onMouseMove={(e) => {
                    pointerNormRef.current = pointerNormFromEvent(e);
                }}
                onMouseLeave={() => {
                    isHoveringRef.current = false;
                }}
            >
                <div ref={trackRef} className={styles.track}>
                    {duplicatedCompanies.map((company, index) => (
                        <div
                            key={`${company.id}-${index}`}
                            className={styles.company}
                        >
                            <Company
                                {...company}
                                projects={props.projects.filter(
                                    (p) => p.company.id === company.id,
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Companies;
