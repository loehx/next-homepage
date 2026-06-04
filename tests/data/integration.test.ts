import { PageEntry } from "data/definitions";
import data from "../../data";

test("getConfig returns site config", async () => {
    const config = await data.getConfig();
    expect(config).toBeDefined();
    expect(config.type).toBe("config");
    expect(config.name).toBeDefined();
    expect(config.favicon).toBeDefined();
    expect(config.footer).toBeDefined();
    expect(config.footer.type).toBe("footer");
    expect(config.startPage).toBeDefined();
    expect(config.startPage.type).toBe("page");
});

test("getEntriesByType page returns pages", async () => {
    const pages = await data.getEntriesByType<PageEntry>("page");
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
        expect(page.type).toBe("page");
        expect(page.id).toBeDefined();
        expect(page.title).toBeDefined();
        expect(page.slug).toBeDefined();
        expect(page.slug[0]).toBe("/");
    }
});

test("getPageBySlug resolves start page", async () => {
    const config = await data.getConfig();
    const fetched = await data.getPageBySlug(config.startPage.slug);
    expect(fetched.id).toBe(config.startPage.id);
    expect(fetched.slug).toBe("/");
});
