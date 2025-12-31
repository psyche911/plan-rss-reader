import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

export async function GET() {
    try {
        // 1. Check if running by fetching tags
        const res = await fetch(`${OLLAMA_HOST}/api/tags`);

        if (!res.ok) {
            // Service might be down or reachable but erroring
            return NextResponse.json({ running: false, models: [] });
        }

        const data = await res.json();
        const models = data.models?.map((m: any) => m.name) || [];

        return NextResponse.json({ running: true, models });

    } catch (error) {
        console.error('Ollama connection failed', error);
        return NextResponse.json({ running: false, models: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { command, model } = await request.json();

        if (command === 'spawn') {
            // Attempt to spawn. This is tricky regardless because of background processes.
            // We'll try to run `ollama serve` in a detached way? 
            // Or actually usually users run accessing the app.
            // Usually `ollama run <model>` is better if we want to ensure a model.
            // But simpler: just try to start the service.

            // This is platform dependent and might fail if ollama is not in PATH of the server process.
            try {
                // We don't await this because it blocks. We just fire and forget, 
                // but we need a way to know if it worked. 
                // Actually, `ollama serve` blocks.
                const child = exec('ollama serve', { windowsHide: true });
                child.unref(); // Allow parent to exit independently (though Next.js stays running)

                // Give it a second to start
                await new Promise(r => setTimeout(r, 2000));
                return NextResponse.json({ success: true, message: 'Spawn command issued' });
            } catch (e) {
                return NextResponse.json({ success: false, error: 'Failed to spawn ollama' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Unknown command' }, { status: 400 });

    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
