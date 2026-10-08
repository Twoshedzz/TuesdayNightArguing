/**
 * The editor's preview, and the one rule it shares with the site.
 *
 * A chapter is a list of blocks — Noct's telling, an interruption from the room,
 * a read-aloud, a table — which the writer adds, removes and reorders. The site
 * renders them in src/components/ChapterBlocks.astro. This file renders the same
 * blocks in the preview pane, so what he sees while writing is what readers get.
 *
 * The line grammar inside an interruption is duplicated from that component on
 * purpose: the preview runs in the browser with no build step. If you change one,
 * change the other.
 */

/* global CMS */

// The site's own stylesheet, copied here by scripts/sync-publish.mjs on every build.
CMS.registerPreviewStyle('/admin/preview.css');
CMS.registerPreviewStyle(
  `body { background: #f1ebdc; color: #2a1d10; padding: 1.5rem 1.25rem; }
   .chapter-body { max-width: 34rem; margin: 0 auto; }`,
  { raw: true },
);

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

/** Paragraphs plus emphasis — enough for a preview, not a markdown engine. */
const paragraphs = (text = '') =>
  String(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inline(p).replace(/\n/g, '<br>')}</p>`)
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

const h = window.h || (window.React && window.React.createElement);

if (h)
  CMS.registerPreviewTemplate('chapters', ({ entry }) => {
    const data = entry.get('data');
    const number = data.get('chapter');
    const blocks = data.get('body');
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
