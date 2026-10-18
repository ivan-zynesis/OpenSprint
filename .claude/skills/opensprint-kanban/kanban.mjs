#!/usr/bin/env node
// opensprint kanban — proof of concept.
//
// The board lives on its own branch of the remote (`kanban` by default), as one
// Markdown file per card under cards/. Nothing is checked out: cards are read
// with `git show` and written with git plumbing into a temporary index, then
// pushed as a fast-forward. A push that loses a race is rejected by git, so the
// command re-fetches and re-applies its change — the remote branch is the
// single central copy, and every state change is a text change with a commit.
//
// Zero dependencies: node >= 18 and git.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const REMOTE = process.env.KANBAN_REMOTE || 'origin';
const BRANCH = process.env.KANBAN_BRANCH || 'kanban';
const TRACKING = `refs/remotes/${REMOTE}/${BRANCH}`;
const CARDS_DIR = 'cards';

// The initiative states, and the moves between them — mirrors the
// state machine in src/core/initiative-transitions.ts.
const STATES = ['exploring', 'proposed', 'building', 'ready-for-attestation', 'attested', 'completed', 'declined'];
const TRANSITIONS = {
  exploring: ['proposed', 'declined'],
  declined: ['exploring'],
  proposed: ['building'],
  building: ['ready-for-attestation', 'proposed', 'exploring'],
  'ready-for-attestation': ['attested', 'building', 'proposed', 'exploring'],
  attested: ['completed'],
  completed: [],
};

// Columns are presentation only: a card's column follows from its state.
const COLUMNS = [
  { key: 'backlog', title: 'Backlog', states: ['exploring'] },
  { key: 'planning', title: 'Planning', states: ['proposed'] },
  { key: 'dev', title: 'Dev', states: ['building'] },
  { key: 'attestation', title: 'Attestation', states: ['ready-for-attestation', 'attested'] },
  { key: 'done', title: 'Done', states: ['completed', 'declined'] },
];

// ── git ─────────────────────────────────────────────────────────────────────

function git(args, { input, env, allowFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      input,
      env: env ? { ...process.env, ...env } : process.env,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trimEnd();
  } catch (err) {
    if (allowFail) return null;
    const stderr = err.stderr ? String(err.stderr).trim() : err.message;
    throw new Error(`git ${args.join(' ')}\n${stderr}`);
  }
}

/** Blocks for `ms` milliseconds — the tool is synchronous by design. */
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const backoff = (attempt) => sleep(Math.min(2000, 50 * 2 ** attempt) * (0.5 + Math.random()));

/** Fetches the board branch. Returns its commit, or null when the remote has none yet. */
function fetchBoard() {
  // Exact ref only: `ls-remote --heads origin kanban` would also match refs/heads/opsp/kanban.
  const ref = `refs/heads/${BRANCH}`;
  const remoteHas = (git(['ls-remote', REMOTE, ref]) || '').split('\n').some((line) => line.endsWith(`\t${ref}`));
  if (!remoteHas) {
    git(['update-ref', '-d', TRACKING], { allowFail: true });
    return null;
  }
  // Another kanban process in this clone may hold the tracking ref's lock; wait it out.
  for (let attempt = 1; ; attempt += 1) {
    if (git(['fetch', '--quiet', REMOTE, `+refs/heads/${BRANCH}:${TRACKING}`], { allowFail: true }) !== null) break;
    if (attempt === 8) git(['fetch', '--quiet', REMOTE, `+refs/heads/${BRANCH}:${TRACKING}`]);
    backoff(attempt);
  }
  return git(['rev-parse', TRACKING]);
}

function readCards(commit) {
  if (!commit) return [];
  const files = git(['ls-tree', '-r', '--name-only', commit, '--', CARDS_DIR]);
  if (!files) return [];
  return files
    .split('\n')
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseCard(git(['show', `${commit}:${f}`]), f));
}

/**
 * Writes `changes` ({ path: content | null }) on top of `parent` and pushes it
 * as a fast-forward. Returns the new commit, or null when the push lost a race.
 */
