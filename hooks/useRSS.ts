import { useState, useEffect, useCallback } from 'react';
import { RSSFeed, RSSItem } from '@/app/types';

const STORAGE_KEY = 'rss_feed_urls';

export function useRSS() {
    const [feedUrls, setFeedUrls] = useState<string[]>([]);
    const [feeds, setFeeds] = useState<RSSFeed[]>([]);
    const [allItems, setAllItems] = useState<RSSItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);

    // Load subscriptions from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setFeedUrls(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved feeds', e);
            }
        } else {
            setFeedUrls([]);
        }
    }, []);

    // Save to local storage whenever feedUrls changes
    useEffect(() => {
        if (feedUrls.length > 0) { // Avoid overwriting with empty on initial mount if check missed
            localStorage.setItem(STORAGE_KEY, JSON.stringify(feedUrls));
        }
    }, [feedUrls]);

    const fetchFeeds = useCallback(async () => {
        if (feedUrls.length === 0) {
            setFeeds([]);
            setAllItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrors([]);
        const fetchedFeeds: RSSFeed[] = [];
        const currentErrors: string[] = [];

        await Promise.all(feedUrls.map(async (url) => {
            try {
                const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                fetchedFeeds.push({ ...data, feedUrl: url });
            } catch (err) {
                currentErrors.push(`Failed to load: ${url}`);
            }
        }));

        setFeeds(fetchedFeeds);
        setErrors(currentErrors);

        // Aggregate and sort all items
        const all = fetchedFeeds.flatMap(feed => feed.items.map(item => ({
            ...item,
            feedTitle: feed.title, // Attach source feed title to item
            feedUrl: feed.feedUrl
        })));

        // Sort by date descending
        all.sort((a, b) => {
            const dateA = a.isoDate ? new Date(a.isoDate) : new Date(a.pubDate || 0);
            const dateB = b.isoDate ? new Date(b.isoDate) : new Date(b.pubDate || 0);
            return dateB.getTime() - dateA.getTime();
        });

        setAllItems(all);
        setLoading(false);
    }, [feedUrls]);

    // Fetch when feedUrls change
    useEffect(() => {
        fetchFeeds();
    }, [fetchFeeds]);

    const addFeed = (url: string) => {
        if (!feedUrls.includes(url)) {
            setFeedUrls(prev => [...prev, url]);
        }
    };

    const removeFeed = (url: string) => {
        setFeedUrls(prev => {
            const updated = prev.filter(u => u !== url);
            if (updated.length === 0) {
                localStorage.removeItem(STORAGE_KEY); // Clear if empty
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    };

    return {
        feedUrls,
        feeds,
        allItems,
        loading,
        errors,
        addFeed,
        removeFeed,
        refresh: fetchFeeds
    };
}
