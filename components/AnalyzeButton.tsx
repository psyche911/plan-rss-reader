import { useState } from 'react';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { RSSItem } from '@/app/types';

interface AnalyzeButtonProps {
    items: RSSItem[];
    onUpdateTags: (link: string, tags: string[]) => void;
    onShowReport: (report: string) => void;
}

import { useStore } from '@/store/useStore';

export default function AnalyzeButton({ items, onUpdateTags, onShowReport }: AnalyzeButtonProps) {
    const { selectedModel } = useStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    // 1. Tagging Functionality
    const handleAnalyze = async () => {
        setIsAnalyzing(true);

        const untagged = items.filter(item => !item.tags || item.tags.length === 0).slice(0, 5);

        if (untagged.length === 0) {
            alert("All visible items are already analyzed!");
            setIsAnalyzing(false);
            return;
        }

        let taggedCount = 0;

        // Process sequentially or in small parallel batches
        for (const item of untagged) {
            if (!item.link) continue;

            try {
                const res = await fetch('/api/ai/tag', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: item.title || '',
                        content: item.contentSnippet || item.content || '',
                        model: selectedModel
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.tags) {
                        onUpdateTags(item.link, data.tags);
                        taggedCount++;
                    }
                } else {
                    console.warn(`Tagging failed: ${res.status}`);
                }
            } catch (e) {
                console.error('Tagging failed for item', item.title);
            }
        }

        setIsAnalyzing(false);
        if (taggedCount > 0) {
            alert(`Successfully analyzed ${taggedCount} stories. Check the new tags!`);
        } else {
            alert('Analysis complete, but no tags were generated check Ollama status.');
        }
    };

    // 2. Reporting Functionality
    const handleReport = async () => {
        setIsReporting(true);

        // Take top 20 items text
        const phrases = items.slice(0, 20).map(item => `${item.title}: ${item.contentSnippet || ''}`);

        try {
            const res = await fetch('/api/ai/summary', {
                method: 'POST',
                body: JSON.stringify({ phrases, model: selectedModel })
            });

            if (res.ok) {
                const data = await res.json();
                onShowReport(data.summary);
            } else {
                throw new Error(`API Error: ${res.status}`);
            }
        } catch (e) {
            console.error('Reporting failed', e);
            alert('Failed to generate report. Check if Ollama is running in Settings.');
        }

        setIsReporting(false);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || items.length === 0}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Feeds'}
            </button>

            <button
                onClick={handleReport}
                disabled={isReporting || items.length === 0}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
                {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {isReporting ? 'Generating...' : 'Daily Report'}
            </button>
        </div>
    );
}
