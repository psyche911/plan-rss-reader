export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

interface OllamaResponse {
    response: string;
    done: boolean;
    [key: string]: any;
}

export async function generateOllama(prompt: string, model: string = OLLAMA_MODEL): Promise<string> {
    try {
        const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false, // For MVP we'll use non-streaming to keep logic simple
            }),
        });

        if (!res.ok) {
            throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json() as OllamaResponse;
        return data.response;
    } catch (error: any) {
        console.error('Failed to call Ollama:', error);
        if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            throw new Error("Ollama is not running. Check Settings.");
        }
        throw error;
    }
}
