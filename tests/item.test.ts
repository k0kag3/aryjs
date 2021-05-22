import { getItemDetail } from "../src";

it("can fetch image", async () => {
  const item = await getItemDetail("693308");
  expect(item.type).toBe("image");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
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

it("can fetch writing", async () => {
  const item = await getItemDetail("594831");
  expect(item.type).toBe("writing");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
});

it("can fetch writing with thumbnail", async () => {
  const item = await getItemDetail("693294");
  expect(item.type).toBe("writing");
  expect(item.authorAvatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
});
