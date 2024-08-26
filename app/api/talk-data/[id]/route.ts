//File: app/api/talk-data/[id]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'ted', 'talk-info', `${id}.json`);
    const transcriptFilePath = path.join(process.cwd(), 'public', 'ted', 'transcript', `${id}.txt`);

    const [metaContent, transcriptContent] = await Promise.all([
      fs.readFile(metaFilePath, 'utf-8'),
      fs.readFile(transcriptFilePath, 'utf-8')
    ]);

    const metaData = JSON.parse(metaContent);
    const talkData = {
      ...metaData,
      transcript: transcriptContent
    };

    return NextResponse.json(talkData);
  } catch (error) {
    console.error(`Error reading talk data for id ${id}:`, error);
    return NextResponse.json({ error: 'Failed to load talk data' }, { status: 500 });
  }
}