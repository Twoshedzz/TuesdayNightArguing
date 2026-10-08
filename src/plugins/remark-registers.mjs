/**
 * The two registers, as markdown anyone can type.
 *
 * This book alternates between Noct's telling and the room the players were
 * actually sitting in. Marking that used to mean hand-writing HTML:
 *
 *     <aside class="room">
 *     <p class="chan">general · voice connected · 5 of 5</p>
 *     <p><b>Torgan</b> <span class="t">21:47</span><br>single. always single.</p>
 *     </aside>
 *
 * Nobody should type that. Now it is written as a directive:
 *
 *     :::room{time="21:31" channel="general · voice connected · 5 of 5"}
 *     *moved Noct to Room 4*
 *
 *     **Torgan** 21:47 single. always single.
 *     :::
 *
 *     :::aloud
 *     Please. They're not listening. Come to the water.
 *     :::
 *
 * Inside a :::room block, one line each:
 *   **Name** text        a speaker and what they said
 *   **Name** 21:47 text  the same, with their own timestamp
 *   *text*               something the app said rather than a person
 *   anything else        a plain line
 *
 * The block's own `time` is used for the first speaker that has none.
 *
 * Output is exactly the HTML the stylesheet already expects, so the CSS is
 * untouched. See publish/source/style-guide.md.
 */

import { visit } from 'unist-util-visit';

const SPEAKER = /^\*\*([^*]+)\*\*\s*(?:(\d{1,2}:\d{2})\s*)?(.*)$/;
const SYSTEM = /^\*([^*].*)\*$/;

/**
 * Markdown has already parsed `**bold**` and `*italic*` into nodes by the time a
 * plugin runs, so read the tree back out as the source the author typed. Without
 * this, a speaker line arrives as an empty string and the line vanishes.
 */
function toSource(node) {
  if (node.type === 'text') return node.value;
  if (node.type === 'inlineCode') return `\`${node.value}\``;
  if (node.type === 'break') return '\n';
  if (node.type === 'strong') return `**${(node.children ?? []).map(toSource).join('')}**`;
  if (node.type === 'emphasis') return `*${(node.children ?? []).map(toSource).join('')}*`;
  if (node.type === 'link') {
    return `[${(node.children ?? []).map(toSource).join('')}](${node.url})`;
  }
  // A timestamp like 21:47 is parsed as text "21" plus a text directive ":47",
  // because the colon is the directive marker. Put it back together.
  if (node.type === 'textDirective' || node.type === 'leafDirective') {
    return `:${node.name}${(node.children ?? []).map(toSource).join('')}`;
  }
  return (node.children ?? []).map(toSource).join('');
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Emphasis inside a line, applied after escaping so authored HTML stays inert. */
function inline(text) {
  return escape(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

function roomHtml(node) {
  const { time = '', channel = '' } = node.attributes ?? {};
  const out = [];

  if (channel) out.push(`<p class="chan">${inline(channel)}</p>`);

  let timeUsed = false;
  let lastWasSpeaker = false;
  for (const child of node.children ?? []) {
    const source = (child.children ?? []).map(toSource).join('');
    for (const line of source.split('\n').map((l) => l.trim()).filter(Boolean)) {
      const system = line.match(SYSTEM);
      if (system) {
        const said = `<span class="sys">${inline(system[1])}</span>`;
        // System lines following a speaker belong to them — that is how the app
        // actually reads, several notices under one name and timestamp.
        if (lastWasSpeaker) {
          out[out.length - 1] = out[out.length - 1].replace(/<\/p>$/, `<br>${said}</p>`);
        } else {
          out.push(`<p>${said}</p>`);
        }
        continue;
      }

      const speaker = line.match(SPEAKER);
      if (speaker) {
        const [, name, ownTime, said] = speaker;
        let stamp = ownTime;
        if (!stamp && !timeUsed && time) {
          stamp = time;
          timeUsed = true;
        }
        const body = said.trim() ? `<br>${inline(said)}` : '';
        out.push(
          `<p><b>${inline(name)}</b>${stamp ? ` <span class="t">${stamp}</span>` : ''}${body}</p>`,
        );
        lastWasSpeaker = true;
        continue;
      }

      out.push(`<p>${inline(line)}</p>`);
      lastWasSpeaker = false;
    }
  }

  return `<aside class="room">\n${out.join('\n')}\n</aside>`;
}

export default function remarkRegisters() {
  return (tree, file) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;

      if (node.name === 'room') {
        const html = roomHtml(node);
        // Become a raw HTML node outright: leaving any data.hName behind makes
        // mdast-util-to-hast wrap the result in a stray element.
        delete node.data;
        delete node.attributes;
        node.type = 'html';
        node.value = html;
        node.children = [];
        return;
      }

      if (node.name === 'aloud') {
        // Read-aloud keeps its markdown children; only the wrapper is ours.
        const data = node.data ?? (node.data = {});
        data.hName = 'aside';
        data.hProperties = { className: ['read-aloud'] };
        return;
      }

      file.message(
        `Unknown block ":::${node.name}". The blocks are :::room and :::aloud.`,
        node,
      );
    });
  };
}
