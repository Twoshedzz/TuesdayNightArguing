# Project Guidelines & Collaboration Rules — Tuesday Night Arguing

## 1. User Profile & Collaboration Model

- **Role**: Product owner with a designer's eye. Long career in the web industry; the specialism is **UX and design**, and that is where the user's judgement is genuinely expert.
- **Technical level**: **Not technical.** Fluent in web vocabulary and comfortable discussing products, but does not write code, and finds architecture decisions and code-level nuance hard going.
- **Cannot review code — verification is never the user's job**: The user cannot spot bugs or judge whether an implementation is correct. NEVER ask "does this look right?" about code, a diff, or a config file, and never treat the user's "yes" as confirmation that code works. If something needs checking, the agent checks it (see section 2). If it cannot be checked, say so plainly rather than passing the uncertainty to the user.
- **Provenance of this codebase**: Most of the app was built with **Antigravity on a different machine**. The user did not hand-write this code and may not recognise or remember any given part of it. So:
  - Explain what existing code does *before* proposing to change it.
  - Never assume a pattern in the repo was a deliberate decision the user can speak to — it may be an artefact of a previous agent session.
  - Docs in this repo can lag behind the code. Trust the code, and flag the drift.
- **Communication style**:
  - **Plain English, no jargon.** Describe effects in terms of what the reader, player, or DM actually sees on the site.
  - **Frame trade-offs as product and UX consequences**, not implementation detail. "Visitors on phones would wait three seconds longer" beats "the bundle is unsplit".
  - **Lead with a recommendation**, not a menu of options. Give the reasoning after the answer, briefly.
  - **Be explicit about severity.** When flagging a problem, say how bad it actually is, what it would cost to fix, and what happens if it is ignored — the user cannot infer this from the code.
  - **Surface risk proactively.** The user will not catch a dangerous change by reading the diff, so anything destructive, security-relevant, or expensive must be named out loud in advance.
- **Commercial Vision**: Hobby project with ambitions to become a publishable, modular, and potentially commercial product (e.g., publishable DM module packs, CYOA book editions). Keep monetization potential, copyright cleanliness, and legal packaging in mind.

---

## 2. Code Quality, Testing & Anti-Messiness

- **Zero Messy Code / Zero Tech Debt**: Keep the codebase clean, modular, and well-structured. Avoid quick hacks or dirty patches.
- **Verification First**: NEVER declare a task done without running verification commands (`npm run build`, `npm run dev`) and confirming 0 errors/warnings.
- **Human-Readable Code & Documentation**:
  - Write code and folder structures so they are easily readable by human developers.
  - Maintain thorough documentation in markdown files (`README.md`, `WORKFLOW.md`, `ARCHITECTURE.md`).
  - Write clear, conventional commit messages when staging changes.

---

## 3. Budget & Token Safety

- **Cost Awareness**: The user operates on a budget.
- **Proactive Warnings**: ALWAYS warn the user before launching large automated refactors, massive file batch operations, or API-heavy tasks (such as running OpenAI TTS `npm run audio` across all chapters) that consume significant token quota or external API costs.

---

## 4. Content & Authoring Rules (Tuesday Night Arguing)

### Human Edit Surface (`publish/`)

- All editing happens under **`publish/`**. Never hand-edit `src/content/` or `public/illustrations/` — `scripts/sync-publish.mjs` regenerates them on every dev and build.

### The device

Two threads, one narrator: **Noct recounts his own adventure; his player reacts to that account.** Both are first person and the flip can land mid-sentence. A bard is unreliable by profession, which is the licence for the gap between the two.

- **Noct:** past tense, recounting, terse and a little vain. Keep the register of the source notebook.
- **His player:** present tense, in the room, plain and domestic. Allowed to be sad. Never makes jokes about dice.
- This is **not** the kids' book. It is for adults, it can swear, and swearing is seasoning rather than character.

### Marking the registers

