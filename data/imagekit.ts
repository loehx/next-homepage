import ImageKitCollection from "../imagekit.json";

export interface ImageKitImage {
    url: string;
    path: string;
    width: number;
    height: number;
}

export { ImageKitCollection };

export class ImageKitWrapper {
    image: ImageKitImage;

    constructor(image: ImageKitImage) {
        this.image = image;
    }

    get width(): number {
        return this.image.width;
    }

    get height(): number {
        return this.image.height;
    }

    getUrl(options: {
        width?: number;
        height?: number;
        aspectRatio?: string;
        blurry?: boolean;
    }): string {
        const transformations = [
            "q-80",
            "f-webp",
            options.blurry && "bl-10",
            options.width && `w-${options.width}`,
            options.height && `h-${options.height}`,
            options.aspectRatio &&
                `ar-${options.aspectRatio.replace(/[/:]/, "-")}`,
        ].filter(Boolean);

        if (!transformations.length) return this.image.url;

        return `${this.image.url}?tr=${transformations.join(",")}`;
    }
}
