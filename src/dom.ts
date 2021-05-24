import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function getDOM(endpoint: string): Promise<Document> {
  let retryCount = 3;
  let res: string;
  while (true) {
    try {
      res = await fetch(endpoint).then((res) => res.text());
      break;
    } catch (err) {
      if (err.code === "ETIMEOUT") {
        if (retryCount <= 0) {
          throw err;
        }
        retryCount -= 1;
      } else {
        throw err;
      }
    }
  }
  const {
    window: { document },
  } = new JSDOM(res);
  return document;
}
