import { PageEntry } from "data/definitions";
import data from "../../data";

test("Config can be fetched", async () => {
    const config = await data.getConfig();
    expect(config).toBeDefined();
});

test("Config looks promising", async () => {
    const config = await data.getConfig();
    expect(config.id).toBeDefined();
    expect(config.type).toBe("config");
    expect(config.startPage).toBeDefined();
    expect(config.startPage.type).toBe("page");
    expect(config.mainNavigation).toBeDefined();
    expect(config.mainNavigation.type).toBe("navigation");
    expect(config.footerNavigation).toBeDefined();
    expect(config.footerNavigation.type).toBe("navigation");
});

test("Pages can be fetched", async () => {
    const pages = await data.getEntriesByType("page");
    expect(pages).toBeDefined();
    expect(pages.length).toBeGreaterThan(1);
});

test("Pages look promising", async () => {
    const pages = await data.getEntriesByType<PageEntry>("page");
    pages.forEach((page) => {
        expect(page.id).toBeDefined();
        expect(page.type).toBe("page");
        expect(page.title).toBeDefined();
        expect(page.title.length).toBeGreaterThan(2);
        expect(page.slug).toBeDefined();
        expect(page.slug[0]).toBe("/");
    });
});

test("Fetch page by slug", async () => {
    const config = await data.getConfig();
    const fetched = await data.getPageBySlug(config.startPage.slug);
    expect(fetched.id).toBe(config.startPage.id);
});
