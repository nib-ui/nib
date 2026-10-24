# @nib-ui/react

Nib's interactive components for React 19: one hook per component (`useListbox`, `useDialog`,
`useDataGrid`, …). Each returns `state`, `part(name, key?)` (props to spread on your element) and
`send(event)`. You own the markup; the hook owns ARIA, keys and focus.

```tsx
import { useListbox } from '@nib-ui/react/listbox';

const listbox = useListbox({ items, value, onValueChange: setValue });
return (
  <ul className="nib-listbox" aria-label="Language" {...listbox.part('list')}>
    …
  </ul>
);
```

Keep option arrays and objects the same between renders unless they changed. Ids come from
`useId`; pass `locale` when rendering on the server. See the react guide in the Nib docs.
