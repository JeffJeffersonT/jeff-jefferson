import type { UIStrings } from "../types";

export default {
  nav: {
    home: "home",
    posts: "posts",
    tags: "tags",
    about: "about",
    archives: "archives",
    search: "search",
  },
  post: {
    publishedAt: "posted",
    updatedAt: "updated",
    sharePostIntro: "share this post",
    sharePostOn: "share this post on {{platform}}",
    sharePostViaEmail: "share this post via email",
    tagLabel: "tags",
    backToTop: "back to top",
    tableOfContents: "table of contents",
    goBack: "go back",
    editPage: "edit page",
    previousPost: "previous post",
    nextPost: "next post",
  },
  pagination: {
    prev: "prev",
    next: "next",
    page: "page",
  },
  home: {
    socialLinks: "social links",
    featured: "featured",
    recentPosts: "recent posts",
    allPosts: "all posts",
  },
  footer: {
    copyright: "copyright",
    allRightsReserved: "all rights reserved.",
  },
  pages: {
    tagTitle: "tag",
    tagDesc: "all the posts tagged",

    tagsTitle: "tags",
    tagsDesc: "pick a tag to find posts about the things i like.",

    postsTitle: "posts",
    postsDesc: "everything i've written so far, newest first.",

    archivesTitle: "archives",
    archivesDesc: "all my posts, sorted by month.",

    searchTitle: "search",
    searchDesc: "looking for something? try a few words.",
  },
  a11y: {
    skipToContent: "skip to content",
    skipTableOfContents: "skip table of contents",
    openMenu: "open menu",
    closeMenu: "close menu",
    toggleTheme: "switch day and night mode",
    searchPlaceholder: "search the site",
    noResults: "nothing matched, sorry",
    goToPreviousPage: "previous page",
    goToNextPage: "next page",
  },
  notFound: {
    title: "404 not found",
    message: "page not found",
    goHome: "go back home",
  },
} satisfies UIStrings;
