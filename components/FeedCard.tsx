import { RSSItem } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface FeedCardProps {
    item: RSSItem;
}

export default function FeedCard({ item }: FeedCardProps) {
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

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
                    <span>
                        {date ? formatDistanceToNow(date, { addSuffix: true }) : 'Unknown date'}
                    </span>
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                        Read <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
