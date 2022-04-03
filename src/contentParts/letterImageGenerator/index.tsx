import React, { useEffect, useMemo, useState } from "react";
import styles from "./letterImageGenerator.module.css";
import { Entry } from "data/definitions";
import { FaPlus, FaMinus } from "react-icons/fa";
import { RiArrowLeftRightLine } from "react-icons/ri";
import cx from "classnames";
import {
    generatePixelMatrixFromBlob,
    getCharacterMapFromMatrix,
} from "./ligUtils";

export interface LetterImageGeneratorProps extends Entry {
    id: string;
    type: string;
}

export const LetterImageGenerator: React.FC<LetterImageGeneratorProps> = () => {
    const [file, setFile] = useState<Blob>();
    const [output, setOutput] = useState<string[][]>([]);
    const [matrix, setMatrix] = useState<number[][]>([]);
    const [resolution, setResolution] = useState<number>(50);
    const [fontSize, setFontSize] = useState<number>(8);
    const [characters, setCharacters] = useState(
        "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`'.   ",
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
            <div className={cx(styles.inputWrapper, "block md:flex")}>
                <div className={cx(styles.dropZone, "w-full flex-1 md:mr-6")}>
                    <input
                        type="file"
                        onChange={(e) => setFile((e.target as any).files?.[0])}
                    />
                    <span className="hidden md:inline">
                        Drop your image here
                    </span>
                    <span className="md:hidden">Upload your image</span>
                </div>
                <div className="text-sm mt-6 md:mt-0 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <label className="block text-sm">Characters:</label>
                        <input
                            type="text"
                            value={characters}
                            className="border border-grey-200 rounded p-1"
                            onChange={(e) => setCharacters(e.target.value)}
                        />
                        <button onClick={reverseCharacters} className="p-2">
                            <RiArrowLeftRightLine />
                        </button>
                    </div>
                    <div className="flex items-center">
                        <label>Resolution</label>
                        <button onClick={() => resUp(10)} className="p-2">
                            <FaPlus />
                        </button>
                        <span>{resolution}p</span>
                        <button onClick={() => resDown(10)} className="p-2">
                            <FaMinus />
                        </button>
                    </div>
                    <div className="flex items-center">
                        <label>Font size</label>
                        <button
                            onClick={() => setFontSize(fontSize + 1)}
                            className="p-2"
                        >
                            <FaPlus />
                        </button>
                        <span>{fontSize}px</span>
                        <button
                            onClick={() => setFontSize(fontSize - 1)}
                            className="p-2"
                        >
                            <FaMinus />
                        </button>
                    </div>
                </div>
            </div>
            {text && (
                <div className="flex items-center flex-col mt-10">
                    <div className="mx-auto mb-4 text-sm text-grey-400">
                        ({matrix[0].length * matrix.length} characters)
                    </div>
                    <pre style={{ fontSize: `${fontSize}px` }}>
                        {output.map((l) => l.join("") + "\n")}
                    </pre>
                </div>
            )}
        </div>
    );
};
