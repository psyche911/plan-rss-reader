import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic'; // Always run on server interaction

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
    }

    try {
        const parser = new Parser();
        const feed = await parser.parseURL(url);
        return NextResponse.json(feed);
    } catch (error) {
        console.error('Error fetching/parsing feed:', error);
        return NextResponse.json({ error: 'Failed to parse RSS feed' }, { status: 500 });
    }
}
