/**
 * The editor's preview, the split-a-block button, and the rules they share with
 * the site.
 *
 * A chapter is a list of blocks — Noct's telling, an interruption from the room,
 * a read-aloud, a table — which the writer adds, removes and reorders. The site
 * renders them in src/components/ChapterBlocks.astro. This file renders the same
 * blocks in the preview pane, so what he sees while writing is what readers get.
 *
 * The line grammar inside an interruption is duplicated from that component on
 * purpose: the preview runs in the browser with no build step. If you change one,
 * change the other. The same goes for SPLIT_MARKER, which both sides strip.
 */

/* global CMS */

/* ───────────────────────────────────────────────────────────────────────────────
 * Plainer words for the buttons.
 *
 * Decap calls saving "Publish", while the chapter also has a field deciding
 * whether readers can see it. Two meanings of the same word, on one screen, for
 * someone who has never used a CMS — and it stopped the first person who tried.
 *
 * registerLocale deep-merges over English, so overriding a handful of keys is
 * safe: anything not named here keeps Decap's own wording. config.yml sets
 * `locale: en-plain` to select it.
 * ──────────────────────────────────────────────────────────────────────────── */
CMS.registerLocale('en-plain', {
  editor: {
    editorToolbar: {
      publish: 'Save',
      publishing: 'Saving…',
      published: 'Saved',
      publishNow: 'Save now',
      publishAndCreateNew: 'Save, and start a new chapter',
      publishAndDuplicate: 'Save, and make a copy',
      deleteEntry: 'Delete this chapter',
    },
    editorWidgets: {
      list: {
        add: 'Add %{item}',
        addType: 'Add %{item}',
      },
    },
  },
});

// The site's own stylesheet, copied here by scripts/sync-publish.mjs on every build.
CMS.registerPreviewStyle('/admin/preview.css');
CMS.registerPreviewStyle(
  `body { background: #f1ebdc; color: #2a1d10; padding: 1.5rem 1.25rem; }
   .chapter-body { max-width: 34rem; margin: 0 auto; }`,
  { raw: true },
);

/* ───────────────────────────────────────────────────────────────────────────────
 * Split here — breaking one block into two, with a new block in the gap.
 *
 * Decap's list widget can only add a block at the end of the chapter; it has no
 * insert-at-position. So interrupting a paragraph you have already written would
 * otherwise mean cutting the second half out by hand, adding a block at the
 * bottom and dragging it up.
 *
 * Instead the toolbar button drops a marker where the cursor is, and the preSave
 * listener below does the surgery on the way to the commit: the block is split at
 * the marker and an empty block of the chosen kind is inserted between the halves.
 * The marker never reaches the repository, and never reaches a reader.
 *
 * It costs one save. He clicks Split here, saves, and the chapter comes back as
 * three blocks with the new one waiting in the right place.
 * ──────────────────────────────────────────────────────────────────────────── */

/** On its own line. Matched once for the split, globally for belt-and-braces stripping. */
const SPLIT_MARKER = /^[ \t]*\{\{<\s*split\s+([a-z]+)\s*>\}\}[ \t]*$/m;
const SPLIT_MARKER_ALL = /^[ \t]*\{\{<\s*split\s+[a-z]+\s*>\}\}[ \t]*$/gm;

const SPLIT_CHOICES = [
  { label: 'An interruption — the room', value: 'interruption' },
  { label: 'A read-aloud — heard, not seen', value: 'aloud' },
  { label: 'A table', value: 'table' },
  { label: 'More of your telling', value: 'telling' },
  { label: 'Nothing — just break the prose here', value: 'none' },
];

const SPLIT_LABELS = SPLIT_CHOICES.reduce((acc, c) => Object.assign(acc, { [c.value]: c.label }), {});

/**
 * Decap's save control is a react-aria menu button in the toolbar: a
 * span[role=button] reading Save/Saved, which opens a menu holding "Save now".
 * Clicking it from script is how the card's own button saves, so the writer
 * never has to go looking for the toolbar.
 *
 * Everything here is defensive. If Decap's toolbar ever changes shape the
 * button simply reports that it could not save, and the toolbar still works.
 */
function triggerSave() {
  const toolbarButton = Array.from(document.querySelectorAll('span[role="button"]')).find(
    (el) => /^Save/i.test(el.textContent.trim()),
  );
  if (!toolbarButton) return Promise.resolve(false);

  toolbarButton.click();

  return new Promise((resolve) => {
    setTimeout(() => {
      const item = Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] *')).find(
        (el) => el.children.length === 0 && /^Save now$/i.test(el.textContent.trim()),
      );
      if (item) {
        item.click();
        resolve(true);
      } else {
        // Nothing to save, or the menu did not open — close it again and say so.
        toolbarButton.click();
        resolve(false);
      }
    }, 250);
  });
}

/**
 * The button inside the Split here card. Decap has no way for a field to change
 * the blocks around it, so the split itself still happens in preSave — this
 * saves for you, and the postSave listener below brings the page back with the
 * new block in place.
 */
