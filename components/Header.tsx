import Link from 'next/link';
import { Rss } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
            <div className="container mx-auto flex h-16 items-center px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <Rss className="h-6 w-6 text-orange-500" />
                    <span>Rogue Reader</span>
                </Link>
                <div className="ml-auto flex items-center gap-4">
                    {/* Future controls can go here */}
                </div>
            </div>
        </header>
    );
}
