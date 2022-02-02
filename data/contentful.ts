import * as contentful from "contentful";
import { Entry, ConfigEntry } from "./definitions";
import config from "./config.json";
import { mapEntry } from "./mapping";

export const client = contentful.createClient({
    accessToken: config.accessToken,
    space: config.space,
    environment: config.environment,
});

const DEFAULT_OPTIONS = {
    include: 10,
};

export async function getEntry<T extends Entry>(id: string): Promise<T> {
    const res = await client.getEntry(id, { ...DEFAULT_OPTIONS });
    return mapEntry<T>(res);
}

export async function getEntries<T extends Entry>(query?: any): Promise<T[]> {
    const res = await client.getEntries({ ...DEFAULT_OPTIONS, ...query });
    return res.items.map<T>((item) => mapEntry<T>(item));
}

export async function getConfig(): Promise<ConfigEntry> {
    return await getEntry<ConfigEntry>(config.configId);
}
