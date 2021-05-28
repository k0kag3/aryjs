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

    /**
     * Observed status codes
     * 500 - INTERNAL SERVER ERROR
     * 520 - CF Unknown error
     * 522 - CF Connection timed out
     */
    if (res.status >= 500 && res.status < 600) {
      debug("status:", res.status);
      if (retryCount <= 0) {
        debug("reached retry max");
        throw new Error(res.status + ": " + res.statusText);
      }
      retryCount -= 1;
      debug("retrying:", retryCount);
      continue;
    } else if (res.status === 404) {
      debug("status:", res.status);
      return undefined;
    }

    const resText = await res.text();

    document = new JSDOM(resText).window.document;

    break;
  }

  return document;
}
