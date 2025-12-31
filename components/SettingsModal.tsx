import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        ollamaStatus, availableModels, selectedModel,
        setOllamaStatus, setAvailableModels, setSelectedModel
    } = useStore();

    const [isChecking, setIsChecking] = useState(false);
    const [spawnMessage, setSpawnMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const checkStatus = async () => {
        setIsChecking(true);
        setOllamaStatus('checking');
        setSpawnMessage(null);
        try {
            const res = await fetch('/api/ai/config');
            const data = await res.json();

            if (data.running) {
                setOllamaStatus('running');
                setAvailableModels(data.models);
                setErrorMessage(null);
            } else {
                setOllamaStatus('stopped');
                setAvailableModels([]);
                setErrorMessage("Service unreachable. Is Ollama running?");
            }
        } catch (e: any) {
            setOllamaStatus('stopped');
            setErrorMessage(e.message || "Connection failed");
        } finally {
            setIsChecking(false);
        }
    };

    const handleSpawn = async () => {
        setSpawnMessage("Attempting to start Ollama...");
        try {
            const res = await fetch('/api/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'spawn' })
            });
            const data = await res.json();
            if (data.success) {
                setSpawnMessage("Launch command sent. Waiting for service...");
                // Wait 5 seconds then check again
                setTimeout(checkStatus, 5000);
            } else {
                setSpawnMessage("Failed: " + (data.error || 'Unknown error'));
            }
        } catch (e) {
            setSpawnMessage("Failed to send spawn command");
        }
    };

    // Check on open
    useEffect(() => {
        if (isOpen) {
            checkStatus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings & AI Config</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">Ollama Status</h3>
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                {isChecking ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                ) : ollamaStatus === 'running' ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {isChecking ? "Checking..." : ollamaStatus === 'running' ? "Service Running" : "Service Stopped"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {ollamaStatus === 'running' ? `Ready to serve` : "Is Ollama installed?"}
                                    </p>
                                </div>
                            </div>

                            {ollamaStatus !== 'running' && !isChecking && (
                                <button
                                    onClick={handleSpawn}
                                    className="flex items-center gap-2 rounded-md bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                >
                                    <Play className="h-3 w-3" /> Start
                                </button>
                            )}
                        </div>
                        {errorMessage && <p className="mt-2 text-xs text-red-500">{errorMessage}</p>}
                        {spawnMessage && <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">{spawnMessage}</p>}
                    </div>

                    {/* Model Section */}
                    {ollamaStatus === 'running' && (
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">AI Model</h3>
                            {availableModels.length > 0 ? (
                                <select
                                    value={selectedModel || ''}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                >
                                    {availableModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">No models found. Run `ollama pull llama3`</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
