'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FeedInputProps {
    onAdd: (url: string) => void;
    isLoading?: boolean;
}

export default function FeedInput({ onAdd, isLoading }: FeedInputProps) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAdd(url.trim());
            setUrl('');
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                    type="url"
                    required
                    placeholder="Enter RSS feed URL (e.g. https://news.ycombinator.com/rss)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={twMerge(
                        "w-full rounded-full border border-gray-300 bg-white py-3 pl-6 pr-14 text-base shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-orange-500",
                        isLoading && "opacity-80 cursor-not-allowed"
                    )}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-transform hover:scale-105 hover:bg-orange-600 focus:outline-none active:scale-95 disabled:opacity-50"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
}
