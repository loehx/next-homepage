export type RgbaArray = [r: number, g: number, b: number, a: number];

function newMatrix<T>(y: number, x: number, defaultValue: T): T[][] {
    return new Array(y).fill(null).map(() => new Array(x).fill(defaultValue));
}

function forEachValueIn<T>(
    matrix: T[][],
    func: (v: T, x: number, y: number) => void,
): void {
    const ylen = matrix.length;
    const xlen = matrix[0].length;
    for (let y = 0; y < ylen; y++) {
        for (let x = 0; x < xlen; x++) {
            func(matrix[y][x], x, y);
        }
    }
}

function getMinMaxFromMatrix(matrix: number[][]): {
    min: number;
    max: number;
} {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    forEachValueIn(matrix, (val) => {
        if (val < min) {
            min = val;
        } else if (val > max) {
            max = val;
        }
    });
    return { min, max };
}

export interface getImageDataFromBlobReturn {
    width: number;
    height: number;
    getPixel: (x: number, y: number) => RgbaArray;
}

export function getImageDataFromBlob(
    blob: Blob,
): Promise<getImageDataFromBlobReturn> {
    return new Promise<getImageDataFromBlobReturn>((resolve) => {
        if (!blob) return;
        if (!blob.type.match("image.*")) {
            return alert("File must be an image!");
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = (evt: ProgressEvent<FileReader>) => {
            if (evt.target?.readyState == FileReader.DONE) {
                const image = new Image();
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (!context) {
                    return alert(
                        'Error: canvas.getContext("2d") returned NULL 🤯',
                    );
                }
                image.src = (evt.target.result as string) || "";
                image.onload = () => {
                    const { width, height } = image;
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(image, 0, 0, width, height);
                    resolve({
                        getPixel: (x: number, y: number) => {
                            const { data } = context.getImageData(x, y, 1, 1);
                            console.assert(data.length === 4);
                            return Array.from(data) as RgbaArray;
                        },
                        width,
                        height,
                    });
                };
            }
        };
    });
}

export interface getPixelMatrixArgs extends getImageDataFromBlobReturn {
    select: (rgbaArray: RgbaArray) => number;
    resolution: number;
    stretchX?: number;
}
export interface getPixelMatrixReturn {
    matrix: number[][];
}

export function getPixelMatrix({
    getPixel,
    width,
    height,
    select,
    resolution,
    stretchX = 1,
}: getPixelMatrixArgs): getPixelMatrixReturn {
    const ratio = width / height;
    const ylen = resolution;
    const xlen = Math.ceil(ylen * ratio * stretchX);
    const matrix = newMatrix<number>(ylen, xlen, -1);

    for (let y = 0; y < ylen; y++) {
        for (let x = 0; x < xlen; x++) {
            const pixel = getPixel(
                Math.floor((width / xlen) * x),
                Math.floor((height / ylen) * y),
            );
            matrix[y][x] = select(pixel);
        }
    }

    return { matrix };
}

interface getCharacterMapFromMatrixArgs {
    matrix: number[][];
    characters: string;
}

interface getCharacterMapFromMatrixResult {
    output: string[][];
}
export function getCharacterMapFromMatrix({
    matrix,
    characters,
}: getCharacterMapFromMatrixArgs): getCharacterMapFromMatrixResult {
    const { min, max } = getMinMaxFromMatrix(matrix);
    const ylen = matrix.length;
    const xlen = matrix[0].length;
    const output = newMatrix(ylen, xlen, "x");
    const getChar = (n: number) =>
        characters[
            Math.max(
                0,
                Math.floor(((n - min) / (max - min)) * characters.length) - 1,
            )
        ];

    forEachValueIn(matrix, (val, x, y) => {
        output[y][x] = getChar(val);
    });

    return { output };
}

export async function generatePixelMatrixFromBlob(
    blob: Blob,
    { resolution, stretchX }: { resolution: number; stretchX?: number },
): Promise<number[][]> {
    const { getPixel, width, height } = await getImageDataFromBlob(blob);

    const { matrix } = getPixelMatrix({
        resolution,
        getPixel,
        stretchX,
        width,
        height,
        select: ([r, g, b, a]) => r + g + b,
    });

    return matrix;
}
