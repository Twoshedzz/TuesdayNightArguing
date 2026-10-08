import { defineCollection, z } from 'astro:content';

/**
 * A chapter is an ordered list of blocks, not one lump of prose.
 *
 * The book alternates between Noct's telling and the room the players were
 * actually sitting in, and an interruption has to be droppable anywhere — "it
 * would be funny to have one here" is the whole point. So the chapter is a list
 * the writer can add to, remove from and reorder, rather than a body of text with
 * markup buried in it.
 *
 * Rendered by src/components/ChapterBlocks.astro.
 */

/**
 * Every content field defaults to empty. "Split here" inserts a blank block on
 * purpose, and a half-written chapter has to be saveable — the editor is for a
 * writer mid-draft, not for finished copy only.
 */

const telling = z.object({
  type: z.literal('telling'),
  text: z.string().default(''),
});

const interruption = z.object({
  type: z.literal('interruption'),
  channel: z.string().optional(),
  lines: z.string().default(''),
});

const aloud = z.object({
  type: z.literal('aloud'),
  text: z.string().default(''),
});

const table = z.object({
  type: z.literal('table'),
  caption: z.string().optional(),
  markdown: z.string().default(''),
});

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /**
     * Which book this chapter is in. The campaign is a series: book one is the
     * 21 chapters from the notebook, book two is the table sitting down again.
     * Without this, book two's chapter 1 collides with book one's.
     */
    book: z.number().default(1),
    chapter: z.number(),
    summary: z.string().optional(),
    coverIllustration: z.string().optional(),
    published: z.boolean().default(true),
    // NOT `body`. Decap reserves that key: it pulls data.body out as the file's
    // markdown body and hands it to the frontmatter serialiser, which throws on a
    // list. Renaming it is what made saving from /admin work at all.
    blocks: z.array(z.discriminatedUnion('type', [telling, interruption, aloud, table])).default([]),
  }),
});

export const collections = { chapters };
