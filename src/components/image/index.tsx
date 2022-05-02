import React, { useState } from "react";
import { AssetEntry } from "data/definitions";
import { default as NextImage, ImageLoader } from "next/image";

const placeHolderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+PLly38ACZgD3EOjaxgAAAAASUVORK5CYII=";

export interface ImageProps {
    asset?: AssetEntry;
    src?: string;
    width?: number;
    height?: number;
    alt?: string;
    fill?: boolean;
}

const srcLoader: ImageLoader = ({ src, width, quality = undefined }) => {
    const params = {
        w: width,
        q: quality,
        fm: !src.includes(".svg") ? "webp" : undefined,
    };
    const keys = Object.keys(params).filter((k) => params[k]);
    const separator = src.includes("?") ? "&" : "?";
    const query = keys
        .map((k) => k + "=" + encodeURIComponent(params[k]))
        .join("&");

    return src + separator + query;
};

export const Image: React.FC<ImageProps> = ({ asset, ...props }) => {
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const height =
        props.height ||
        (props.width && asset && asset.width && asset.height
            ? (asset.width / props.width) * asset.height
            : undefined);

    return (
        <span>
            <NextImage
                layout={"fill"}
                objectFit="cover"
                loader={asset ? srcLoader : undefined}
                loading="lazy"
                height={height}
                alt={asset?.description}
                {...props}
                src={asset?.url || props.src || ""}
                onLoadingComplete={() => setShowPlaceholder(false)}
            />
            {showPlaceholder && (
                <NextImage
                    layout={"fill"}
                    objectFit="cover"
                    alt="Placeholder image"
                    loader={undefined}
                    src={placeHolderImage}
                />
            )}
        </span>
    );
};
