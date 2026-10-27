/**
 * OPSP Kanban Workflow Template
 *
 * Skill and command templates for listing the live board and rendering it in
 * a browser, with git and a POSIX shell only (DEC-BOARD-READ-BY-GIT,
 * DS-RUNTIME-LESS-BOARD). Reads only: cards move through `opensprint kanban`
 * and the workflows that own each move (DEC-CARD-WRITES-THROUGH-CLI).
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

/**
 * Where the render playbook finds the board template, relative to the
 * repository root. A shell cannot locate the file that described it, so the
 * opsp-layer writer substitutes the path it wrote the template to, per tool.
 */
export const KANBAN_TEMPLATE_PLACEHOLDER = '{{kanbanTemplate}}';

export function getKanbanSkillTemplate(): SkillTemplate {
  return {
    name: 'opensprint-kanban',
    description: 'Show the live board — list every card on the remote kanban branch with plain git, or render the board in a browser from a static template. Reads only; nothing runs in the background.',
    instructions: KANBAN_INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires git and a POSIX shell (Git Bash on Windows).',
    metadata: { author: 'opensprint', version: '1.0' },
  };
}

export function getOpspKanbanCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSP: Kanban',
    description: 'List the live board, or render it in a browser',
    category: 'Workflow',
    tags: ['workflow', 'opsp', 'kanban', 'board'],
    content: KANBAN_INSTRUCTIONS,
  };
}

const KANBAN_INSTRUCTIONS = `Show the live board: list its cards, or render it in a browser.

The board lives on **one branch of the remote**, \`origin/kanban\`, as one Markdown file per card, so
every checkout, branch and pull request reads the same cards (\`DEC-BOARD-ON-REMOTE-BRANCH\`). This
skill only reads it. The page it renders is a **visualisation** for people; an agent works from the
list, and through the \`opensprint\` CLI.

## How the board is stored

\`\`\`
origin/kanban
  README.md
  cards/<id>.md     frontmatter: id, title, state, owner, created, updated, branch
                    then a summary, "## Milestones" — one "- [stage] name: description" per milestone —
                    and "## History", one line per write
\`\`\`

| Column | Cards |
|---|---|
| Backlog | \`exploring\`, nobody holds it |
| Planning | \`exploring\`, held — triage has claimed it |
| Dev | \`proposed\`, \`building\` |
| Attestation | \`ready-for-attestation\`, \`attested\` |
| Done | \`completed\`, \`declined\` |

A milestone's stage is one of \`todo\`, \`specifying\`, \`building\`, \`review\`, \`done\` or
\`superseded\`.

## Playbook 1 — list the board

Always fetch first: the remote is the board, and a copy read earlier is not.

\`\`\`bash
if git fetch --quiet origin +refs/heads/kanban:refs/remotes/origin/kanban 2>/dev/null; then
  for f in $(git ls-tree --name-only origin/kanban cards/); do
    git show "origin/kanban:$f" | awk '
      /^---$/ { n++; next }
      n == 1 && /^id:/    { id = substr($0, 5) }
      n == 1 && /^state:/ { state = substr($0, 8) }
      n == 1 && /^owner:/ { owner = substr($0, 8) }
      END { printf "%-36s %-22s %s\\n", id, state, (owner == "" ? "-" : owner) }'
  done
else
  echo "origin has no board yet. 'opensprint kanban init' creates it and seeds every initiative."
fi
\`\`\`

That prints \`id  state  owner\` for every card. To read one card in full:

\`\`\`bash
git show origin/kanban:cards/<id>.md
\`\`\`

Backlog items are the cards at \`exploring\` that nobody holds. If a card names someone else as its
owner, ask the operator before picking it up.

## Playbook 2 — render the board

Fill the static template with the cards and open it. Each card goes in as **base64**, so no card text
can break the page; the page decodes and parses the cards itself.

\`\`\`bash
if git fetch --quiet origin +refs/heads/kanban:refs/remotes/origin/kanban 2>/dev/null; then
  REF=origin/kanban
  TPL="$(git rev-parse --show-toplevel)/${KANBAN_TEMPLATE_PLACEHOLDER}"
  OUT="\${TMPDIR:-/tmp}/opensprint-kanban.html"
  MARK='<!-- opensprint:cards -->'
  MAIN=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")   # the main checkout
  {
    sed "/$MARK/,\\$d" "$TPL"
    printf '<script type="text/plain" id="board-meta">%s</script>\\n' "$(
      printf 'ref=%s\\nsha=%s\\nat=%s\\nrepo=%s\\nmain=%s\\nparent=%s\\n' \\
        "$REF" "$(git rev-parse --short "$REF")" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \\
        "$(basename "$MAIN")" "$MAIN" "$(dirname "$MAIN")" | base64 | tr -d '\\n')"
    for f in $(git ls-tree --name-only "$REF" cards/); do
      printf '<script type="text/plain" class="card">%s</script>\\n' \\
        "$(git show "$REF:$f" | base64 | tr -d '\\n')"
    done
    sed "1,/$MARK/d" "$TPL"
  } > "$OUT"
  echo "$OUT"
else
  echo "origin has no board yet. 'opensprint kanban init' creates it and seeds every initiative."
fi
\`\`\`

Then open the file it printed — in your own browser pane if you have one, otherwise \`open\` (macOS),
\`xdg-open\` (Linux) or \`start\` (Windows). To refresh, run the playbook again; nothing keeps running
in between.

## What the page shows

One column per stage, each card with its owner, state, branch, last change, its milestones — how
many are done and which is next — and its history. A card in flight with nobody holding it is marked
in red.

## Guardrails

- **Read-only.** This skill never writes to \`origin/kanban\`, and never touches the working tree or
  the current branch.
- **Fetch before you read.** Do not act on a list you made earlier; read again.
- **Never edit a card by hand.** A card moves through the workflow that owns the move, and is created
  or corrected through \`opensprint kanban init\` and \`opensprint kanban seed\`.
`;
