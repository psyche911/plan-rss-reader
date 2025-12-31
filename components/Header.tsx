'use client';

import Link from 'next/link';
import { Rss, Settings } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Header() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        <Rss className="h-6 w-6 text-orange-500" />
                        <span>Rogue Reader</span>
                    </Link>
                    <div className="ml-auto flex items-center gap-4">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            title="AI Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}
