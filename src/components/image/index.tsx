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
    sizes?: string;
    priority?: boolean;
    onLoadingComplete?: (result: {
        naturalWidth: number;
        naturalHeight: number;
    }) => void;
    fixedRatio?: boolean;
}

const srcLoader: ImageLoader = ({ src, width, quality = undefined }) => {
    // Only locally-hosted raster assets go through the Netlify Image CDN.
    // SVGs, data URIs and bundled static images are served untouched.
    const isResizable =
        src.startsWith("/cms/") && !src.toLowerCase().endsWith(".svg");
    if (!isResizable) {
        return src;
    }

    // Next builds the srcset by calling this loader once per device size, so the
    // browser picks the right width (incl. retina) via the `sizes` attribute -
    // no manual devicePixelRatio math needed here.
    const params = [
        `url=${encodeURIComponent(src)}`,
        width != null ? `w=${width}` : null,
        quality != null ? `q=${quality}` : null,
        "fm=webp",
    ].filter(Boolean);

    return `/.netlify/images?${params.join("&")}`;
};

export const Image: React.FC<ImageProps> = ({
    asset,
    onLoadingComplete,
    ...props
}) => {
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const height =
        props.height ||
        (props.width && asset && asset.width && asset.height
            ? (asset.width / props.width) * asset.height
            : undefined);

    const wrapperStyles = asset?.width &&
        asset?.height &&
        props.fixedRatio && {
            paddingBottom: `${Math.round(
                (asset.height / asset?.width) * 100,
            )}%`,
        };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fixedRatio, ...otherProps } = props;

    return (
        <div style={wrapperStyles || {}}>
            <NextImage
                layout={"fill"}
                objectFit="cover"
                loader={srcLoader}
                loading={props.priority ? "eager" : "lazy"}
                height={height}
                alt={asset?.description}
                {...otherProps}
                src={asset?.url || props.src || ""}
                onLoadingComplete={(result) => {
                    setShowPlaceholder(false);
                    if (onLoadingComplete) {
                        onLoadingComplete(result);
                    }
                }}
            />
            {showPlaceholder && (
                <NextImage
                    layout={"fill"}
                    objectFit="cover"
                    alt="Placeholder image"
                    unoptimized
                    src={placeHolderImage}
                />
            )}
        </div>
    );
};
