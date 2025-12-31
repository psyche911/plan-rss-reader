import { X, Copy, Download } from 'lucide-react';

interface DailyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: string;
}

export default function DailyReportModal({ isOpen, onClose, report }: DailyReportModalProps) {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(report);
    };

    const handleDownload = () => {
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Briefing</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Copy to clipboard"
                        >
                            <Copy className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Download Report"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                    <div className="prose prose-orange dark:prose-invert max-w-none whitespace-pre-wrap">
                        {report}
                    </div>
                </div>
            </div>
        </div>
    );
}
