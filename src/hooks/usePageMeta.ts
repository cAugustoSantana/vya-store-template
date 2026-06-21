import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
};

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = meta.title;

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !descriptionTag;
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    const previousDescription = descriptionTag.content;
    if (meta.description) {
      descriptionTag.content = meta.description;
    }

    return () => {
      document.title = previousTitle;
      if (meta.description) {
        if (created) {
          descriptionTag?.remove();
        } else {
          descriptionTag!.content = previousDescription;
        }
      }
    };
  }, [meta.title, meta.description]);
}
