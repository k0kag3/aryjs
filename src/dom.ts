import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function getDOM(endpoint: string): Promise<Document | undefined> {
  let retryCount = 3;
  while (retryCount > 0) {
    try {
      const {
        window: { document },
      } = new JSDOM(await fetch(endpoint).then((res) => res.text()));
      return document;
    } catch (err) {
      if (err.code === "ETIMEOUT") {
        retryCount -= 1;
      } else {
        throw err;
      }
    }
  }
}
