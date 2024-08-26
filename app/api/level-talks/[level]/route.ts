// File: app/api/level-talks/[level]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TALKS_PER_LEVEL = 170;
const TALKS_PER_PAGE = 10;

let talkInfoCache: Record<string, any> | null = null;
let talkRankCache: Record<string, any> | null = null;

async function getTalkInfo() {
  if (talkInfoCache) return talkInfoCache;

  const filePath = path.join(process.cwd(), 'public', 'ted', 'json', 'talk-info.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  talkInfoCache = JSON.parse(fileContent);
  return talkInfoCache;
}

async function getTalkRankData() {
  if (talkRankCache) return talkRankCache;

  const filePath = path.join(process.cwd(), 'public', 'ted', 'json', 'talk-rank.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  talkRankCache = JSON.parse(fileContent);
  return talkRankCache;
}

export async function GET(
  request: Request,
  { params }: { params: { level: string } }
) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const level = Number(params.level) || 1;

  console.log(`Received request for level: ${level}, page: ${page}`);

  const startTalkId = (level - 1) * TALKS_PER_LEVEL + 1;
  const endTalkId = level * TALKS_PER_LEVEL;

  try {
    const [talkInfo, talkRankData] = await Promise.all([
      getTalkInfo(),
      getTalkRankData()
    ]);

    const levelTalks = Object.entries(talkInfo)
      .filter(([talkId, _]) => {
        const id = parseInt(talkId);
        return id >= startTalkId && id <= endTalkId;
      })
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const totalTalks = levelTalks.length;
    const totalPages = Math.ceil(totalTalks / TALKS_PER_PAGE);

    const paginatedTalks = levelTalks.slice(
      (page - 1) * TALKS_PER_PAGE,
      page * TALKS_PER_PAGE
    );

    const combinedData = paginatedTalks.reduce((acc, [talkId, talkInfo]) => {
      acc[talkId] = {
        ...talkInfo,
        rank: talkRankData[talkId] || null,
        image: `/ted/img/${(talkInfo as any).talk_url}.jpg`
      };
      return acc;
    }, {} as Record<string, any>);

    console.log(`Found ${Object.keys(combinedData).length} talks for level ${level}, page ${page}`);

    if (Object.keys(combinedData).length === 0) {
      console.log('No talks found for this level and page.');
      return NextResponse.json({ error: 'No talks found for this level and page' }, { status: 404 });
    }

    return NextResponse.json({
      talks: combinedData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalTalks: totalTalks
      }
    });
  } catch (error) {
    console.error(`Error reading level data for level ${level}:`, error);
    return NextResponse.json({ error: 'Failed to load level data' }, { status: 500 });
  }
}