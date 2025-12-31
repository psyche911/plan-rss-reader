export interface RSSItem {
    title?: string;
    link?: string;
    pubDate?: string;
    content?: string;
    contentSnippet?: string;
    isoDate?: string;
    [key: string]: any;
}

export interface RSSFeed {
    title?: string;
    description?: string;
    link?: string;
    items: RSSItem[];
    feedUrl?: string;
}

export interface FeedError {
    url: string;
    message: string;
}
