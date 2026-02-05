import React, { useEffect, useState } from "react";
import { SecretLinkModuleProps } from "data/definitions";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";
import { cipher, decipher } from "./cipher";
import { getSecretLink } from "data";

const storage = typeof localStorage !== "undefined" ? localStorage : null;

export const SecretLinkModule: React.FC<SecretLinkModuleProps> = (props) => {
    const [password, setPassword] = useState(storage?.getItem("pw") || "");
    const [loading, setLoading] = useState(false);
    const [doggyWidth, setDoggyWidth] = useState(200);
    const [showContentfulLink, setShowContentfulLink] = useState(false);
    const [url, setUrl] = useState("");
    const [salt, setSalt] = useState("");
    const [info, setInfo] = useState("");
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setInfo("Passwort wird geprüft ...");
        setPassword("");
        setError("");
        setUrl("");
        setLoading(true);
        const item = await getSecretLink(password);
        setInfo("");
        setLoading(false);

        if (!item) {
            return setError(`Keinen Link gefunden / No link found`);
        }

        if (item.url?.startsWith("http")) {
            setUrl(item.url);
            location.href = item.url;
            return;
        }

        const decrypt = decipher(salt);
        const decrypted = decrypt(item.url);
        if (!decrypted.startsWith("http")) {
            return setError(`Bad URL / Falsche URL`);
        }

        setUrl(decrypted);
        location.href = decrypted;
    };

    useEffect(() => {
        setSalt(window.location.search.split("s=")[1]);
    }, []);

    useEffect(() => {
        setDoggyWidth(randomIntFromInterval(200, 250));
    }, [error]);

    const onPasswordChange = (e) => {
        setShowContentfulLink(false);
        const value = e.target.value || "";
        const pw = value.toUpperCase().trim();
        setPassword(pw);
        storage?.setItem("pw", pw);

        if (value.startsWith("http")) {
            const encrypt = cipher(salt);
            const encrypted = encrypt(value);
            setShowContentfulLink(true);
            return setInfo(encrypted || "");
        }
    };

    return (
        <div className={cx("container")}>
            <FadeIn>
                {props.headline && (
                    <h2 className="text-3xl mb-2">{props.headline}</h2>
                )}
                {props.description && (
                    <p className="text-md mb-2">{props.description}</p>
                )}
                <form className="flex mt-4 gap-2" onSubmit={submit}>
                    <input
                        type="text"
                        placeholder={props.placeholderText}
                        className={`border w-full p-4 disabled:opacity-50 rounded-sm uppercase ${
                            url ? "border-green" : ""
                        }`}
                        onChange={onPasswordChange}
                        disabled={loading}
                        value={password}
                    />
                    <button
                        type="submit"
                        className={`border p-4 font-bold disabled:opacity-50 rounded-sm ${
                            url ? "border-green" : ""
                        }`}
                        disabled={loading}
                    >
                        GO
                    </button>
                </form>
                {info && <div className="p-2 break-all">{info}</div>}
                {showContentfulLink && (
                    <a
                        href="https://app.contentful.com/spaces/sn5a22dgyyrk/entries?id=HfEnmdH3M1IVI2e8&contentTypeId=secretLink"
                        target="_blank"
                        className="p-2 font-bold text-red"
                    >
                        Zu Contentful wechseln ...
                    </a>
                )}
                {error && (
                    <div className="mt-2 flex items-center p-2 border border-red rounded-sm">
                        <div
                            className="bg-cover rounded-full border"
                            style={{
                                backgroundImage: `url(https://place-puppy.com/200x${doggyWidth})`,
                                width: "60px",
                                aspectRatio: "1/1",
                            }}
                        ></div>
                        <span className="pl-4 text-red flex-1">{error}</span>
                    </div>
                )}

                {url && (
                    <div className="mt-2 p-4">
                        <div className="text-green">
                            {"Weiterleitung läuft ..."}&nbsp;
                        </div>
                        <a
                            href={url}
                            target="_BLANK"
                            className="font-bold opacity-50 text-sm"
                        >
                            {url}
                        </a>
                    </div>
                )}
            </FadeIn>
        </div>
    );
};

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default SecretLinkModule;
