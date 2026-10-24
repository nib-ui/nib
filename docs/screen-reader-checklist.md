# Screen reader checklist

The manual pass that gates every minor release (ADR 7) and the 1.0 release candidate (#63). Run it
on the docs site's component pages, each example in both themes and once with `dir="rtl"` (an
Arabic matrix page), with:

- **VoiceOver** on the current macOS, in Safari;
- **NVDA** on the current Windows, in Firefox and in Chrome.

For each row, do what the row says and record **pass**, or **fail** with what was announced. A
failure that loses information or traps focus is a `blocker`; a wording or verbosity issue is a
normal bug. Copy the tables into the release's issue and fill in the result columns.

Abbreviations: VO = VoiceOver (VO keys = Control + Option), NVDA in browse mode unless the row says
focus mode.

## Every page

| Check                                                                             | VO  | NVDA FF | NVDA Chrome |
| --------------------------------------------------------------------------------- | --- | ------- | ----------- |
| The skip link is first in Tab order and moves to the main content                 |     |         |             |
| Landmarks list: banner, Site navigation, Docs navigation, main, On this page      |     |         |             |
| Headings list reads h1 then h2s in order                                          |     |         |             |
| Current page in the nav is announced as current page; the section link as current |     |         |             |
| The theme and density toggles say what they switch to ("Switch to dark theme")    |     |         |             |
| Code panels are reachable with Tab and named by their file name                   |     |         |             |

## Interactive components

| Component        | Do                                                                    | Expect                                                                               | VO  | NVDA FF | NVDA Chrome |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --- | ------- | ----------- |
| Listbox          | Tab in; ↓ ↑, Home, End; type "ti"; Enter                              | List name first; each option with its position; chosen state on Enter, not on arrows |     |         |             |
| Disclosure       | Tab to the button; Enter                                              | Button with collapsed / expanded; the panel content follows                          |     |         |             |
| Accordion        | Tab to a button; ↓ ↑ Home End; Enter                                  | Heading level and button; expanded state; the panel is a region named by its button  |     |         |             |
| Tabs             | Tab in; → ← Home End; Tab                                             | Tab list name; tab, selected, n of m; Tab moves into the panel                       |     |         |             |
| Popover          | Enter on the trigger; Tab; Escape                                     | Expanded; the dialog's name; Escape returns focus to the trigger                     |     |         |             |
| Tooltip          | Tab to the trigger; Escape                                            | Name, then the tooltip text as the description; Escape hides it without moving focus |     |         |             |
| Menu             | Enter, ↓, ↑ on the button; arrows; type; Enter; Escape                | Menu button, expanded; each item and checked / selected state; Escape returns focus  |     |         |             |
| Dialog           | Open; Tab around; Escape                                              | Dialog name and description; focus stays inside; Escape returns focus to the opener  |     |         |             |
| Drawer and sheet | Open; Tab; Escape                                                     | As dialog                                                                            |     |         |             |
| Toast            | Trigger a toast; trigger an error toast; Tab to UNDO                  | Polite announcement; the error assertively; the action stays until closed            |     |         |             |
| Combobox         | Type "da n"; ↓; Enter; Escape twice                                   | Combobox, expanded; each option as you move; the chosen value; Escape clears         |     |         |             |
| Command palette  | Press the shortcut; type; ↓ ↑; Enter; type nonsense                   | Dialog name; the shortcut on the trigger; current command; "no results" politely     |     |         |             |
| Date picker      | Open; arrows; Page Down; Shift+Page Down; Enter; in range mode Escape | Grid named by the month; each day's full date; today as current; month changes read  |     |         |             |
| Data grid        | Tab in; arrows; Ctrl+End; Enter on a header; Space on a row; F2       | Grid, row and column position; sort state; the selected count; the editor's label    |     |         |             |

## Forms and states (CSS components)

| Check                                                                               | VO  | NVDA FF | NVDA Chrome |
| ----------------------------------------------------------------------------------- | --- | ------- | ----------- |
| Each field reads its label, hint and, when invalid, its error and invalid state     |     |         |             |
| The error summary is announced and its links move focus to the fields               |     |         |             |
| Checkbox, radio and switch read their checked state; the switch as a switch         |     |         |             |
| Tags and status words carry the meaning (never colour alone)                        |     |         |             |
| Loading: the progress value or busy state is announced; the spinner glyph is silent |     |         |             |
| Breadcrumb reads as a named navigation with the current page; pagination likewise   |     |         |             |

## Record

| Release | Date | Tester | VoiceOver / macOS / Safari | NVDA / Windows / browsers | Blockers filed |
| ------- | ---- | ------ | -------------------------- | ------------------------- | -------------- |
|         |      |        |                            |                           |                |
