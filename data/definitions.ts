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
    ogtitle: string;
    ogdescription: string;
    ogurl: string;
    ogimage: AssetEntry;
}

export interface LinkEntry extends Entry {
    name: string;
    description: string;
    url: string;
    image: AssetEntry;
    file: AssetEntry;
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

export interface ProjectEntry extends Entry {
    name: string;
    description: string;
    from: string;
    to: string;
    role: string;
    sector: string;
    url: string;
    company: CompanyEntry;
    technologies: TechnologyEntry[];
    moreTechnologies: string;
    team: string;
}

export interface TechnologyEntry extends Entry {
    name: string;
    fullName: string;
    url: string;
    logo: AssetEntry;
}

export interface CompanyEntry extends Entry {
    name: string;
    fullName: string;
    url: string;
    logo: AssetEntry;
}
