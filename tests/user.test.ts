import { verifyUser, AryionUserNotFoundError } from "../src";

it("can fetch canonical username", async () => {
  const user = await verifyUser("KoKaGe");
  expect(user.username).toBe("kokage");
  expect(user.avatarUrl).toContain(
    "https://aryion.com/forum/download/file.php?avatar"
  );
});

it("return error then fetching invalid user", () => {
  expect(verifyUser("wajfowaijfwoafjaif")).rejects.toThrow(
    AryionUserNotFoundError
  );
});
