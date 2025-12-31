'use client';

import Header from '@/components/Header';
import FeedInput from '@/components/FeedInput';
import FeedGrid from '@/components/FeedGrid';
import TagFilter from '@/components/TagFilter';
import AnalyzeButton from '@/components/AnalyzeButton';
import DailyReportModal from '@/components/DailyReportModal';
import { useStore } from '@/store/useStore';
import { Loader2, Trash2, BookOpen, Star, Clock } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export default function Home() {
  const {
    allItems, isLoading, errors, addFeed, removeFeed, feedUrls,
    updateItemTags, favorites, readLater, fetchFeeds
  } = useStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [view, setView] = useState<'all' | 'favorites' | 'readLater'>('all');
  const [report, setReport] = useState<string | null>(null);

  // Initial fetch on mount
  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  // Derive unique tags from items
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allItems.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;

    // View filter
    if (view === 'favorites') {
      items = items.filter(item => item.link && favorites.includes(item.link));
    } else if (view === 'readLater') {
      items = items.filter(item => item.link && readLater.includes(item.link));
    }

    // Tag filter
    if (selectedTag) {
      items = items.filter(item => item.tags?.includes(selectedTag) || (item.link && useStore.getState().tags[item.link]?.includes(selectedTag)));
    }

    return items;
  }, [allItems, selectedTag, view, favorites, readLater]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header />

      <main className="container mx-auto pb-10">
        <div className="flex flex-col items-center justify-center pt-10">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Your Personal <span className="text-orange-500">News Deck</span>
          </h1>
          <p className="max-w-xl text-center text-lg text-gray-600 dark:text-gray-400">
            Aggregate your favorite feeds efficiently. Private, local, and fast.
          </p>

          <div className="mt-6 flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setView('all')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === 'all' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              <BookOpen className="h-4 w-4" /> All Stories
            </button>
            <button
              onClick={() => setView('favorites')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === 'favorites' ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              <Star className="h-4 w-4" /> Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setView('readLater')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${view === 'readLater' ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              <Clock className="h-4 w-4" /> Read Later ({readLater.length})
            </button>
          </div>
        </div>

        <FeedInput onAdd={addFeed} isLoading={isLoading} />

        {errors.length > 0 && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-bold">Errors occurred:</p>
            <ul className="list-inside list-disc">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Managed Feeds List */}
        {feedUrls.length > 0 && (
          <div className="mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-2 px-4">
            {feedUrls.map(url => (
              <div key={url} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <span className="max-w-[150px] truncate" title={url}>{url}</span>
                <button onClick={() => removeFeed(url)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 flex justify-center">
          <AnalyzeButton
            items={filteredItems}
            onUpdateTags={updateItemTags}
            onShowReport={setReport}
          />
        </div>

        <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />

        <DailyReportModal
          isOpen={!!report}
          onClose={() => setReport(null)}
          report={report || ''}
        />

        {isLoading && allItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <FeedGrid items={filteredItems} />
        )}
      </main>
    </div>
  );
}
