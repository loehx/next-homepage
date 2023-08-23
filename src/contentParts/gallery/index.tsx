import React, { useEffect, useMemo, useState } from "react";
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
    const images = ImageKitCollection.filter((image) =>
        image.path.includes(props.path),
    );

    console.log("AAA", { images, path: props.path });

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
                        className="col-span-1 cursor-pointer"
                        onClick={() => setCurrentIndex(index)}
                    >
                        <GalleryImage
                            key={item.url}
                            item={item}
                            aspectRatio={aspectRatio}
                        />
                    </div>
                ))}
            </div>
            {currentIndex >= 0 && currentIndex < images.length && (
                <div className="fixed inset-0 z-50">
                    <GalleryImage
                        item={images[currentIndex]}
                        aspectRatio={aspectRatio}
                        fullSize
                    />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 active:scale-95 cursor-pointer flex items-center transition-all duration-100 p-[10%] bg-gradient-to-r from-black-20 to-transparent"
                        onClick={() => setCurrentIndex(currentIndex - 1)}
                    >
                        <img
                            src={LeftArrow}
                            alt="Previous"
                            className="text-white w-32"
                        />
                    </div>
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1/2 opacity-0 hover:lg:opacity-20 active:opacity-20 active:scale-95 cursor-pointer flex items-center justify-end transition-all duration-100 p-[10%] bg-gradient-to-l from-black-20 to-transparent"
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                        <img
                            src={RightArrow}
                            alt="Next"
                            className="text-white w-32"
                        />
                    </div>

                    <div className="absolute bottom-4 left-4 drop-shadow-lg text-white opacity-60">
                        {currentIndex + 1} / {images.length}​
                    </div>
                    <div className="absolute bottom-4 right-4 drop-shadow-lg opacity-60">
                        <img src={logo.url} alt="Logo" className="h-8 w-8" />
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
}

const GalleryImage: React.FC<GalleryImageProps> = (props) => {
    const image = useMemo(() => new ImageKitWrapper(props.item), [props.item]);
    const url = useMemo(() => image.getUrl({ width: 1024 }), [image]);
    const srcSet = useMemo(
        () =>
            [375, 600, 768, 1024, 1920, 2560]
                .map((w) => `${image.getUrl({ width: w })} w${w}`)
                .join(", "),
        [image],
    );

    return (
        <picture
            className="w-full h-full block overflow-hidden relative"
            style={{ aspectRatio: props.aspectRatio }}
        >
            <img
                className="absolute -translate-x-1/2 -translate-y-1/2 object-cover w-full h-full"
                src={url}
                srcSet={srcSet}
                style={{ top: "50%", left: "50%" }}
            />
        </picture>
    );
};

export default Gallery;
