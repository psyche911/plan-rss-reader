import { NextRequest, NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(request: NextRequest) {
    try {
        const { phrases, model } = await request.json();

        if (!phrases || !Array.isArray(phrases)) {
            return NextResponse.json({ error: 'phrases array is required' }, { status: 400 });
        }

        // Limit to top 20 items to prevent context overflow for now
        const limitedPhrases = phrases.slice(0, 20);
        const textInput = limitedPhrases.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n');

        const prompt = `You are a helpful news assistant. Below is a list of recent headlines and summaries. 
    Create a concise "Daily Briefing" report in Markdown format. 
    Group related stories together. Highlight key trends.
    
    Headlines:
    ${textInput}
    `;

        const summary = await generateOllama(prompt, model);
        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error('AI Summary Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 });
    }
}
