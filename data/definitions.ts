export interface Entry {
    id: string;
    type: string;
    [k: string]: any;
}

export interface ConfigEntry extends Entry {
    name: string;
    favicon: AssetEntry;
    startPage: PageEntry;
    footer: Entry;
    currentCV: AssetEntry;
}

export interface AssetEntry extends Entry {
    name: string;
    url: string;
}

export interface PageEntry extends Entry {
    title: string;
    teaserTitle: string;
    description: string;
    mainContent: Array<Entry>;
    slug: string;
}

export interface LinkEntry extends Entry {
    name: string;
    url: string;
    image: AssetEntry;
}

export interface CompanyEntry extends Entry {
    name: string;
    fullName: string;
    url: string;
    logo: AssetEntry;
}

export interface TechnologyEntry extends Entry {
    name: string;
    fullName: string;
    url: string;
    logo: AssetEntry;
}