function writeBoard(parent, changes, message) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kanban-index-'));
  const env = { GIT_INDEX_FILE: path.join(tmp, 'index') };
  try {
    if (parent) git(['read-tree', parent], { env });
    else git(['read-tree', '--empty'], { env });
    for (const [file, content] of Object.entries(changes)) {
      if (content === null) {
        git(['update-index', '--force-remove', file], { env });
        continue;
      }
      const blob = git(['hash-object', '-w', '--stdin'], { input: content });
      git(['update-index', '--add', '--cacheinfo', `100644,${blob},${file}`], { env });
    }
    const tree = git(['write-tree'], { env });
    const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', message]);
    // No --force: git rejects anything that is not a fast-forward of what we read.
    const pushed = git(['push', '--quiet', REMOTE, `${commit}:refs/heads/${BRANCH}`], { allowFail: true });
    if (pushed === null) return null;
    // Best effort: the next read fetches anyway.
    git(['update-ref', TRACKING, commit], { allowFail: true });
    return commit;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Reads the board, applies `mutate(cards)` and pushes the result, re-reading
 * and re-applying when another writer got there first.
 */
function transact(mutate) {
  const attempts = 10;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const parent = fetchBoard();
    const cards = readCards(parent);
    const result = mutate(cards, parent);
    if (!result) return null;
    const commit = writeBoard(parent, result.changes, result.message);
    if (commit) return { ...result, commit };
    backoff(attempt);
  }
  throw new Error(`Gave up after ${attempts} attempts: the board kept changing underneath this write.`);
}

// ── cards ───────────────────────────────────────────────────────────────────

const FIELDS = ['id', 'title', 'state', 'owner', 'created', 'updated', 'branch'];

function parseCard(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: no frontmatter`);
  const card = { file, body: match[2].replace(/^\n+/, '') };
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z-]+):\s?(.*)$/);
    if (kv && FIELDS.includes(kv[1])) card[kv[1]] = kv[2].trim();
  }
  const [summary = '', history = ''] = card.body.split(/^## History\s*$/m);
  card.summary = summary.trim();
  card.history = history
    .split('\n')
    .map((l) => l.replace(/^- /, '').trim())
    .filter(Boolean);
  return card;
}

function renderCard(card) {
  const front = FIELDS.filter((f) => card[f]).map((f) => `${f}: ${card[f]}`);
  const history = card.history.map((h) => `- ${h}`).join('\n');
  return `---\n${front.join('\n')}\n---\n\n${card.summary}\n\n## History\n\n${history}\n`;
}

const cardPath = (id) => `${CARDS_DIR}/${id}.md`;
const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const whoami = () => git(['config', 'user.name'], { allowFail: true }) || 'unknown';

function requireCard(cards, id) {
  const card = cards.find((c) => c.id === id);
  if (!card) throw new Error(`No card '${id}' on ${REMOTE}/${BRANCH}. \`kanban list\` shows them.`);
  return card;
}

function move(card, to, by, note) {
  const from = card.state;
  const legal = TRANSITIONS[from] || [];
  if (!legal.includes(to)) {
    const options = legal.length ? legal.join(', ') : 'none — it is terminal';
    throw new Error(`'${card.id}' cannot move ${from} → ${to}. From ${from}: ${options}.`);
  }
  card.state = to;
  card.updated = now();
  card.history.push(`${card.updated}  ${from} → ${to}  by ${by}${note ? ` — ${note}` : ''}`);
}

// ── commands ────────────────────────────────────────────────────────────────

