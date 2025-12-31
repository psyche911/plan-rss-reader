import { NextRequest, NextResponse } from 'next/server';
import { generateOllama } from '@/lib/ollama';

export async function POST(request: NextRequest) {
    try {
        const { title, content, model } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Truncate content to avoid token limits and speed up processing
        const textContext = (title + '\n' + (content || '')).substring(0, 500);

        const prompt = `Analyze the following text and extract 2-3 specific, relevant tags (e.g., Technology, Finance, AI, React, Health). 
    Return ONLY a JSON array of strings, like ["Tag1", "Tag2"]. Do not add any other text.
    
    Text:
    ${textContext}
    `;

        const aiResponse = await generateOllama(prompt, model);

        // Parse JSON from LLM response (handle potential markdown ticks)
        let cleanedOptions = aiResponse.trim();
        if (cleanedOptions.startsWith('```json')) {
            cleanedOptions = cleanedOptions.replace(/^```json/, '').replace(/```$/, '');
        } else if (cleanedOptions.startsWith('```')) {
            cleanedOptions = cleanedOptions.replace(/^```/, '').replace(/```$/, '');
        }

        let tags: string[] = [];
        try {
            tags = JSON.parse(cleanedOptions);
        } catch (e) {
            console.warn('Failed to parse AI tags JSON, falling back to simple split', cleanedOptions);
            // Fallback: split by comma if parsing fails
            tags = cleanedOptions.split(',').map(t => t.trim().replace(/[\[\]"]/g, ''));
        }

        // Normalize tags
        tags = tags.map(t => t.trim()).filter(t => t.length > 0 && t.length < 20).slice(0, 3);

        return NextResponse.json({ tags });

    } catch (error: any) {
        console.error('AI Tagging Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate tags' }, { status: 500 });
    }
}
