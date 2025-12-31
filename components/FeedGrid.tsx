import { RSSItem } from '@/app/types';
import FeedCard from './FeedCard';

interface FeedGridProps {
    items: RSSItem[];
}

export default function FeedGrid({ items }: FeedGridProps) {
    if (items.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-gray-500">No stories found. Add a feed to get started!</p>
            </div>
        );
    }

    return (
        <div className="columns-1 gap-4 space-y-4 px-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
                <FeedCard key={`${item.guid || item.link || index}`} item={item} />
            ))}
        </div>
    );
}
