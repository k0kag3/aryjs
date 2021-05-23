import { getLatestUpdates, SearchType } from "../src";

it("can fetch latest items from specific user", async () => {
  const res = await getLatestUpdates({ username: "kokage" });
  for (const update of res.updates) {
    expect(update.author).toBe("kokage");
    expect(update.authorUrl).toBe("https://aryion.com/g4/user/kokage");
  }
});

it("can parse page cursor", async () => {
  const { cursor } = await getLatestUpdates();

  expect(cursor.currentPage).toBe(1);
  expect(cursor.prevLink).toBeUndefined();
  expect(cursor.nextLink).toBeTruthy();

  const { cursor: pc2 } = await getLatestUpdates(cursor.nextLink);
  expect(pc2.currentPage).toBe(2);
  expect(pc2.prevLink).toBeTruthy();
  expect(pc2.nextLink).toBeTruthy();
});

it("can fetch latest images", async () => {
  const res = await getLatestUpdates({ type: SearchType.Image });
  for (const update of res.updates) {
    expect("previewUrl" in update).toBe(true);
    expect(typeof update.shortDescription).toBe("string");
    expect(typeof update.title).toBe("string");
    expect(typeof update.author).toBe("string");
    expect(update.authorUrl).toContain("https://aryion.com/g4/user/");
    expect(update.detailUrl).toContain("https://aryion.com/g4/view/");
    expect(update.tags.every((tag) => typeof tag === "string")).toBe(true);
  }
});

it("can fetch latest writings", async () => {
  const res = await getLatestUpdates({ type: SearchType.Writing });
  for (const update of res.updates) {
    expect(typeof update.shortDescription).toBe("string");
    const hasPreview = "previewText" in update || "previewUrl" in update;
    expect(hasPreview).toBe(true);
    expect(typeof update.title).toBe("string");
    expect(typeof update.author).toBe("string");
    expect(update.authorUrl).toContain("https://aryion.com/g4/user/");
    expect(update.detailUrl).toContain("https://aryion.com/g4/view/");
    expect(update.tags.every((tag) => typeof tag === "string")).toBe(true);
  }
});
