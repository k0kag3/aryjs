import { getItemDetail } from "../src";

it("can handle image (png)", async () => {
  const item = await getItemDetail("693308");
  expect(item.type).toBe("image");
  expect(item.mimeType).toBe("image/png");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
  expect(item.tags).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Belly",
        url: "https://aryion.com/g4/tags.php?tag=Belly",
        types: [],
      }),
    ])
  );
  expect(item.viewUrl).toBe("https://aryion.com/g4/view/693308");
  expect(item.downloadUrl).toBe("https://aryion.com/g4/data.php?id=693308");
  if (item.type !== "image") {
    fail();
  }
  expect(item.images.small).toBe(
    "https://aryion.com/g4/derivative/693308-46093-1as4k2k-300.jpg"
  );
  expect(item.images.original).toBe(
    "https://aryion.com/g4/data/693308-46093-1as4k2s.png/ConsumptionZ-693308-image0.png"
  );
});

it("can handle iframe (msword)", async () => {
  const item = await getItemDetail("594831");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
  expect(item.type).toBe("writing");
  expect(item.mimeType).toBe("application/msword");
  if (item.type !== "writing") {
    fail();
  }
  expect(item.content?.text).toContain("As the water slid down");
  expect(item.content?.html).toContain("<span>Lexi looked up");
});

it("can handle pdf", async () => {
  const item = await getItemDetail("692813");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
  expect(item.type).toBe("writing");
  expect(item.mimeType).toBe("application/pdf");
  if (item.type !== "writing") {
    fail();
  }
  expect(item.content).toBeUndefined();
});

it("can handle plaintext", async () => {
  const item = await getItemDetail("693235");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
  expect(item.type).toBe("writing");
  expect(item.mimeType).toBe("text/plain");
  if (item.type !== "writing") {
    fail();
  }
  expect(item.content?.text).toContain("Summary");
  expect(item.content?.html).toContain("What to expect");
});
