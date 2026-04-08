import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  path: string;
  url: string;
  size: number;
  lastModified: string;
}

let cachedSongs: Song[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000;

function parseFilename(filename: string): { title: string; artist: string } {
  const cleaned = filename.trim();

  if (!cleaned || cleaned.length < 2) {
    return { title: cleaned || 'Unknown', artist: 'Unknown Artist' };
  }

  const withoutTrackNum = cleaned.replace(/^\d{1,3}[\s.\-_]*/, '').trim();
  const parts = withoutTrackNum.split(/\s*-\s*/);

  if (parts.length === 1) {
    return {
      title: formatTitle(parts[0]),
      artist: 'Unknown Artist',
    };
  }

  if (parts.length === 2) {
    const [artist, title] = parts;
    const cleanArtist = artist.trim();
    const cleanTitle = title.trim();

    if (/^\d+$/.test(cleanArtist)) {
      return {
        title: formatTitle(cleanTitle),
        artist: 'Unknown Artist',
      };
    }

    if (!cleanArtist || cleanArtist === '-' || cleanArtist.length < 2) {
      return {
        title: formatTitle(cleanTitle),
        artist: 'Unknown Artist',
      };
    }

    return {
      title: formatTitle(cleanTitle),
      artist: formatArtist(cleanArtist),
    };
  }

  if (parts.length >= 3) {
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();

    if (/^\d+$/.test(artist)) {
      return {
        title: formatTitle(parts.slice(1).join(' - ')),
        artist: 'Unknown Artist',
      };
    }

    return {
      title: formatTitle(title),
      artist: formatArtist(artist),
    };
  }

  return {
    title: formatTitle(cleaned),
    artist: 'Unknown Artist',
  };
}

function formatTitle(title: string): string {
  return title
    .replace(/\.(mp3|wav|flac|m4a|ogg)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatArtist(artist: string): string {
  return artist.replace(/\s+/g, ' ').trim();
}

async function fetchAllSongsFromR2(
  bucket: string,
  publicUrl: string
): Promise<Song[]> {
  const now = Date.now();

  if (cachedSongs && now - cacheTimestamp < CACHE_DURATION) {
    return cachedSongs;
  }

  let allSongs: Song[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    const mp3s = (response.Contents || [])
      .filter(
        (obj) =>
          obj.Key?.endsWith('.mp3') &&
          !obj.Key?.toLowerCase().includes('mixdown')
      )
      .map((obj) => {
        const key = obj.Key!;
        const filename = key.split('/').pop()!.replace('.mp3', '');
        const { title, artist } = parseFilename(filename);

        return {
          id: key,
          title,
          artist,
          album: 'Unknown Album',
          path: key,
          url: `${publicUrl}/${encodeURIComponent(key)}`,
          size: obj.Size || 0,
          lastModified:
            obj.LastModified?.toISOString() || new Date().toISOString(),
        };
      });

    allSongs = allSongs.concat(mp3s);
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  allSongs.sort((a, b) => {
    const artistCompare = a.artist.localeCompare(b.artist);
    if (artistCompare !== 0) return artistCompare;
    return a.title.localeCompare(b.title);
  });

  cachedSongs = allSongs;
  cacheTimestamp = now;

  return allSongs;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
  const search = (searchParams.get('search') || '').toLowerCase().trim();

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    'https://pub-ce53c504acc542c7a0155e598af3bf57.r2.dev';

  if (!bucket) {
    return NextResponse.json(
      { error: 'R2 bucket not configured' },
      { status: 500 }
    );
  }

  try {
    const allSongs = await fetchAllSongsFromR2(bucket, publicUrl);

    let filteredSongs = allSongs;

    if (search) {
      filteredSongs = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(search) ||
          song.artist.toLowerCase().includes(search)
      );
    }

    const total = filteredSongs.length;
    const startIndex = (page - 1) * limit;
    const paginatedSongs = filteredSongs.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        songs: paginatedSongs,
        total,
        page,
        limit,
        hasMore: startIndex + limit < total,
        cached:
          cachedSongs !== null && Date.now() - cacheTimestamp < CACHE_DURATION,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs', songs: [], total: 0 },
      { status: 500 }
    );
  }
}
