---
id: DS-RUNTIME-LESS-BOARD
type: reliability
status: active
created: 2026-10-18
hats: [maintainer]
role: strategy
objective: availability-continuity
depends-on:
  - DS-LIVE-BOARD
---

# DS-RUNTIME-LESS-BOARD: The Board Needs No Client-Side Process — Git, the Skill and an HTML Renderer

## Statement

Seeing and working with the board starts no additional process on the client. The simplest
dependencies an opensprint user has are all it needs: the **git CLI**, the **installed skill**, and
something that **renders HTML**. The operator starts nothing separately; everything runs natively
and easily by the agent.

## Rationale

A first proof of concept kept the board with a node script and a local server. It worked, and it was
the wrong shape: a process somebody has to start and keep alive is a dependency every adopter
inherits, and one more thing that can be down when someone needs the board. Git, the skill and a
browser are already on every machine that uses opensprint.

## Measures

- **Primary**: listing and rendering the board use only git and a POSIX shell; the rendered page loads nothing from the network, runs no server and needs no build step

### Bar

  given   an adopter with git, the installed skill and a browser
  when    they list or render the board
  then    nothing is installed, nothing keeps running, and the page loads nothing from the network

- **dimension**: capability against footprint on the adopter's machine
- **chosen**: git, the skill and a static HTML file — for reading and rendering the board
- **traded for**: no live push updates, so refreshing means rendering again; and a page that can run nothing itself, so starting work is a paste, not a click
- **neighbour**: a local server or script serving the board, the first proof of concept

### Posture

- **verdict**: met
- **attested-by**: Claude (fresh session), for Ivan Lee
- **attested-on**: 2026-11-04

A re-attestation, after the change requested on 2026-11-03. Both shipped playbooks, list and
render, run against a real remote with a `PATH` holding only `sh`, `git` and seven shell utilities.
The test first checks that `node` cannot be found, then shows that listing returns every card and
rendering writes a page holding them. No playbook backgrounds a command, so nothing keeps running.
The page is scanned for anything that loads from the network: no `http(s)://`, no
`link`/`img`/`iframe`/`src=`, and no `fetch`, XHR, socket, event source or dynamic import. One blind
spot remains: the scan would miss a protocol-relative URL or a CSS `url()`/`@import`.

### Evidence

- [CI run on pull request 10 at `1d0dbcc`, Test job green](https://github.com/ivan-zynesis/OpenSprint/actions/runs/41668525609/job/126030285690)
- `test/core/kanban-skill.test.ts` — "lists and renders with only git and the shell’s utilities on PATH", "loads nothing from the network (DS-RUNTIME-LESS-BOARD)"

## Implications

- Reads are git playbooks; rendering fills a static template: [[DEC-BOARD-READ-BY-GIT]]
- A button copies a command rather than running one: [[DEC-BOARD-BUTTON-LAUNCHES-SESSION]]
