import { getCollection, type CollectionEntry } from 'astro:content';

export type Chapter = CollectionEntry<'chapters'>;

export async function getPublishedChapters(book?: number): Promise<Chapter[]> {
  const chapters = await getCollection('chapters', ({ id, data }) => {
    if (!data.published || id.startsWith('_')) return false;
    return book === undefined || data.book === book;
  });

  // Book first, then chapter: the series reads in order even in one flat list.
  return chapters.sort(
    (a, b) => a.data.book - b.data.book || a.data.chapter - b.data.chapter,
  );
}

export function getChapterNeighbors(
  chapters: Chapter[],
  current: Chapter,
): { prev?: Chapter; next?: Chapter } {
  const index = chapters.findIndex((entry) => entry.slug === current.slug);
  if (index === -1) return {};

  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}

export function formatChapterLabel(chapterNumber: number): string {
  return chapterNumber === 0 ? 'Prologue' : `Chapter ${chapterNumber}`;
}