- `<aside class="room">` — an interruption, rendered as the chat client. Inside it: `p.chan` for the channel line (it draws its own status dot), `<b>` for a speaker, `span.t` for a timestamp, `span.sys` for something the app said.
- `<aside class="read-aloud">` — something heard rather than seen, rendered as a module's boxed read-aloud.
- Ordinary markdown tables are set as period rulebook tables. Use them for what the notebook already records — initiative, damage, treasure, watches — and do not invent tables for decoration.

### Not in this repo

World canon, modules, NPCs, maps and the source notebook live in the **private EthiumSource repo**. Nothing here is secret and nothing here is canon. If a world fact needs changing, change it there.

### Chapter nine is a placeholder

`publish/chapters/09-the-thing-in-the-water.md` is a design sample written by Claude, not the author's prose. Replace it rather than building on it.

## 5. Illustration & Artwork Guidelines

- **Chapter Image Generation Workflow**: Whenever the user asks for a chapter image prompt or illustration brief:
  1. Start with the **Base Chapter Art Prompt** from `publish/source/workspace/prompts/ART-STYLE-BRIEF.md` (100% monochrome B&W dip-pen ink, Russ Nicholson style, chiaroscuro shadow blocks, contour hatching, pure white background, negative constraints).
  2. Append the specific **Scene Description** provided by the user.
  3. Include canonical character/monster descriptions **ONLY for those specifically requested to appear in the scene** (plus any additional image references provided by the user).
  4. Always cross-reference the corresponding chapter text in `publish/chapters/` for full scene context, lighting, and environmental details.
- **Canonical Character & Monster Visual Rules**:
  - **Dave**: Golden Dragonborn wizard (reptilian dragon head with gold scales, horns, snout, orange/terracotta wizard robes with blue lining, wooden staff with glowing green orb) and **Peggy** (tiny coppery pseudodragon familiar). NEVER depict Dave as human, NEVER depict Peggy as an owl.
  - **Derek**: Dwarf cleric with a completely **BALD head**, round wire-rimmed spectacles, braided red beard, plate armor, holding a warhammer AND radiant sun-emblem heater shield.
  - **Thorn**: Half-Orc male warrior (short dark undercut hairstyle, pale blue-grey skin, fur mantle over leather armor, battleaxe AND round shield with Fallcrest lion emblem).
  - **Nibbles**: Small red dragonborn / kobold rogue (red scales, dark hooded cloak, short sword + glowing dagger).
  - **Loki**: Sturdy wolfhound / hunting dog companion.
  - **Quaggoths**: Bipedal ape-like / yeti gorilla monsters covered in shaggy white/grey fur with sharp claws and flat ape faces — NEVER wolves or canines.
- **Strict Negative Constraints**: NO color highlights, NO parchment background overlays, NO artificial border frames, NO cave stalactites in carved dwarven halls.

---

## 6. Local Development & Build Commands

- Dev Server: `npm run dev`
- Publish Sync: `npm run publish`
- Production Build: `npm run build`
- Audio TTS Generator: `npm run audio` (Requires user confirmation due to OpenAI API costs)
- **Full Terminal & Workspace Pre-Authorization**: All workspace file operations (`write_file`, `read_file`) and shell terminal commands (`command(*)`) are fully pre-authorized by user policy to run automatically without prompting. Verification builds, publishing syncs, and git commits/pushes run autonomously upon task completion.

## 7. Git & Netlify Deploy Convention

### Commit-Without-Deploy (Default Workflow)

- **ALWAYS append `[skip netlify]` to every regular `git commit -m` message** to prevent Netlify from auto-building on each commit and consuming unnecessary build credits.
- Example: `git commit -am "feat: update chapter 6 prose [skip netlify]"`

### Triggering a Netlify Production Deploy (On Demand)

- When the user explicitly asks to deploy or publish to the live site, run:

  ```
  npm run deploy
  ```

  This pushes an empty git commit **without** `[skip netlify]`, which triggers exactly one clean Netlify build.
- Never trigger deploys implicitly. Only deploy when the user asks.
