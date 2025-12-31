import { RSSItem } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { stringToColor } from '@/lib/colorUtils';

interface FeedCardProps {
    item: RSSItem;
}

import { useStore } from '@/store/useStore';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function FeedCard({ item }: FeedCardProps) {
    const { toggleFavorite, toggleReadLater, markAsRead, favorites, readLater, history, tags } = useStore();
    const itemTags = item.link ? (tags[item.link] || item.tags) : item.tags;
    const isFavorite = item.link ? favorites.includes(item.link) : false;
    const isReadLater = item.link ? readLater.includes(item.link) : false;
    const isRead = item.link ? history.includes(item.link) : false;

    // Try to parse an image from the content if enclosure is missing
    const getImage = () => {
        if (item.enclosure?.url) return item.enclosure.url;
        if (item['media:content'] && item['media:content']['@_url']) return item['media:content']['@_url']; // Some feeds use media:content

        // Very basic regex to find first image in content
        const imgRegex = /<img.*?src="(.*?)"/;
        const match = imgRegex.exec(item.content || item.contentSnippet || '');
        return match ? match[1] : null;
    };

    const imageUrl = getImage();
    const dateStr = item.isoDate || item.pubDate;
    const date = dateStr ? new Date(dateStr) : null;

    return (
        <div className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            {imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={item.title || 'Story image'}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                </div>
            )}
            <div className="p-4">
                {item.feedTitle && (
                    <div className="mb-2 text-xs font-medium text-orange-600 dark:text-orange-400">
                        {item.feedTitle}
                    </div>
                )}
                <h3 className="mb-2 text-lg font-bold leading-tight text-gray-900 dark:text-gray-100">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-orange-500/50">
                        {item.title}
                    </a>
                </h3>

                <p className="mb-4 text-sm text-gray-600 line-clamp-3 dark:text-gray-400">
                    {item.contentSnippet?.replace(/<[^>]+>/g, '') || 'No summary available.'}
                </p>

                {itemTags && itemTags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {itemTags.map(tag => (
                            <span
                                key={tag}
                                className="rounded-md px-2 py-0.5 text-xs font-medium"
                                style={{ backgroundColor: stringToColor(tag), color: '#333' }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
                    <div className="flex gap-3">
                        <span>
                            {date ? formatDistanceToNow(date, { addSuffix: true }) : 'Unknown date'}
                        </span>
                        {isRead && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-3 w-3" /> Read
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => item.link && toggleFavorite(item.link)}
                            className={clsx("transition-colors hover:text-orange-500", isFavorite ? "text-orange-500 fill-orange-500" : "text-gray-400")}
                            title="Toggle Favorite"
                        >
                            <Star className={clsx("h-4 w-4", isFavorite && "fill-current")} />
                        </button>
                        <button
                            onClick={() => item.link && toggleReadLater(item.link)}
                            className={clsx("transition-colors hover:text-blue-500", isReadLater ? "text-blue-500 fill-blue-500" : "text-gray-400")}
                            title="Read Later"
                        >
                            <Clock className={clsx("h-4 w-4", isReadLater && "fill-current")} />
                        </button>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => item.link && markAsRead(item.link)}
                            className="flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400"
                        >
                            Read <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
