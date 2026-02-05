import React, { useEffect, useRef } from "react";
import { CompanyEntry, Entry, ProjectEntry } from "data/definitions";
import cx from "classnames";
import { Company } from "./company";
import styles from "./companies.module.css";

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
        const speed = isMobile ? 0.5 : 0.2;

        const animate = () => {
            if (setWidthRef.current === 0) {
                updateSetWidth();
            }

            offsetRef.current += speed;

            if (offsetRef.current >= setWidthRef.current) {
                offsetRef.current = 0;
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
        <div className={cx("", "md:-my-10")}>
            <div className={styles.marquee}>
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
