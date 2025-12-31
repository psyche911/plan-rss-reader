import { useRef } from 'react';
import { stringToColor } from '@/lib/colorUtils';
import { clsx } from 'clsx';

interface TagFilterProps {
    tags: string[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
    if (tags.length === 0) return null;

    return (
        <div className="relative mb-6 w-full px-4">
            <div
                className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2"
            // Simple CSS scrolling
            >
                <button
                    onClick={() => onSelectTag(null)}
                    className={clsx(
                        "flex shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                        selectedTag === null
                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    )}
                >
                    All Stories
                </button>

                {tags.map(tag => {
                    const isSelected = selectedTag === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => onSelectTag(isSelected ? null : tag)}
                            style={!isSelected ? { backgroundColor: stringToColor(tag), color: '#333' } : {}}
                            className={clsx(
                                "flex shrink-0 items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                                isSelected
                                    ? "border-gray-900 bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2 dark:border-white dark:bg-white dark:text-black dark:ring-white dark:ring-offset-black"
                                    : "border-transparent opacity-80 hover:opacity-100 dark:opacity-90 dark:hover:opacity-100"
                            )}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
