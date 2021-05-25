import { getDOM } from "./dom";
import { AryionUserNotFoundError } from "./error";

export async function verifyUser(aryionUsername: string) {
  const document = await getDOM(`https://aryion.com/g4/user/${aryionUsername}`);
  if (!document) {
    throw new AryionUserNotFoundError(aryionUsername);
  }

  const username = document.querySelector<HTMLAnchorElement>(
    "#uph-namesummary a.user-link"
  )!.textContent!;
  const avatarUrl = document.querySelector<HTMLImageElement>(".avatar")!.src;

  return { username, avatarUrl };
}
