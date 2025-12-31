import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RSSFeed, RSSItem } from '@/app/types';

interface RSSStore {
    feedUrls: string[];
    feeds: RSSFeed[];
    allItems: RSSItem[]; // Aggregated items
    favorites: string[]; // List of item links
    readLater: string[]; // List of item links
    history: string[]; // List of item links (visited/read)
    tags: Record<string, string[]>; // Map link -> tags

    // AI Settings
    ollamaStatus: 'running' | 'stopped' | 'checking';
    availableModels: string[];
    selectedModel: string | null;

    // Actions
    addFeed: (url: string) => void;
    removeFeed: (url: string) => void;
    toggleFavorite: (link: string) => void;
    toggleReadLater: (link: string) => void;
    markAsRead: (link: string) => void;
    updateItemTags: (link: string, tags: string[]) => void;

    // AI Actions
    setOllamaStatus: (status: 'running' | 'stopped' | 'checking') => void;
    setAvailableModels: (models: string[]) => void;
    setSelectedModel: (model: string) => void;

    // Async Actions
    fetchFeeds: () => Promise<void>;
    isLoading: boolean;
    errors: string[];
}

export const useStore = create<RSSStore>()(
    persist(
        (set, get) => ({
            feedUrls: [],
            feeds: [],
            allItems: [],
            favorites: [],
            readLater: [],
            history: [],
            tags: {},

            ollamaStatus: 'checking',
            availableModels: [],
            selectedModel: null,

            isLoading: false,
            errors: [],

            addFeed: (url) => {
                const { feedUrls, fetchFeeds } = get();
                if (!feedUrls.includes(url)) {
                    set({ feedUrls: [...feedUrls, url] });
                    fetchFeeds(); // Auto-fetch on add
                }
            },

            removeFeed: (url) => {
                set((state) => ({
                    feedUrls: state.feedUrls.filter((u) => u !== url),
                    feeds: state.feeds.filter(f => f.feedUrl !== url),
                    // We might want to keep history/tags even if feed is removed, 
                    // but for items, we should probably re-aggregate.
                    // For simplicity, we'll let fetchFeeds handle the re-aggregation next time or do it now.
                }));
                get().fetchFeeds();
            },

            toggleFavorite: (link) =>
                set((state) => {
                    const isFav = state.favorites.includes(link);
                    return {
                        favorites: isFav
                            ? state.favorites.filter((l) => l !== link)
                            : [...state.favorites, link],
                    };
                }),

            toggleReadLater: (link) =>
                set((state) => {
                    const isSaved = state.readLater.includes(link);
                    return {
                        readLater: isSaved
                            ? state.readLater.filter((l) => l !== link)
                            : [...state.readLater, link],
                    };
                }),

            markAsRead: (link) =>
                set((state) => {
                    if (state.history.includes(link)) return {};
                    return { history: [...state.history, link] };
                }),

            updateItemTags: (link, newTags) =>
                set((state) => ({
                    tags: { ...state.tags, [link]: newTags },
                })),

            setOllamaStatus: (status) => set({ ollamaStatus: status }),
            setAvailableModels: (models) => set((state) => ({
                availableModels: models,
                // Default to first if none selected
                selectedModel: state.selectedModel || models[0] || null
            })),
            setSelectedModel: (model) => set({ selectedModel: model }),

            fetchFeeds: async () => {
                const { feedUrls } = get();
                if (feedUrls.length === 0) {
                    set({ feeds: [], allItems: [], isLoading: false });
                    return;
                }

                set({ isLoading: true, errors: [] });
                const fetchedFeeds: RSSFeed[] = [];
                const currentErrors: string[] = [];

                await Promise.all(
                    feedUrls.map(async (url) => {
                        try {
                            const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}`);
                            if (!res.ok) throw new Error('Failed to fetch');
                            const data = await res.json();
                            fetchedFeeds.push({ ...data, feedUrl: url });
                        } catch (err) {
                            currentErrors.push(`Failed to load: ${url}`);
                        }
                    })
                );

                // Aggregate
                const all = fetchedFeeds.flatMap((feed) =>
                    feed.items.map((item) => ({
                        ...item,
                        feedTitle: feed.title,
                        feedUrl: feed.feedUrl,
                    }))
                );

                // Sort
                all.sort((a, b) => {
                    const dateA = a.isoDate ? new Date(a.isoDate) : new Date(a.pubDate || 0);
                    const dateB = b.isoDate ? new Date(b.isoDate) : new Date(b.pubDate || 0);
                    return dateB.getTime() - dateA.getTime();
                });

                set({
                    feeds: fetchedFeeds,
                    allItems: all,
                    isLoading: false,
                    errors: currentErrors,
                });
            },
        }),
        {
            name: 'rss-reader-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                feedUrls: state.feedUrls,
                favorites: state.favorites,
                readLater: state.readLater,
                history: state.history,
                tags: state.tags,
                selectedModel: state.selectedModel, // Persist selection
                // We optionally persist 'feeds'/'allItems' for offline support, 
                // but usually we want fresh data. Let's persist them for now for faster load.
                feeds: state.feeds,
                allItems: state.allItems
            }),
        }
    )
);
