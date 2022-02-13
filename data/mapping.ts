import * as contentful from "contentful";
import { AssetEntry, Entry } from "./definitions";

const getKeys = Object.keys as <T extends any>(obj: T) => Array<string>;

function getValue(value: any): any {
    if (Array.isArray(value)) {
        return value.map(getValue);
    }

    if (value && value.sys) {
        return mapEntry(value);
    }
    return value;
}

export function mapEntry<T extends Entry>(entry: contentful.Entry<unknown>): T {
    if (entry.sys.type === "Asset") return mapAsset(entry) as unknown as T;

    const result: Entry = {
        id: entry.sys.id,
        type: (
            entry.sys.contentType?.sys.id ||
            entry.sys.type ||
            "[unknown]"
        ).toLowerCase(),
    };

    for (const fieldName of getKeys(entry.fields)) {
        result[fieldName] = getValue(
            (<Record<string, any>>entry.fields)[fieldName],
        );
    }

    switch (result.type) {
        case "page":
            if (result.slug && result.slug[0] !== "/") {
                result.slug = "/" + result.slug;
            }
            break;
    }

    return result as T;
}
function mapAsset(entry: contentful.Entry<unknown>): AssetEntry | null {
    if (!(<any>entry.fields).file) return null;
    return {
        id: entry.sys.id,
        type: "asset",
        name: (<any>entry.fields).title,
        url: (<any>entry.fields).file?.url || null,
    };
}
