'use client';

import Header from '@/components/Header';
import FeedInput from '@/components/FeedInput';
import FeedGrid from '@/components/FeedGrid';
import { useRSS } from '@/hooks/useRSS';
import { Loader2, Trash2 } from 'lucide-react';

export default function Home() {
  const { allItems, loading, errors, addFeed, removeFeed, feedUrls } = useRSS();

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
        </div>

        <FeedInput onAdd={addFeed} isLoading={loading} />

        {errors.length > 0 && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-bold">Errors occurred:</p>
            <ul className="list-inside list-disc">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Managed Feeds List (Toggleable or just listed below input) */}
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

        {loading && allItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <FeedGrid items={allItems} />
        )}
      </main>
    </div>
  );
}
