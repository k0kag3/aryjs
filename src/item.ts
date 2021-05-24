import { getDOM } from "./dom";

export interface Tag {
  name: string;
  url: string;
  types: string[];
}

export interface BaseItem {
  mimeType: string;
  viewUrl: string;
  downloadUrl: string;
  authorAvatarUrl: string;
  tags: Tag[];
}

export interface ImageItem extends BaseItem {
  type: "image";
  images: {
    small: string;
    original: string;
  };
}

export interface WritingItem extends BaseItem {
  type: "writing";
  content?: {
    text: string;
    html: string;
  };
}

export interface OtherMaterialItem extends BaseItem {
  type: "other";
}

export type Item = ImageItem | WritingItem | OtherMaterialItem;

export async function getItemDetail(itemId: string): Promise<Item> {
  const viewUrl = `https://aryion.com/g4/view/${itemId}`;
  const document = await getDOM(viewUrl);
  if (!document) {
    throw new Error("Cannot fetch document");
  }

  const authorAvatarUrl =
    document.querySelector<HTMLImageElement>(".avatar")?.src;
  if (!authorAvatarUrl) {
    throw new Error("Cannot find avatar url: " + document.body.innerHTML);
  }

  const mimeType = document
    .querySelector<HTMLDivElement>(".item-detail > p:nth-child(4)")
    ?.textContent?.match(/MIME Type: (.+)/)?.[1];
  if (!mimeType) {
    throw new Error("Cannot find mime type: " + document.body.innerHTML);
  }

  const itemBox = document.querySelector(".item-box");
  if (!itemBox) {
    throw new Error("Cannot locate item box: " + document.body.innerHTML);
  }

  const downloadUrl = `https://aryion.com/g4/data.php?id=${itemId}`;
  const tags = parseTags(document);
  if (!tags) {
    throw new Error("Cannot parse tags: " + document.body.innerHTML);
  }

  const itemItself = itemBox.querySelector("#item-itself");
  if (!itemItself) {
    // text/plain
    const gBoxContents = itemBox.querySelector(".g-box-contents");
    if (!gBoxContents) {
      throw new Error("Cannot find gbox contents: " + itemBox.innerHTML);
    }
    return {
      type: "writing",
      mimeType,
      tags,
      viewUrl,
      downloadUrl,
      authorAvatarUrl,
      content: {
        text: gBoxContents.textContent || "",
        html: gBoxContents.innerHTML,
      },
    };
  }
  const itemTag = itemItself.tagName;

  switch (itemTag) {
    case "IMG": {
      /** Expected formats:
       * - images
       */
      const ogpImageUrl = document.querySelector<HTMLMetaElement>(
        'meta[name="twitter:image"]'
      )!.content;

      const imageUrl = document.querySelector<HTMLMetaElement>(
        'meta[property="og:image:secure_url"]'
      )!.content;

      return {
        type: "image",
        mimeType,
        tags,
        viewUrl,
        downloadUrl,
        authorAvatarUrl,
        images: {
          small: ogpImageUrl,
          original: imageUrl,
        },
      };
    }
    case "IFRAME": {
      /** Expected formats:
       * - application/vnd.openxmlformats-officedocument.wordprocessingml.document
       * - application/rtf
       * - application/msword
       * - application/pdf
       */
      const iframe = itemItself as HTMLIFrameElement;
      const contentUrl = iframe.src;

      const writing: WritingItem = {
        type: "writing",
        mimeType,
        tags,
        viewUrl,
        downloadUrl,
        authorAvatarUrl,
      };

      if (mimeType !== "application/pdf") {
        const res = await getDOM(contentUrl);
        if (!res) {
          throw new Error("Cannot fetch document");
        }
        writing.content = {
          text: res.body.textContent?.trim() || "",
          html: res.body.innerHTML,
        };
      }

      return writing;
    }
    case "DIV": {
      // flash?
      return {
        type: "other",
        mimeType,
        tags,
        viewUrl,
        downloadUrl,
        authorAvatarUrl,
      };
    }
    default: {
      throw new Error("Unrecognized item type found");
    }
  }
}

function parseTags(document: Document): Tag[] | undefined {
  const taglist = document.querySelectorAll<HTMLAnchorElement>(".taglist > a");
  if (!taglist) return undefined;

  const tags = Array.from(taglist).map((el) => ({
    name: el.innerHTML,
    url: el.href,
    types: Array.from(el.classList),
  }));

  return tags;
}
