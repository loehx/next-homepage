import React, { useEffect, useState } from "react";
import styles from "./secretLink.module.css";
import { SecretLinkModuleProps } from "data/definitions";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";
import { cipher, decipher } from "./cipher";
import { getSecretLink } from "data";

export const SecretLinkModule: React.FC<SecretLinkModuleProps> = (props) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
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

    const onPasswordChange = (e) => {
        setShowContentfulLink(false);
        const value = e.target.value || "";
        if (value.startsWith("http")) {
            const encrypt = cipher(salt);
            const encrypted = encrypt(value);
            setShowContentfulLink(true);
            return setInfo(encrypted || "");
        }
        setPassword(value.toUpperCase().trim());
    };

    return (
        <div className={cx(styles.wrapper, "container")}>
            <FadeIn className={styles.inner}>
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
                        className={`border w-full p-4 disabled:opacity-50 rounded-sm`}
                        onChange={onPasswordChange}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="border p-4 font-bold disabled:opacity-50 rounded-sm"
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
                            className="bg-cover rounded-full border border-red"
                            style={{
                                backgroundImage: `url(https://place-puppy.com/200x200)`,
                                width: "60px",
                                aspectRatio: "1/1",
                            }}
                        ></div>
                        <span className="p-4 text-red flex-1">{error}</span>
                    </div>
                )}

                {url && (
                    <div className="mt-2 flex items-center p-4 border border-green rounded-sm">
                        <div className="text-green">
                            Sie werden weitergeleitet zu / You will be
                            redirected to&nbsp;
                        </div>
                        <a
                            href={url}
                            target="_BLANK"
                            className="font-bold break-all !text-green"
                        >
                            {url} ...
                        </a>
                    </div>
                )}
            </FadeIn>
        </div>
    );
};

export default SecretLinkModule;
