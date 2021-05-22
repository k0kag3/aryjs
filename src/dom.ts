import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function getDOM(endpoint: string) {
  const {
    window: { document },
  } = new JSDOM(await fetch(endpoint).then((res) => res.text()));
  return document;
}