const commands = {
  init() {
    const result = transact((cards, parent) => {
      if (parent) {
        console.log(`${REMOTE}/${BRANCH} already exists (${parent.slice(0, 7)}), holding ${cards.length} card(s).`);
        return null;
      }
      const readme =
        '# kanban\n\nThis branch is a board, not code. One file per card under `cards/`.\n' +
        'Change it only through the opensprint kanban tool: every move is a commit, and a\n' +
        'write that loses a race is rejected and retried, never forced.\n';
      return { changes: { 'README.md': readme }, message: 'kanban: init' };
    });
    if (result) console.log(`Created ${REMOTE}/${BRANCH} at ${result.commit.slice(0, 7)}.`);
  },

  backlog(args) {
    const id = args._[0];
    if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('backlog needs a kebab-case id.');
    const by = whoami();
    const result = transact((cards) => {
      if (cards.some((c) => c.id === id)) throw new Error(`'${id}' is already on the board.`);
      const stamp = now();
      const card = {
        id,
        title: args.title || id,
        state: 'exploring',
        created: stamp.slice(0, 10),
        updated: stamp,
        branch: args.branch || `opsp/${id}`,
        summary: args.summary || '',
        history: [`${stamp}  → exploring  by ${by} — backlogged`],
      };
      return { changes: { [cardPath(id)]: renderCard(card) }, message: `kanban: backlog ${id}`, card };
    });
    console.log(`Backlogged ${id} (exploring) — ${result.commit.slice(0, 7)}`);
  },

  claim(args) {
    const id = args._[0];
    const owner = args.owner || whoami();
    const result = transact((cards) => {
      const card = requireCard(cards, id);
      if (['completed', 'declined'].includes(card.state)) throw new Error(`'${id}' is ${card.state}. There is no work left to hold.`);
      const previous = card.owner;
      if (previous === owner) throw new Error(`'${id}' is already held by ${owner}.`);
      // Re-checked on every retry, so the loser of two simultaneous claims is told, not overwritten.
      if (previous && !args['take-over']) {
        throw new Error(`'${id}' is held by ${previous}. Ask first; --take-over reassigns it.`);
      }
      card.owner = owner;
      card.updated = now();
      card.history.push(`${card.updated}  owner ${previous || 'unowned'} → ${owner}  by ${whoami()}`);
      // POC: claiming a backlog item is picking it up, so it moves to planning.
      if (card.state === 'exploring') move(card, 'proposed', whoami(), 'picked up');
      return { changes: { [cardPath(id)]: renderCard(card) }, message: `kanban: ${owner} claims ${id}`, card };
    });
    console.log(`${id}: owner ${owner}, ${result.card.state} — ${result.commit.slice(0, 7)}`);
  },

  advance(args) {
    const id = args._[0];
    const to = args.to;
    if (!to || !STATES.includes(to)) throw new Error(`advance needs --to <${STATES.join('|')}>.`);
    const result = transact((cards) => {
      const card = requireCard(cards, id);
      move(card, to, whoami(), args.note);
      return { changes: { [cardPath(id)]: renderCard(card) }, message: `kanban: ${id} → ${to}`, card };
    });
    console.log(`${id}: ${result.card.state} — ${result.commit.slice(0, 7)}`);
  },

  ready(args) {
    commands.advance({ ...args, to: 'ready-for-attestation' });
  },

  complete(args) {
    const id = args._[0];
    const result = transact((cards) => {
      const card = requireCard(cards, id);
      // Attest and archive usually run together, so complete passes through attested.
      if (card.state === 'ready-for-attestation') move(card, 'attested', whoami(), 'attested');
      move(card, 'completed', whoami(), 'archived');
      return { changes: { [cardPath(id)]: renderCard(card) }, message: `kanban: complete ${id}`, card };
    });
    console.log(`${id}: completed — ${result.commit.slice(0, 7)}`);
  },

  list(args) {
    const commit = fetchBoard();
    const cards = readCards(commit);
    if (args.json) {
      console.log(JSON.stringify({ ref: `${REMOTE}/${BRANCH}`, commit, cards }, null, 2));
      return;
    }
    if (!commit) {
      console.log(`${REMOTE}/${BRANCH} does not exist yet — \`kanban init\` creates it.`);
      return;
    }
    console.log(`${REMOTE}/${BRANCH} @ ${commit.slice(0, 7)}`);
    for (const column of COLUMNS) {
      const inColumn = cards.filter((c) => column.states.includes(c.state));
      console.log(`\n${column.title} (${inColumn.length})`);
      for (const c of inColumn) console.log(`  ${c.id.padEnd(34)} ${c.state.padEnd(22)} ${c.owner || '—'}`);
    }
  },

  import(args) {
    const dir = args._[0] || path.join('opensprint', 'initiatives');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
    const result = transact((cards) => {
      const changes = {};
      const by = whoami();
      for (const file of files) {
        const text = fs.readFileSync(path.join(dir, file), 'utf-8');
        const front = text.match(/^---\n([\s\S]*?)\n---/);
        if (!front) continue;
        const get = (key) => (front[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm')) || [])[1]?.trim();
        const id = get('id');
        if (!id || cards.some((c) => c.id === id)) continue;
        const status = get('status');
        const state = get('state') || (status === 'completed' ? 'completed' : 'exploring');
        const description = (text.split(/^## Description\s*$/m)[1] || '').split(/^## /m)[0];
        const firstParagraph = description.trim().split(/\n\s*\n/)[0] || '';
        const stamp = now();
        changes[cardPath(id)] = renderCard({
          id,
          title: id,
          state,
          owner: get('owner'),
          created: get('created') || stamp.slice(0, 10),
          updated: stamp,
          branch: `opsp/${id}`,
          summary: firstParagraph.replace(/\s+/g, ' ').trim(),
          history: [`${stamp}  imported at ${state} from ${path.join(dir, file)}  by ${by}`],
        });
      }
      const count = Object.keys(changes).length;
      if (count === 0) {
        console.log('Nothing to import — every initiative is already on the board.');
        return null;
      }
      return { changes, message: `kanban: import ${count} initiative(s)`, count };
    });
    if (result) console.log(`Imported ${result.count} card(s) — ${result.commit.slice(0, 7)}`);
  },

  render(args) {
    const commit = fetchBoard();
    const html = renderHtml(readCards(commit), commit);
    const out = args.out || path.join(os.tmpdir(), 'opensprint-kanban.html');
    fs.writeFileSync(out, html);
    console.log(out);
  },

  serve(args) {
    const port = Number(args.port || 4173);
    let cache = { at: 0, html: '' };
    http
      .createServer((req, res) => {
        if (req.url !== '/' && !req.url.startsWith('/?')) {
          res.writeHead(404).end();
          return;
        }
        try {
          // Re-read the remote at most every 10 seconds.
          if (Date.now() - cache.at > 10_000) {
            const commit = fetchBoard();
            cache = { at: Date.now(), html: renderHtml(readCards(commit), commit, { live: true }) };
          }
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(cache.html);
        } catch (err) {
          res.writeHead(500, { 'content-type': 'text/plain' }).end(String(err.message));
        }
      })
      .listen(port, () => console.log(`kanban: http://localhost:${port}  (${REMOTE}/${BRANCH}, re-read every 10s)`));
  },
};

// ── html ────────────────────────────────────────────────────────────────────

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

/** The little Markdown a summary carries: `code`, **bold** and [[record]] links, after escaping. */
const inlineMarkdown = (s) =>
  escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[([A-Za-z0-9-]+)\]\]/g, '<code>$1</code>');

/** The command that would move a card on, for the card's footer. */
function nextStep(card) {
  switch (card.state) {
    case 'exploring':
      return `kanban claim ${card.id}`;
    case 'proposed':
      return `kanban advance ${card.id} --to building`;
    case 'building':
      return `kanban ready ${card.id}`;
    case 'ready-for-attestation':
    case 'attested':
      return `kanban complete ${card.id}`;
    default:
      return '';
  }
}

function renderHtml(cards, commit, { live = false } = {}) {
  const generated = now();
  const columns = COLUMNS.map((column) => {
    const inColumn = cards.filter((c) => column.states.includes(c.state));
    const items = inColumn
      .map((c) => {
        const step = nextStep(c);
        return `
        <article class="card" data-state="${escapeHtml(c.state)}">
          <header>
            <h3>${escapeHtml(c.title)}</h3>
            ${c.owner ? `<span class="owner">${escapeHtml(c.owner)}</span>` : '<span class="owner unowned">unowned</span>'}
          </header>
          ${c.summary ? `<p class="summary">${inlineMarkdown(c.summary)}</p>` : ''}
          <dl>
            <div><dt>id</dt><dd><code>${escapeHtml(c.id)}</code></dd></div>
            <div><dt>state</dt><dd>${escapeHtml(c.state)}</dd></div>
            <div><dt>branch</dt><dd><code>${escapeHtml(c.branch || '—')}</code></dd></div>
            <div><dt>updated</dt><dd><time datetime="${escapeHtml(c.updated)}">${escapeHtml((c.updated || '').replace('T', ' ').replace('Z', ' UTC'))}</time></dd></div>
          </dl>
          ${step ? `<footer><code>${escapeHtml(step)}</code></footer>` : ''}
        </article>`;
      })
      .join('');
    return `
      <section class="column" data-column="${column.key}">
        <h2>${column.title} <span class="count">${inColumn.length}</span></h2>
        ${items || '<p class="empty">Nothing here.</p>'}
      </section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kanban</title>
${live ? '<meta http-equiv="refresh" content="15">' : ''}
<style>
  :root {
    --bg: #f6f7f9; --panel: #eceef2; --card: #ffffff; --text: #1d2027; --muted: #626a78;
    --border: #d9dde4; --accent: #3b5bdb; --owner-bg: #e7ecff; --unowned: #b3261e;
    --code-bg: #f1f3f6;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14161a; --panel: #1c1f25; --card: #242830; --text: #e6e8ec; --muted: #9aa1ad;
      --border: #333844; --accent: #8ca2ff; --owner-bg: #2a3352; --unowned: #ff8a80;
      --code-bg: #1b1e24;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
         font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  .top { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: baseline;
         padding: 16px; border-bottom: 1px solid var(--border); }
  .top h1 { margin: 0; font-size: 18px; }
  .top .meta { color: var(--muted); font-size: 12px; }
  .board { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 12px; padding: 16px; }
  @media (max-width: 1100px) { .board { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) { .board { grid-template-columns: 1fr; } }
  .column { background: var(--panel); border-radius: 10px; padding: 10px; min-height: 120px; }
  .column h2 { margin: 2px 4px 10px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em;
               display: flex; justify-content: space-between; color: var(--muted); }
  .count { font-variant-numeric: tabular-nums; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 12px; margin-bottom: 10px; }
  .card header { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
  .card h3 { margin: 0; font-size: 14px; overflow-wrap: anywhere; }
  .owner { flex: none; font-size: 11px; padding: 2px 8px; border-radius: 999px;
           background: var(--owner-bg); color: var(--accent); }
  .owner.unowned { background: transparent; color: var(--muted); border: 1px dashed var(--border); }
  .card[data-state="building"] .owner.unowned,
  .card[data-state="ready-for-attestation"] .owner.unowned,
  .card[data-state="attested"] .owner.unowned { color: var(--unowned); border-color: var(--unowned); }
  .summary strong { color: var(--text); }
  .summary { margin: 8px 0; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 4;
             -webkit-box-orient: vertical; overflow: hidden; }
  dl { margin: 8px 0 0; display: grid; gap: 2px; font-size: 12px; }
  dl div { display: flex; gap: 6px; min-width: 0; }
  dt { color: var(--muted); width: 56px; flex: none; }
  dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
  code { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--code-bg);
         padding: 1px 4px; border-radius: 4px; }
  .card footer { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border); }
  .card footer code { display: inline-block; max-width: 100%; overflow-wrap: anywhere; }
  .empty { color: var(--muted); margin: 4px; font-size: 12px; }
</style>
</head>
<body>
  <div class="top">
    <h1>Kanban</h1>
    <span class="meta">${escapeHtml(`${REMOTE}/${BRANCH}`)} @ <code>${escapeHtml(commit ? commit.slice(0, 7) : 'none')}</code></span>
    <span class="meta">${cards.length} card(s) · read ${escapeHtml(generated.replace('T', ' ').replace('Z', ' UTC'))}${live ? ' · refreshes every 15s' : ''}</span>
  </div>
  <main class="board">${columns}
  </main>
</body>
</html>
`;
}

// ── main ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else {
        args[key] = next;
        i += 1;
      }
    } else args._.push(a);
  }
  return args;
}

const [command, ...rest] = process.argv.slice(2);
if (!command || !commands[command]) {
  console.log(`usage: kanban <command> [args]

  init                                   create ${REMOTE}/${BRANCH} if it does not exist
  backlog <id> [--title t] [--summary s] add a card at exploring
  list [--json]                          every card on the remote board
  claim <id> [--owner name] [--take-over]  take a card; a backlog item moves to planning
  advance <id> --to <state> [--note n]   move a card along the state machine
  ready <id>                             building → ready-for-attestation
  complete <id>                          (ready-for-attestation →) attested → completed
  import [dir]                           seed from opensprint/initiatives/*.md
  render [--out file]                    write the board as one HTML file
  serve [--port 4173]                    serve the live board, re-read from the remote

env: KANBAN_REMOTE (default origin), KANBAN_BRANCH (default kanban)`);
  process.exit(command ? 1 : 0);
}
try {
  commands[command](parseArgs(rest));
} catch (err) {
  console.error(`kanban: ${err.message}`);
  process.exit(1);
}
