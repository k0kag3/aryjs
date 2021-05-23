import parse from "date-fns/parse";
import formatISO from "date-fns/formatISO";
import { getDOM } from "./dom";

export interface GetLatestUpdatesResponse {
  cursor: PageCursor;
  updates: Update[];
}

export interface PageCursor {
  currentPage: number;
  prevLink: string | undefined;
  nextLink: string | undefined;
}

export interface Update {
  itemId: string;
  created: string;
  title: string;
  author: string;
  authorUrl: string;
  tags: string[];
  shortDescription: string;
  detailUrl: string;
  previewUrl?: string;
  previewText?: string;
}

export enum SearchType {
  Image = "Images",
  Writing = "Writing",
}

export interface GetLatestUpdatesOptions {
  username?: string;
  type?: SearchType;
}

const LATEST_UPDATES_ENDPOINT = "https://aryion.com/g4/latest.php";

function parsePageCursor(document: Document): PageCursor | undefined {
  const jumps = document.querySelector(".pagejumps");

  if (!jumps) {
    return undefined;
  }

  const currentPage = parseInt(jumps.querySelector("strong")!.textContent!, 10);
  const prevLink = (jumps.previousElementSibling as HTMLAnchorElement | null)
    ?.href;
  const nextLink = (jumps.nextElementSibling as HTMLAnchorElement | null)?.href;

  return {
    currentPage,
    prevLink,
    nextLink,
  };
}

/**
 * Get latest updates.
 *
 * @example
 * ```
 * getLatestUpdates()
 * getLatestUpdates({username: 'kokage', type: SearchType.Image})
 * getLatestUpdates('https://aryion.com/g4/latest.php?p=2&after=2021-05-21%2017:54:21')
 * ```
 */
export async function getLatestUpdates(
  args?: string | GetLatestUpdatesOptions
): Promise<GetLatestUpdatesResponse> {
  let target = LATEST_UPDATES_ENDPOINT;

  if (typeof args === "string") {
    target = args;
  } else if (typeof args === "object") {
    const { username, type } = args;

    const params = new URLSearchParams();

    if (username) params.append("name", username);
    if (type) params.append("type_search", type);

    target = LATEST_UPDATES_ENDPOINT + "?" + params.toString();
  }

  const document = await getDOM(target);
  const cursor = parsePageCursor(document)!;

  const updates = Array.from(document.querySelectorAll(".detail-item")).map(
    (element): Update => {
      const update = {
        itemId: element
          .querySelector<HTMLAnchorElement>(".iteminfo a")!
          .href.replace("https://aryion.com/g4/view/", ""),
        title: element.querySelector(".iteminfo a")!.textContent!,
        created: formatISO(
          parse(
            // original timezone: UTC-4
            element.querySelector(".pretty-date")!.getAttribute("title")! +
              " -04",
            "MMM do, yyyy hh:mm aa X",
            new Date()
          )
        ),
        author: element.querySelector(".user-link")!.textContent!,
        authorUrl: element.querySelector<HTMLAnchorElement>(".user-link")!.href,
        tags: Array.from(element.querySelectorAll(".taglist > a")).map(
          (link) => link.textContent!
        ),
        shortDescription: element.querySelector(
          ".iteminfo > p:nth-last-child(1)"
        )!.textContent!,
        detailUrl:
          element.querySelector<HTMLAnchorElement>(".iteminfo a")!.href,
      } as Update;

      const thumbnail =
        element.querySelector<HTMLImageElement>("a.thumb > img");
      // image -> must have thumbnail
      // story -> must have either thumbnail or preview text
      //   TODO: verify it is true
      if (thumbnail) {
        update.previewUrl = thumbnail.src;
      }

      const previewElement =
        element.querySelector<HTMLParagraphElement>("a.thumb > p");
      if (previewElement) {
        update.previewText = previewElement.textContent!;
      }

      return update;
    }
  );

  return {
    cursor,
    updates,
  };
}

export async function* iterateLatestUpdates(
  args?: string | GetLatestUpdatesOptions
) {
  while (true) {
    const { cursor, updates } = await getLatestUpdates(args);

    if (!cursor.nextLink) {
      break;
    }

    yield updates;

    args = cursor.nextLink;
  }
}
