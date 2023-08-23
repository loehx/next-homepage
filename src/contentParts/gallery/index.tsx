import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./gallery.module.css";
import RightArrow from "./right-arrow.svg";
import LeftArrow from "./left-arrow.svg";
import {
    ImageKitCollection,
    ImageKitImage,
    ImageKitWrapper,
} from "data/imagekit";
import { ConfigEntry } from "data/definitions";

export interface GalleryProps {
    id: string;
    type: string;
    name: string;
    path: string;
    config: ConfigEntry;
}

export const Gallery: React.FC<GalleryProps> = (props) => {
    const logo = props.config.logoBright;
    const [aspectRatio, setAspectRatio] = useState("16/9");
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [justChanged, setJustChanged] = useState(true);
    const [cover, setCover] = useState(true);
    const images = useMemo(
        () =>
            ImageKitCollection.filter((image) =>
                image.path.includes(props.path),
            ),
        [props.path],
    );

    useEffect(() => {
        setJustChanged(true);
        const timeout = setTimeout(() => setJustChanged(false), 5000);
        return () => clearTimeout(timeout);
    }, [currentIndex]);

    const next = () =>
        setCurrentIndex(
            currentIndex < images.length - 1 ? currentIndex + 1 : 0,
        );
    const previous = () =>
        setCurrentIndex(
            currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1,
        );

    useEffect(() => {
        const handleResize = () => {
            if (typeof window === "undefined") return;
            setAspectRatio(`${window.innerWidth}/${window.innerHeight}`);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            console.log("AAA", e.keyCode);
            if (e.keyCode === 27) return setCurrentIndex(-1); // ESC
            if (e.keyCode === 37) return previous(); // arrow-left
            if (e.keyCode === 39) return next(); // arrow-right
        };
        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [currentIndex]);

    return (
        <div className={styles.wrapper}>
            <div className="grid grid-cols-3 gap-2">
                {images?.map((item, index) => (
                    <div
                        key={item.url}
                        className={`col-span-1 cursor-pointer`}
                        onClick={() => setCurrentIndex(index)}
                    >
                        <GalleryImage
                            item={item}
                            aspectRatio={aspectRatio}
                            cover
                        />
                    </div>
                ))}
            </div>
            {currentIndex >= 0 && currentIndex < images.length && (
                <div className="fixed inset-0 z-50 bg-white">
                    <GalleryImage
                        key={currentIndex}
                        item={images[currentIndex]}
                        aspectRatio={aspectRatio}
                        fullSize
                        cover={cover}
                    />
                    {images[currentIndex + 1] && (
                        <GalleryImage
                            key={currentIndex + 1}
                            item={images[currentIndex + 1]}
                            aspectRatio={aspectRatio}
                            fullSize
                            preloading
                        />
                    )}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 group cursor-pointer flex items-center transition-all duration-100 p-[10%] bg-gradient-to-r from-black to-transparent"
                        onClick={previous}
                    >
                        <img
                            src={LeftArrow}
                            alt="Previous"
                            className="text-white w-32 group-active:scale-95 select-none"
                        />
                    </div>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 group cursor-pointer flex items-center justify-end transition-all duration-100 p-[10%] bg-gradient-to-l from-black to-transparent"
                        onClick={next}
                    >
                        <img
                            src={RightArrow}
                            alt="Next"
                            className="text-white w-32 group-active:scale-95 select-none"
                        />
                    </div>
                    <div
                        onClick={() => setJustChanged(true)}
                        className={`transition-opacity duration-1000 hover:opacity-100 ${
                            justChanged ? "" : "opacity-20"
                        }`}
                    >
                        <div
                            className="absolute top-0 right-0 drop-shadow-lg text-white cursor-pointer p-4 select-none"
                            onClick={() => setCurrentIndex(-1)}
                        >
                            X​
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black-60 to-transparent h-32"></div>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                            <div className=" drop-shadow-lg select-none flex gap-4 p-4 cursor-pointer">
                                <img
                                    src={logo.url}
                                    alt="Logo"
                                    className="h-8 w-8"
                                />
                            </div>
                            <div className="drop-shadow-lg text-white p-4 select-none">
                                {currentIndex + 1} / {images.length}​
                            </div>
                            <div
                                className="drop-shadow-lg text-white p-4 select-none"
                                onClick={() => setCover(!cover)}
                            >
                                {cover ? "NO-CROP" : "CROP"}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export interface GalleryImageProps {
    item: ImageKitImage;
    aspectRatio: string;
    fullSize?: boolean;
    preloading?: boolean;
    cover?: boolean;
}

const GalleryImage: React.FC<GalleryImageProps> = (props) => {
    const image = useMemo(() => new ImageKitWrapper(props.item), [props.item]);
    const [url, setUrl] = useState(image.getUrl({ width: 256, blurry: true }));
    const pictureElement = useRef<HTMLPictureElement | null>(null);

    useEffect(() => {
        const round = (n) => Math.ceil(n / 100) * 100;
        const pxRatio = (n) => n * window.devicePixelRatio;
        const prep = (n) => round(pxRatio(n || 0));
        const width = prep(pictureElement.current?.clientWidth);
        const height = prep(pictureElement.current?.clientHeight);
        setUrl(
            image.getUrl({
                ...(width > height ? { width } : { height }),
            }),
        );
    }, [pictureElement]);

    return (
        <picture
            ref={pictureElement}
            className={`w-full h-full block overflow-hidden relative ${
                props.preloading ? "pointer-events-none opacity-0" : ""
            }`}
            style={{ aspectRatio: props.aspectRatio }}
        >
            <img
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-full h-full ${
                    props.cover ? "object-cover" : "object-contain"
                }`}
                src={url}
                style={{ top: "50%", left: "50%" }}
            />
        </picture>
    );
};

export default Gallery;
