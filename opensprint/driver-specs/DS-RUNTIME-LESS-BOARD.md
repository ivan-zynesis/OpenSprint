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

## Implications

- Reads are git playbooks; rendering fills a static template: [[DEC-BOARD-READ-BY-GIT]]
- A button copies a command rather than running one: [[DEC-BOARD-BUTTON-LAUNCHES-SESSION]]
