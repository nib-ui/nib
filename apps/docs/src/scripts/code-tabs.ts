// Tabs for the code samples of a component page, per the WAI-ARIA APG tabs pattern with automatic
// activation. Docs-only: the published tabs controller arrives with the Tabs component.
for (const list of document.querySelectorAll<HTMLElement>('[data-code-tabs] [role="tablist"]')) {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (index: number) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !on;
    });
    tabs[index]?.focus();
  };
  list.addEventListener('click', (event) => {
    const index = tabs.indexOf((event.target as Element).closest('[role="tab"]') as HTMLButtonElement);
    if (index >= 0) select(index);
  });
  list.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const last = tabs.length - 1;
    const next = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select((next + tabs.length) % tabs.length);
  });
}
