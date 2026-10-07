import { getCollection, type CollectionEntry } from 'astro:content';

export type Chapter = CollectionEntry<'chapters'>;

export async function getPublishedChapters(): Promise<Chapter[]> {
  const chapters = await getCollection('chapters', ({ id, data }) => {
    return data.published && !id.startsWith('_');
  });

  return chapters.sort((a, b) => a.data.chapter - b.data.chapter);
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
