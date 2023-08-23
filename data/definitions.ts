export interface Entry {
    id: string;
    type: string;
    [k: string]: any;
}

export interface ConfigEntry extends Entry {
    name: string;
    favicon: AssetEntry;
    author: string;
    startPage: PageEntry;
    footer: FooterEntry;
    cookiePopup: Entry;
    projects: Entry[];
    logoBright: AssetEntry;
}

export interface AssetEntry extends Entry {
    name: string;
    url: string;
    description?: string;
    width?: number;
    height?: number;
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
    footer?: FooterEntry;
}

export interface FooterEntry extends Entry {
    name: string;
    infoText: string;
    metaNavigation: PageEntry[];
    backgroundImage: AssetEntry;
    backgroundVideo: AssetEntry;
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

export interface SecretLink extends Entry {
    id: string;
    type: string;
    url: string;
    password: string;
}

export interface SecretLinkModuleProps extends Entry {
    id: string;
    type: string;
    headline: string;
    description: string;
    pleaceholderText: string;
}