const h = window.h;
const createClass = window.createClass;

if (h && createClass) {
  const SplitActionControl = createClass({
    getInitialState() {
      return { state: 'idle' };
    },

    handleClick(event) {
      event.preventDefault();
      if (this.state.state === 'working') return;
      this.setState({ state: 'working' });

      triggerSave().then((ok) => {
        if (!ok) {
          this.setState({ state: 'failed' });
          return;
        }
        // A successful save reloads the page from postSave. If we are still here a
        // few seconds later the save was refused — Decap says why in its own banner,
        // so just give the button back rather than sitting on "Splitting…".
        this.timer = setTimeout(() => this.setState({ state: 'idle' }), 4000);
      });
    },

    componentWillUnmount() {
      if (this.timer) clearTimeout(this.timer);
    },

    /**
     * Decap prints "(optional)" above every field that is not required, which on a
     * button reads as though pressing it were a matter of taste. Hide that one bar.
     */
    componentDidMount() {
      const bar = this.wrapper && this.wrapper.previousElementSibling;
      if (bar && /ControlTopbar/.test(String(bar.className || ''))) bar.style.display = 'none';
    },

    render() {
      const working = this.state.state === 'working';
      return h(
        'div',
        {
          className: this.props.classNameWrapper,
          ref: (el) => {
            this.wrapper = el;
          },
          style: { padding: '0.5rem 0 0' },
        },
        h(
          'button',
          {
            type: 'button',
            onClick: this.handleClick,
            disabled: working,
            style: {
              appearance: 'none',
              border: 0,
              borderRadius: '4px',
              padding: '0.6rem 1rem',
              background: working ? '#8c8f94' : '#b4551f',
              color: '#fff',
              font: '600 0.85rem/1 inherit',
              cursor: working ? 'default' : 'pointer',
            },
          },
          working ? 'Splitting…' : 'Split the block here',
        ),
        this.state.state === 'failed'
          ? h(
              'p',
              { style: { margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#8c3b12' } },
              'Nothing to save yet — make a change first, or use Save at the top of the page.',
            )
          : null,
      );
    },
  });

  CMS.registerWidget(
    'split-action',
    SplitActionControl,
    () => null,
  );
}

CMS.registerEditorComponent({
  id: 'split',
  label: 'Split here — start a new block',
  fields: [
    {
      name: 'insert',
      label: 'What goes in the gap?',
      widget: 'select',
      default: 'interruption',
      options: SPLIT_CHOICES,
      hint: 'Then press the button. The block below splits in two and the new one lands here.',
    },
    {
      name: 'go',
      label: ' ',
      widget: 'split-action',
      required: false,
    },
  ],
  pattern: SPLIT_MARKER,
  fromBlock: (match) => ({ insert: match[1] }),
  toBlock: (data) => `{{< split ${data.insert || 'interruption'} >}}`,
  toPreview: (data) =>
    '<p style="margin:1.4rem 0;font-family:IBM Plex Sans,system-ui,sans-serif;' +
    'font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:#b4551f;' +
    'border-top:1px solid #b4551f;border-bottom:1px solid #b4551f;padding:0.4rem 0;' +
    'text-align:center">Split here → ' +
    (SPLIT_LABELS[data.insert] || data.insert || 'a new block') +
    '</p>',
});

/** An empty block of `type`, built from an existing one so no Immutable import is needed. */
function emptyBlockLike(template, type) {
  const base = template.clear().set('type', type);
  if (type === 'interruption') return base.set('channel', '').set('lines', '');
  if (type === 'table') return base.set('caption', '').set('markdown', '');
  return base.set('text', ''); // telling, aloud
}

/**
 * Walk the blocks, splitting each one that carries a marker. Returns the same
 * list object when there is nothing to do, so an ordinary save is untouched.
 *
 * An empty half is dropped: splitting at the very start or the very end inserts
 * the new block without leaving a blank paragraph behind.
 */
function applySplits(body) {
  if (!body || typeof body.size !== 'number') return body;

  let out = body;
  let i = 0;

  for (let guard = 0; i < out.size && guard < 500; guard += 1) {
    const block = out.get(i);
    const text = block && typeof block.get === 'function' ? block.get('text') : null;

    if (typeof text !== 'string') { i += 1; continue; }

    const found = text.match(SPLIT_MARKER);
    if (!found) { i += 1; continue; }

    const before = text.slice(0, found.index).replace(/\s+$/, '');
    const after = text.slice(found.index + found[0].length).replace(/^\s+/, '');
    const insert = found[1] === 'none' ? null : found[1];

    const pieces = [];
    if (before) pieces.push(block.set('text', before));
    if (insert) pieces.push(emptyBlockLike(block, insert));
    if (after || !pieces.length) pieces.push(block.set('text', after));

    out = out.splice(i, 1, ...pieces);

    // Land on the last piece and look at it again — the tail can hold another marker.
    i += Math.max(pieces.length - 1, 0);
  }

  return out;
}

CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    const data = entry.get('data');
    if (!data || typeof data.get !== 'function') return data;

    const blocks = data.get('blocks');
    const split = applySplits(blocks);
    if (split === blocks) return data;

    splitPending = true;
    return data.set('blocks', split);
  },
});

