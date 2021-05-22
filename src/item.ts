import { getDOM } from "./dom";

export interface BaseItem {
  authorAvatarUrl: string;
}

export type Item = ImageItem | WritingItem | OtherMaterialItem;

export interface ImageItem extends BaseItem {
  type: "image";
  images: {
    small: string;
    original: string;
  };
}

export interface WritingItem extends BaseItem {
  type: "writing";
}

export interface OtherMaterialItem extends BaseItem {
  type: "other";
}

export async function getItemDetail(itemId: string): Promise<Item> {
  const itemEndpoint = `https://aryion.com/g4/view/${itemId}`;
  const document = await getDOM(itemEndpoint);

  const itemTag = document.querySelector("#item-itself")!.tagName;

  const authorAvatarUrl =
    document.querySelector<HTMLImageElement>(".avatar")!.src;

  switch (itemTag) {
    case "IMG": {
      // image
      const ogpImageUrl = document.querySelector<HTMLMetaElement>(
        'meta[name="twitter:image"]'
      )!.content;

      const imageUrl = document.querySelector<HTMLMetaElement>(
        'meta[property="og:image:secure_url"]'
      )!.content;

      return {
        type: "image",
        images: {
          small: ogpImageUrl,
          original: imageUrl,
        },
        authorAvatarUrl,
      } as ImageItem;
    }
    case "IFRAME": {
      // text / pdf / rtf / other office document
      return {
        type: "writing",
        authorAvatarUrl,
      } as WritingItem;
    }
    case "DIV": {
      // flash
      return {
        type: "other",
        authorAvatarUrl,
      } as OtherMaterialItem;
    }
    default: {
      throw new Error("Unrecognized item type found");
    }
  }
}
