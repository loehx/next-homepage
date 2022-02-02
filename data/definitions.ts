export interface Entry {
    id: string;
    type: string;
    [k: string]: any;
}

export interface ConfigEntry extends Entry {
    name: string;
    favicon: AssetEntry;
    startPage: PageEntry;
    mainNavigation: NavigationEntry;
    footerNavigation: NavigationEntry;
}

export interface AssetEntry extends Entry {
    name: string;
    url: string;
}

export interface NavigationEntry extends Entry {
    name: string;
    items: Array<PageEntry>;
}

export interface PageEntry extends Entry {
    title: string;
    description: string;
    mainContent: Array<Entry>;
    slug: string;
}