/**
 * A save keeps the editor's in-memory copy on screen, so a chapter that has just
 * been split still shows one block until the page is reloaded. That made the
 * feature look broken to the first person who used it — the work had happened and
 * there was nothing to see. So when a split was applied, come back to the saved
 * version, where the new block is sitting in its gap.
 */
let splitPending = false;

CMS.registerEventListener({
  name: 'postSave',
  handler: () => {
    if (!splitPending) return;
    splitPending = false;
    setTimeout(() => window.location.reload(), 600);
  },
});

const escapeHtml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (text = '') =>
  escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

/** Same grammar as ChapterBlocks.astro. */
function renderLines(text = '') {
  const out = [];
  let lastWasSpeaker = false;

  for (const line of String(text).split('\n').map((l) => l.trim()).filter(Boolean)) {
    const system = line.match(/^\*([^*].*)\*$/);
    if (system) {
      const said = `<span class="sys">${inline(system[1])}</span>`;
      if (lastWasSpeaker) {
        out[out.length - 1] = out[out.length - 1].replace(/<\/p>$/, `<br>${said}</p>`);
      } else {
        out.push(`<p>${said}</p>`);
      }
      continue;
    }

    const speaker = line.match(/^\*\*([^*]+)\*\*\s*(?:(\d{1,2}:\d{2})\s*)?(.*)$/);
    if (speaker) {
      const [, name, time, said] = speaker;
      out.push(
        `<p><b>${inline(name)}</b>${time ? ` <span class="t">${time}</span>` : ''}` +
          (said.trim() ? `<br>${inline(said)}` : '') +
          `</p>`,
      );
      lastWasSpeaker = true;
      continue;
    }

    out.push(`<p>${inline(line)}</p>`);
    lastWasSpeaker = false;
  }
  return out.join('');
}

/**
 * Paragraphs plus emphasis — enough for a preview, not a markdown engine.
 *
 * A single newline is a wrap, not a break: the site runs marked with
 * `breaks: false`, so hand-wrapped prose flows into one paragraph. The preview
 * has to do the same or it shows breaks the reader will never see.
 */
const paragraphs = (text = '') =>
  String(text)
    .replace(SPLIT_MARKER_ALL, '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inline(p).replace(/\s*\n\s*/g, ' ')}</p>`)
    .join('');

function blockHtml(block) {
  const type = block.get ? block.get('type') : block.type;
  const get = (k) => (block.get ? block.get(k) : block[k]) || '';

  if (type === 'telling') return paragraphs(get('text'));

  if (type === 'interruption') {
    const channel = get('channel');
    return (
      '<aside class="room">' +
      (channel ? `<p class="chan">${escapeHtml(channel)}</p>` : '') +
      renderLines(get('lines')) +
      '</aside>'
    );
  }

  if (type === 'aloud') return `<aside class="read-aloud">${paragraphs(get('text'))}</aside>`;

  if (type === 'table') {
    const caption = get('caption');
    const rows = String(get('markdown'))
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.startsWith('|'));
    const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim());
    const isRule = (r) => /^\|[\s:|-]+\|$/.test(r);
    const head = rows[0] ? `<thead><tr>${cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>` : '';
    const bodyRows = rows.slice(1).filter((r) => !isRule(r));
    const bodyHtml = bodyRows.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
    return (
      '<div class="rulebook-table">' +
      (caption ? `<p class="rulebook-table__caption">${escapeHtml(caption)}</p>` : '') +
      `<table>${head}<tbody>${bodyHtml}</tbody></table></div>`
    );
  }

  return '';
}

if (h)
  CMS.registerPreviewTemplate('chapters', ({ entry }) => {
    const data = entry.get('data');
    const number = data.get('chapter');
    const blocks = data.get('blocks');
    const list = blocks && blocks.toArray ? blocks.toArray() : blocks || [];

    return h(
      'article',
      { className: 'container' },
      h(
        'header',
        { className: 'chapter-header' },
        data.get('published')
          ? null
          : h(
              'p',
              {
                style: {
                  fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#b4551f',
                  margin: '0 0 0.6rem',
                },
              },
              'Draft — not on the site yet',
            ),
        h(
          'p',
          { className: 'chapter-header__number' },
          Number(number) === 0 ? 'Prologue' : `Chapter ${number ?? ''}`,
        ),
        h('h1', { className: 'chapter-header__title' }, data.get('title') || 'Untitled'),
        data.get('summary')
          ? h('p', { className: 'chapter-header__summary' }, data.get('summary'))
          : null,
      ),
      h('div', {
        className: 'chapter-body',
        dangerouslySetInnerHTML: { __html: list.map(blockHtml).join('\n') },
      }),
    );
  });
