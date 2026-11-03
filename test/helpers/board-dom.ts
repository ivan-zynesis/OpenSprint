import * as vm from 'node:vm';

/**
 * Runs the board page's own script under Node, against a stand-in for the
 * small part of the DOM it uses, so a test can render the page and click it
 * without a browser or a DOM library.
 *
 * The stand-in is deliberately narrow: reading a property no element here
 * has throws, so a page that grows past it fails its test rather than
 * passing it silently.
 */

class FakeNode {
  parentNode: FakeNode | null = null;
  childNodes: FakeNode[] = [];

  get textContent(): string {
    return this.childNodes.map((c) => c.textContent).join('');
  }

  set textContent(value: string) {
    this.replaceChildren(new FakeText(String(value)));
  }

  append(...nodes: Array<FakeNode | string>): void {
    for (const node of nodes) {
      const child = typeof node === 'string' ? new FakeText(node) : node;
      child.remove();
      child.parentNode = this;
      this.childNodes.push(child);
    }
  }

  replaceChildren(...nodes: Array<FakeNode | string>): void {
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes = [];
    this.append(...nodes);
  }

  remove(): void {
    if (this.parentNode === null) return;
    this.parentNode.childNodes = this.parentNode.childNodes.filter((c) => c !== this);
    this.parentNode = null;
  }
}

class FakeText extends FakeNode {
  constructor(private readonly data: string) {
    super();
  }

  override get textContent(): string {
    return this.data;
  }
}

export interface FakeEvent {
  type: string;
  target: FakeElement;
  key?: string;
}

export class FakeElement extends FakeNode {
  readonly attributes = new Map<string, string>();
  readonly listeners = new Map<string, Array<(event: FakeEvent) => unknown>>();
  readonly styles = new Map<string, string>();
  readonly classes = new Set<string>();
  hidden = false;
  value = '';

  readonly style = { setProperty: (name: string, value: string) => void this.styles.set(name, value) };
  readonly classList = {
    add: (name: string) => void this.classes.add(name),
    remove: (name: string) => void this.classes.delete(name),
  };

  constructor(readonly tagName: string) {
    super();
  }

  get className(): string {
    return [...this.classes].join(' ');
  }

  set className(value: string) {
    this.classes.clear();
    for (const name of value.split(/\s+/).filter(Boolean)) this.classes.add(name);
  }

  setAttribute(name: string, value: string): void {
    if (name === 'style') return void this.styles.set('style', String(value));
    this.attributes.set(name, String(value));
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: FakeEvent) => unknown): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  select(): void {}

  /** Dispatches a click on this element only — the page attaches its handlers to the button itself. */
  async click(): Promise<void> {
    for (const listener of this.listeners.get('click') ?? []) await listener({ type: 'click', target: this });
  }

  /** Every element at or under this one that matches. */
  findAll(match: (el: FakeElement) => boolean): FakeElement[] {
    const found: FakeElement[] = [];
    const walk = (node: FakeNode) => {
      if (node instanceof FakeElement && match(node)) found.push(node);
      node.childNodes.forEach(walk);
    };
    walk(this);
    return found;
  }

  has(className: string): boolean {
    return this.classes.has(className);
  }
}

/** Throws on reading anything the target does not have, so an unimplemented DOM call is loud. */
function strict<T extends object>(target: T, what: string): T {
  return new Proxy(target, {
    get(obj, key, receiver) {
      if (typeof key === 'symbol' || key in obj) return Reflect.get(obj, key, receiver);
      throw new Error(`board-dom: ${what} has no '${String(key)}' — the page uses more DOM than the stand-in implements`);
    },
  });
}

export interface RenderedPage {
  /** Element by id, as the page's own markup declares it. */
  byId(id: string): FakeElement;
  /** What the page has copied to the clipboard, most recent last. */
  copied: string[];
}

/** Fills a generated template with cards, as the render playbook does: base64, one script each. */
export function fillBoardTemplate(template: string, cards: string[], meta = 'ref=origin/kanban\n'): string {
  const b64 = (text: string) => Buffer.from(text, 'utf-8').toString('base64');
  const filled =
    `<script type="text/plain" id="board-meta">${b64(meta)}</script>\n` +
    cards.map((card) => `<script type="text/plain" class="card">${b64(card)}</script>\n`).join('');
  return template.replace('<!-- opensprint:cards -->', () => filled);
}

/** Renders a filled board page — template plus cards — and returns its elements. */
export function renderBoardPage(html: string): RenderedPage {
  const elements = new Map<string, FakeElement>();
  const element = (tag: string) => strict(new FakeElement(tag), `<${tag}>`);

  // The page's own markup: every element with an id, and every data script.
  for (const [, tag, attrs] of html.matchAll(/<([a-z]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)) {
    const id = attrs.match(/\bid="([^"]+)"/)![1];
    const node = element(tag);
    node.hidden = /\shidden\b/.test(attrs);
    elements.set(id, node);
  }
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    if (id !== undefined) elements.get(id)!.textContent = body;
  }
  const cardScripts = [...html.matchAll(/<script type="text\/plain" class="card">([^<]*)<\/script>/g)].map(([, body]) => {
    const node = element('script');
    node.textContent = body;
    return node;
  });
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const main = scripts[scripts.length - 1][1];

  const copied: string[] = [];
  const document = strict(
    {
      body: element('body'),
      getElementById: (id: string) => elements.get(id) ?? null,
      querySelectorAll: (selector: string) => {
        if (selector !== 'script.card') throw new Error(`board-dom: querySelectorAll('${selector}') is not implemented`);
        return cardScripts;
      },
      createElement: element,
      createTextNode: (text: string) => new FakeText(text),
      addEventListener: () => {},
      execCommand: () => false,
    },
    'document'
  );
  const navigator = { clipboard: { writeText: async (text: string) => void copied.push(text) } };

  vm.runInNewContext(main, {
    document,
    navigator,
    Node: FakeNode,
    atob,
    TextDecoder,
    setTimeout: () => 0,
    clearTimeout: () => {},
  });

  return {
    byId: (id) => {
      const node = elements.get(id);
      if (node === undefined) throw new Error(`board-dom: the page has no element '${id}'`);
      return node;
    },
    copied,
  };
}
