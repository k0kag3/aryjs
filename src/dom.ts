import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { debug } from "./util";

interface GetDOMOptions {
  maxRetry?: number;
}

export async function getDOM(
  endpoint: string,
  { maxRetry = 3 }: GetDOMOptions = {}
): Promise<Document | undefined> {
  let retryCount = maxRetry;
  let document: Document;

  while (true) {
    const res = await fetch(endpoint);
    debug("status:", res.status);
    switch (res.status) {
      case 500:
      case 522: {
        if (retryCount <= 0) {
          debug("reached retry max");
          throw new Error(res.status + ": " + res.statusText);
        }
        retryCount -= 1;
        debug("retrying:", retryCount);
        break;
      }
      case 404:
        return undefined;
    }
    const resText = await res.text();

    document = new JSDOM(resText).window.document;

    break;
  }

  return document;
}
