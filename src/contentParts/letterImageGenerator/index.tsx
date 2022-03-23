import React, { useEffect, useMemo, useState } from "react";
import styles from "./letterImageGenerator.module.css";
import { Entry } from "data/definitions";
import { FaPlus, FaMinus } from "react-icons/fa";
import { RiArrowLeftRightLine } from "react-icons/ri";
import {
    generatePixelMatrixFromBlob,
    getCharacterMapFromMatrix,
} from "./ligUtils";

export interface LetterImageGeneratorProps extends Entry {
    id: string;
    type: string;
}

export const LetterImageGenerator: React.FC<LetterImageGeneratorProps> = () => {
    const config = {
        resolution: 400,
    };
    const [file, setFile] = useState<Blob>();
    const [output, setOutput] = useState<string[][]>([]);
    const [matrix, setMatrix] = useState<number[][]>([]);
    const [resolution, setResolution] = useState<number>(50);
    const [characters, setCharacters] = useState(
        "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`'. ",
    );

    useEffect(() => {
        if (!file) return;
        generatePixelMatrixFromBlob(file, {
            resolution,
            stretchX: 2,
        }).then(setMatrix);
    }, [file, resolution]);

    useEffect(() => {
        if (!matrix.length) return;
        const { output } = getCharacterMapFromMatrix({ matrix, characters });
        setOutput(output);
    }, [matrix, characters]);

    const fontSize = useMemo(() => {
        if (output.length === 0) return;
        const width = output[0].length;
        const height = output.length;
        const n = Math.max(width, height);
        return `calc(100vw/${n})`;
    }, [output]);

    const text = useMemo(() => {
        if (!output) return;
        return output.map((l) => l.join("")).join("\n");
    }, [output]);

    const reverseCharacters = () =>
        setCharacters(characters.split("").reverse().join(""));
    const resUp = (n: number) => setResolution(Math.min(1000, resolution + n));
    const resDown = (n: number) => setResolution(Math.max(10, resolution - n));

    return (
        <div className={styles.wrapper}>
            <div className={styles.inputWrapper}>
                <div className={styles.dropZone}>
                    <input
                        type="file"
                        onChange={(e) => setFile((e.target as any).files?.[0])}
                    />
                    Drop your image here
                </div>
                <div>
                    <label>Characters to use:</label>
                    <input
                        type="text"
                        value={characters}
                        onChange={(e) => setCharacters(e.target.value)}
                    />
                    <br />
                    <button onClick={reverseCharacters} className="p-2">
                        <RiArrowLeftRightLine />
                    </button>
                    <label>Resolution</label>
                    <div className="flex items-center">
                        <button onClick={() => resUp(10)} className="p-2">
                            <FaPlus />
                        </button>
                        <span>{resolution}p</span>
                        <button onClick={() => resDown(10)} className="p-2">
                            <FaMinus />
                        </button>
                    </div>
                </div>
            </div>
            {text && (
                <div
                    className="flex justify-center flex-col"
                    style={{ fontSize }}
                >
                    {output.map((l, i) => (
                        <pre key={"line" + i}>
                            {l.map((c, i2) =>
                                c === " " ? (
                                    <span key={`${i}-${i2}`}>&nbsp;</span>
                                ) : (
                                    c
                                ),
                            )}
                        </pre>
                    ))}
                </div>
            )}
        </div>
    );
};
