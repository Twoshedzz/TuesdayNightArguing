# Style guide — Tuesday Night Arguing

## The device

Two threads, one narrator. **Noct recounts his own grand adventure; his player reacts to
that account.** The first person flips with everything else, and it can flip mid-sentence.

A bard is unreliable by profession, which is the licence for the whole book: Noct is
allowed to be braver, funnier and more decisive than he was. The gap between his telling
and his player's memory is where both the comedy and the discomfort live.

## Voice

**Noct's telling.** First person, past tense, written as though recounting it later to
people who were not there. Terse, tallying, a little vain, and prone to asking that
things be written down. Keep the register of the source notebook — it already sounds
like this. Short declaratives. Dry about his own failures, and never quite as dry as he
thinks.

**The player.** First person, present tense, in the room. Plain, specific, domestic. No
jokes about dice. The comedy comes from the collision, not from being funny about D&D.
This voice is allowed to be sad; it should be, occasionally, without announcing it.

**Not this book:** *The Ruins of Ethium* is third person, warm, and for twelve-year-olds.
This one is for adults and can swear, but swearing is seasoning rather than character.

## A chapter is a list of blocks

Not one lump of prose with markup buried in it. A chapter is an ordered list, and
an interruption can be dropped anywhere — "it would be funny to have one here" is
the point of the structure.

Four kinds of block:

| Block | What it is |
|---|---|
| **Noct's telling** | His voice, afterwards. Ordinary prose. |
| **Interruption — the room** | The real evening, as the client it arrived in. |
| **Read-aloud — heard, not seen** | A voice, a vision, something read off a wall. Boxed. |
| **Table** | A period rulebook table, with a caption markdown cannot carry. |

Add, remove and reorder them in the editor at `/admin`, or by hand in the file.

### Inside an interruption

One line each:

| You write | You get |
|---|---|
| `**Torgan** 21:47 single.` | a speaker, their timestamp, and what they said |
| `**Merlin** that's a kitchen.` | the same, with no timestamp |
| `*moved Noct to Room 4*` | something the app said rather than a person |
| anything else | a plain line |

System lines written straight after a speaker belong to them — several notices under
one name, which is how the app actually reads. The channel line is optional and draws
its own green dot; do not add one.

## Look

The telling is set as a 1979 *Dungeon Masters Guide* page: warm stock, brown-black ink,
cover orange for chapter marks and drop caps, a rule under every chapter head.

One column, always. The original books use two; that is the one thing from the reference
we refuse, because two columns force either a tiny measure on a phone or a scroll up and
back down on a laptop.

The real books were set in ITC Souvenir, which cannot be served from Google Fonts. The
site uses Petrona, which has the same warmth and ball terminals. If this ever goes to
print, buying Souvenir is the single change that would make it unmistakable.

## Illustrations

- Pen and ink only. No colour, no grey wash. Heavy cross-hatching for shadow; white
  paper doing the work everywhere else.
- Composition favours scale over action: one small figure, one very large problem, a lot
  of empty floor.
- Plates are boxed, captioned in small caps, and numbered as plates.
- **Nothing is illustrated for the real-world thread.** It has interface instead, and the
  absence is part of the contrast.
- Distinct from the Ruins of Ethium plates, which are Russ Nicholson Fighting Fantasy.
  Same era, different shelf.

## Where the material comes from

The source is Noct's player's notebook, 138 pages, held in the private **EthiumSource**
repo at `publish/plotlines/tna/sessions/noct-notebook.md`, with the beat sheet beside it.
World canon — places, modules, NPCs, maps — lives in that repo too and is shared with the
other telling. Nothing in this repo is secret; nothing in this repo is canon.

## Two things to settle before publishing

- **Credit and rights** with the player whose notebook this is.
- **Consent** from the friends who appear as themselves, including whoever's wife walks
  into chapter nine.
