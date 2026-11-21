import { defineSiteConfig } from "./src/types/config";
import { SITE_URL } from "./site.constants";

export default defineSiteConfig({
  site: {
    url: SITE_URL,
    title: "Jeff Jefferson",
    description: "i write about the things i like.",
    author: "Jeff Jefferson",
    lang: "en",
    timezone: "UTC",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
    toc: true,
  },
  socials: [],
  shareLinks: [],
});
