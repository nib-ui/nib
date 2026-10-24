// "On this page": lists the page's own h2 headings (children of <main>, not those inside examples) and marks the one being read with
// aria-current="location". The current heading is the last one whose top has passed the top fifth
// of the viewport, so a short last section still becomes current at the bottom of the page.
const outline = document.querySelector<HTMLElement>('.docs-outline');
const headings = [...document.querySelectorAll<HTMLHeadingElement>('main > h2')];

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

if (outline && headings.length > 1) {
  const links = headings.map((h) => {
    h.id ||= slug(h.textContent ?? '');
    return Object.assign(document.createElement('a'), { href: `#${h.id}`, textContent: h.textContent });
  });
  outline.querySelector('ul')?.replaceChildren(
    ...links.map((a) => {
      const li = document.createElement('li');
      li.append(a);
      return li;
    }),
  );
  outline.hidden = false;

  const update = () => {
    const line = innerHeight / 5;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let current = 0;
    headings.forEach((h, i) => {
      if (h.getBoundingClientRect().top <= line) current = i;
    });
    if (atBottom) current = headings.length - 1;
    links.forEach((a, i) => {
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// A module, so its names stay its own.
export {};
