# @nib-ui/js

Nib's interactive components without a framework: write the markup, mark it with `data-nib`,
import the components you use and call `init()`.

```html
<ul class="nib-listbox" data-nib="listbox" aria-label="Language" data-value="vi">
  <li class="nib-listbox__option" data-nib-option="en">English</li>
  <li class="nib-listbox__option" data-nib-option="vi">Tiếng Việt</li>
</ul>

<script type="module">
  import '@nib-ui/js/listbox';
  import { init } from '@nib-ui/js';
  init();
</script>
```

- `init(root?)` sets up every marked element not set up yet; call it again after new markup.
- `destroy(root?)` tears them down and restores the markup.
- `@nib-ui/js/auto` calls `init()` once the page is parsed.
- Components report changes as bubbling `nib:` events (`nib:change`, `nib:select`, `nib:edit`, …).

Each module is at most 3 KB gzip (12 KB for the combobox, date picker and data grid). See the
vanilla JS guide in the Nib docs.
