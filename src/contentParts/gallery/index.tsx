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

    useEffect(() => {
        setJustChanged(true);
        const timeout = setTimeout(() => setJustChanged(false), 3000);
        return () => clearTimeout(timeout);
    }, [currentIndex]);

    const images = ImageKitCollection.filter((image) =>
        image.path.includes(props.path),
    );
    const handleResize = () => {
        if (typeof window === "undefined") return;
        setAspectRatio(`${window.innerWidth}/${window.innerHeight}`);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className="grid grid-cols-4 gap-2">
                {images?.map((item, index) => (
                    <div
                        key={item.url}
                        className="col-span-1 cursor-pointer"
                        onClick={() => setCurrentIndex(index)}
                    >
                        <GalleryImage item={item} aspectRatio={aspectRatio} />
                    </div>
                ))}
            </div>
            {currentIndex >= 0 && currentIndex < images.length && (
                <div className="fixed inset-0 z-50">
                    <GalleryImage
                        key={currentIndex}
                        item={images[currentIndex]}
                        aspectRatio={aspectRatio}
                        fullSize
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
                        className="absolute left-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 group cursor-pointer flex items-center transition-all duration-100 p-[10%] bg-gradient-to-r from-black-20 to-transparent"
                        onClick={() =>
                            setCurrentIndex(Math.max(currentIndex - 1, 0))
                        }
                    >
                        <img
                            src={LeftArrow}
                            alt="Previous"
                            className="text-white w-32 group-active:scale-95"
                        />
                    </div>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 group cursor-pointer flex items-center justify-end transition-all duration-100 p-[10%] bg-gradient-to-l from-black-20 to-transparent"
                        onClick={() =>
                            setCurrentIndex(
                                currentIndex < images.length - 1
                                    ? currentIndex + 1
                                    : 0,
                            )
                        }
                    >
                        <img
                            src={RightArrow}
                            alt="Next"
                            className="text-white w-32 group-active:scale-95"
                        />
                    </div>
                    <div
                        className={`transition-opacity duration-1000 ${
                            justChanged ? "" : "opacity-0"
                        }`}
                    >
                        <div
                            className="absolute top-0 right-0 drop-shadow-lg text-white cursor-pointer p-4"
                            onClick={() => setCurrentIndex(-1)}
                        >
                            X​
                        </div>
                        <div className="absolute bottom-0 left-0 drop-shadow-lg text-white p-4 pointer-events-none">
                            {currentIndex + 1} / {images.length}​
                        </div>
                        <div className="absolute bottom-0 right-0 drop-shadow-lg p-4 pointer-events-none">
                            <img
                                src={logo.url}
                                alt="Logo"
                                className="h-8 w-8"
                            />
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
                className="absolute -translate-x-1/2 -translate-y-1/2 object-cover w-full h-full"
                src={url}
                style={{ top: "50%", left: "50%" }}
            />
        </picture>
    );
};

export default Gallery;
