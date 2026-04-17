import { getTopIndexedTracks, type IndexedTrack } from '@/lib/musicIndexer';

export interface IndexedArtist {
  id: string;
  name: string;
  image_url?: string;
  listeners?: number;
  topTrackTitle?: string;
}

const slugifyArtist = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function getFeaturedIndexedArtists(limit = 12): Promise<IndexedArtist[]> {
  const tracks = await getTopIndexedTracks(Math.max(limit * 4, 40));
  const byArtist = new Map<string, IndexedArtist & { _bestTrack?: IndexedTrack }>();

  tracks.forEach((track) => {
    const key = track.artist.trim().toLowerCase();
    if (!key) return;

    const existing = byArtist.get(key);
    const listeners = (existing?.listeners || 0) + (track.listeners || 0);
    const currentBestScore = (existing?._bestTrack?.listeners || 0) + (existing?._bestTrack?.rank ? 100000 - existing._bestTrack.rank : 0);
    const nextScore = (track.listeners || 0) + (track.rank ? 100000 - track.rank : 0);
    const bestTrack = !existing || nextScore > currentBestScore ? track : existing._bestTrack;

    byArtist.set(key, {
      id: slugifyArtist(track.artist),
      name: track.artist,
      image_url: (bestTrack || track).cover_url,
      listeners,
      topTrackTitle: (bestTrack || track).title,
      _bestTrack: bestTrack || track,
    });
  });

  return Array.from(byArtist.values())
    .sort((a, b) => (b.listeners || 0) - (a.listeners || 0))
    .slice(0, limit)
    .map(({ _bestTrack, ...artist }) => artist);
}