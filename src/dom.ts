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
    try {
      const res = await fetch(endpoint);
      debug("status:", res.status);
      switch (res.status) {
        case 522: {
          const err = new Error();
          err.name = "CFTIMEOUT";
          throw err;
        }
      }
      const resText = await res.text();

      document = new JSDOM(resText).window.document;

      break;
    } catch (err) {
      debug("error", err, err.code);
      if (err.name === "CFTIMEOUT") {
        if (retryCount <= 0) {
          throw err;
        }
        retryCount -= 1;
      } else {
        throw err;
      }
    }
  }

  return document;
}
