import { ImageKitImage, ImageKitWrapper } from "data/imagekit";
import { useMemo, useState, useRef, useEffect } from "react";

export interface GalleryImageProps {
    item: ImageKitImage;
    aspectRatio: string;
    fullSize?: boolean;
    preloading?: boolean;
    cover?: boolean;
}

const GalleryImage: React.FC<GalleryImageProps> = (props) => {
    const image = useMemo(() => new ImageKitWrapper(props.item), [props.item]);
    const placeholderUrl = useMemo(
        () => image.getUrl({ width: 256, blurry: true }),
        [image],
    );
    const [url, setUrl] = useState(placeholderUrl);
    const pictureElement = useRef<HTMLPictureElement | null>(null);

    useEffect(() => {
        const round = (n) => Math.ceil(n / 100) * 100;
        const pxRatio = (n) => n * window.devicePixelRatio;
        const prep = (n) => round(pxRatio(n || 0));
        const width = prep(pictureElement.current?.clientWidth);
        const height = prep(pictureElement.current?.clientHeight);
        const newUrl = image.getUrl({
            ...(width > height ? { width } : { height }),
        });
        const img = new Image();
        img.src = newUrl;
        img.onload = () => setUrl(newUrl);
        img.onerror = () => setUrl(newUrl);
    }, [pictureElement]);

    return (
        <picture
            ref={pictureElement}
            className={`w-full h-full block overflow-hidden relative ${
                props.preloading ? "pointer-events-none opacity-0" : ""
            }`}
            style={{
                aspectRatio: props.aspectRatio,
            }}
        >
            <div
                style={{ backgroundImage: `url(${url})` }}
                className="absolute inset-0 bg-cover opacity-60"
            ></div>
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

export default GalleryImage;
