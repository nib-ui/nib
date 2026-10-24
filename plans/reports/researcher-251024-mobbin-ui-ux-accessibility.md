# Mobbin UI/UX and visible-accessibility stress test of the Nib spec

Date: 2026-10-24. Source: Mobbin MCP, platform `web`, 14 `search_screens` queries, about 110 screens viewed (images inspected, not inferred from metadata). No collections saved, no spec files edited. No tool result carried an `ai_usage_notice`.

Verdict key: CONFIRMS (market agrees with Nib), CHALLENGES (market does the opposite; spec change proposed), GAP (Nib silent). Per CLAUDE rule 3, every CHALLENGES touching ADR 2 or ADR 9 is input for the owner, not an applied change.

**Limits of this evidence.**

- Screenshots are static desktop captures. They show visual signals only: focus rings, contrast impressions, glyph + word redundancy.
- They cannot verify roles, ARIA, keyboard order, live regions, skip links (hidden until focus), forced-colors behavior, touch target size, or sticky-header behavior.
- Contrast notes below are visual estimates, not measurements.
- Mobbin's web corpus skews to rounded, shadowed SaaS. Radius-0 / ruled / mono products are rare, so "no market precedent" is weak evidence against Nib, but it also means few direct comparables exist.

## Summary table

| #   | Topic                             | Verdict             | One-line finding                                                                                                                       |
| --- | --------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Current vs selected in menus      | CONFIRMS + GAP      | Market separates the two signals; Nib's weights are inverted (selected is heavier than current) and rule-on-block contrast is untested |
| 2   | Selected toggles beside a primary | Recommend (a)       | Every product keeps the CTA dominant by fill and by placement; Nib has no fill, so placement must carry it                             |
| 3   | Outline-only primary              | CHALLENGES          | 0 of about 25 products use an outline-only primary; outlines are always the secondary                                                  |
| 4   | Data tables                       | CHALLENGES + GAP    | Multi-row selection is a light tint + checkbox, never an inverted row; bulk-action bar and flagged-row rule missing                    |
| 5   | Date picker                       | CONFIRMS + GAP      | Dark endpoints + light range is the norm; disabled-date treatment is under-specified                                                   |
| 6   | Docs                              | CONFIRMS + GAP      | Current-page marker and callouts fine; code-copy feedback and outline current state unspecified                                        |
| 7   | Forms                             | CONFIRMS + GAP      | Glyph + red text inline is universal; no error summary, no required-marker rule                                                        |
| 8   | Destructive confirm               | GAP                 | Type-to-confirm with disabled button until match is the standard                                                                       |
| 9   | Empty and loading                 | CONFIRMS            | Matches; ruled skeleton and "spinner + words" have precedent                                                                           |
| 10  | Flat / mono aesthetics            | GAP (thin evidence) | Mono uppercase section labels and kbd chips appear; true radius-0 is rare                                                              |
| 11  | Visible a11y signals              | Mixed               | Glyph + word status is common; 2px focus rings are stronger than the market norm; muted text often looks light                         |

## Q1. Command palette / listbox / menu: current vs selected

Representative screens:

- [Linear comment menu: "Edit" row has a grey fill](https://mobbin.com/screens/73891735-c12b-4ed3-bd7f-fc6bc3c52228)
- [Linear "Move to" submenu: ✓ at the trailing edge marks the selected item](https://mobbin.com/screens/f1e8745b-81b7-4a78-85e1-a325f4843f42)
- [Vercel find dialog: first result has a full-row grey fill](https://mobbin.com/screens/018ade73-2149-4941-8b2e-1086c81857f3)
- [Supabase command palette: grey fill on current row, mono uppercase group labels SHORTCUTS / QUERIES / ACTIONS, kbd chips](https://mobbin.com/screens/9b4725f5-e038-4fc7-98ad-64a59f74b4d7)
- [Cloudflare version history: 3px blue leading-edge rule marks the active version](https://mobbin.com/screens/2dfb1cd3-26ac-4e63-9866-f293a0306177)

Common pattern: keyboard-current is a soft full-row fill. A selected value is a separate, lighter, trailing glyph (✓) with no fill (Linear). The two signals are never the same mark.

Outliers: Cloudflare is the only product seen using a leading-edge rule, there for "active", not "keyboard-current". Hex ([screen](https://mobbin.com/screens/a54348d3-f754-4cda-a42c-939d4969ea09)) tints the current option's text purple on grey.

Verdict vs Nib: CONFIRMS the split between two signals. Two concerns:

1. Weight inversion. Market: current is the stronger mark (fill), selected is a light ✓. Nib: selected is a full ink block (heaviest), current is a thin 2px rule. In a long list the keyboard position can be easy to miss.
2. Untested overlap. When the current row is also the selected one, a jade rule sits on an ink block. Spec does not state the rule's contrast on the ink fill.

Recommended spec change (Listbox section): keep the rule, and add the hover fill to the current row as well (rule + fill), as every product above does. Add a sentence for the overlap case and verify jade-on-ink >= 3:1 in both themes with `nib theme check`. Selected rows keep the block + ✓.

## Q2. OPEN QUESTION: selected toggle state next to a primary CTA

Representative screens (toggle or option group and a primary action in the same view):

- [WorkOS: selected segment is a white raised pill on a grey track; filled Continue below](https://mobbin.com/screens/b85447f3-590a-4470-ba1d-1d90c5fa7d45)
- [Family: same pattern, Private Key segment white on grey, full-width filled Done below](https://mobbin.com/screens/2f033b35-f60f-4123-b725-d7a36175a042)
- [Figma onboarding: selected chip is a light-blue tint with blue outline; solid blue Continue far from the chips, bottom right](https://mobbin.com/screens/73f92eb7-2729-4dbc-8a30-500172da42d5)
- [Navan: selected tab is a lilac tint with purple outline in the card header; solid purple CTA in the body](https://mobbin.com/screens/787400e5-1602-4973-9027-67effc8a0831)
- [Linktree: selected style is a 2px black outline around a grey tile; filled purple Save in the top bar](https://mobbin.com/screens/9249fe5b-f04e-4524-9974-11f3cfffa763)
- [Stripe buy-button panel: selected option is a 2px purple outline + tint; filled purple Save is in the drawer footer](https://mobbin.com/screens/3a797872-049e-4c2b-b904-4375aa229f6f)
- [Modal: selected is a white filled pill on a dark surface (the strongest selected state seen)](https://mobbin.com/screens/7ed66452-3cea-4aa8-a8e5-738bf9875eb9)
- [Hex: selected is a grey fill; Next is disabled below, at the end of the form](https://mobbin.com/screens/a54348d3-f754-4cda-a42c-939d4969ea09)
- [Mindtrip date dialog: Dates/Flexible segmented pill at the top; black filled Update at the bottom-right footer](https://mobbin.com/screens/6aeccdb5-3875-4dab-b2ee-a60be3880099)

What the evidence shows:

- Selected state is almost always a light form: tint + outline (Figma, Navan, Stripe), raised white on grey (WorkOS, Family), or soft grey (Hex). Only Modal is strongly filled.
- Linktree and Stripe use an outline as "selected", the opposite of Nib, where the outline-weight mark is the primary action.
- The CTA is nearly always a solid fill that no toggle matches, and it is spatially separated: header or top for toggles, footer or bottom-right for the CTA. No screen puts the toggle group and the CTA in the same row.

Options assessed:

- (a) Separate placement. Strong support: universal in the sample, costs nothing, keeps ADR 2 (block = chosen) and ADR 9 (primary = 2px stroke) intact.
- (b) Lighter selected form for toggles. Strong market support, but it breaks ADR 2's single "chosen" mark and the date/row/option consistency that makes Nib legible in grayscale and CVD. Would be a reversal of a decided ADR.
- (c) Accept as is. Not evidenced: no product relies on a stroke-only primary next to a strong selected block; the evidence cannot say whether it works, only that nobody tries it.

**Recommendation: (a), with (c) as the explicit fallback, and no (b).**

- Add a layout rule to Button and Forms: the primary lives in the region's footer/action row at inline-end; pressed toggles, option pickers and segmented controls live in the region's header or content area; they never share a row. Dialog and drawer footers hold the primary and its cancel only.
- Where a toggle must sit beside the CTA (a one-row toolbar), keep the toggle block and rely on position, size (`lg`), and the 2px frame; add a prototype check to the existing token-check page with the worst case (block + 2px primary adjacent, both themes, grayscale).
- Rationale for the risk being modest: the block is the user's own choice, not an action; users look for the action at the end of the region (matches every screen above).
- Unverified: whether a 2px outline reads as "the" action next to a solid ink slab. Mobbin cannot answer that; a quick A/B on the prototype can.

## Q3. Primary button styles in flat / monochrome products

Representative screens:

- [Twenty: mono uppercase GET STARTED is a solid black fill; TALK TO US is the 1px outline secondary](https://mobbin.com/screens/76dbb92a-30b1-4910-b6e0-1b5f618860e6) (closest visual relative to Nib)
- [Relume: Get started is solid black; Learn more is a 1px black outline](https://mobbin.com/screens/8135e384-1c3e-4c72-bad3-b5afaba9ea8e)
- [LangChain: light solid Start building / Try LangSmith; Get a demo is a 1px outline; mono labels](https://mobbin.com/screens/b59685a4-716e-40e4-96ce-b5ce02c8841b)
- [Midday: solid black "Start your trial"](https://mobbin.com/screens/773ec228-a66a-450a-aa09-966c7561e290)
- [Linear marketing: white solid "Sign up" on black](https://mobbin.com/screens/18191caa-a25c-4c43-a7d2-0f6e52b444b1)
- [Resend: 1px outline "Unsubscribe All" under a filled Update](https://mobbin.com/screens/bdfe29cf-a69a-4d75-bc3c-ddd6e6e0e3c3)
- [Resend dialog: black filled Add with a ⌘↵ chip, grey Cancel with an Esc chip](https://mobbin.com/screens/6eaeb9bc-d0ee-4ad4-9340-e3e503da1154)

Common pattern: hierarchy is fill vs outline vs text link. Monochrome products invert the fill (white-on-black or black-on-white) rather than drop it. I found no outline-only primary in about 25 product screens; outline is always the secondary.

Verdict vs Nib: CHALLENGES (conversion and recognizability), already acknowledged in ADR 9 ("outlined CTAs may convert worse; accepted"). This is the reversal the owner explicitly decided; do not change. Useful confirmations: the shortcut-chip-before-word pattern (`[⌘↵]`, `[ESC]`) has direct precedent in Resend; mono uppercase CTA labels have precedent in Twenty.

Recommended spec addition (not a reversal): in the Button section add one sentence that on a busy or imagery ground the primary needs a solid surface behind it (a ruled cell), because a 2px stroke on a photo loses the frame. Keep ADR 9's "reopen with A/B data" condition.

## Q4. Data tables

Representative screens:

- [LangChain datasets: "1 selected" + red-outline Delete appears above the header; checked row, sort glyph per header](https://mobbin.com/screens/d42cdf50-f8b0-4d4f-b6e9-2aa5283ed1df)
- [Shopify orders: "2 selected" bulk toolbar with word buttons + overflow; selected rows grey tint; cancelled row struck through](https://mobbin.com/screens/306b7c73-6f54-4991-872e-ee8b899889a1)
- [ClickUp: floating dark bar "3 Tasks selected" with icon + word actions](https://mobbin.com/screens/e9639493-e0a6-46c9-93d1-d3189cbdc3c7)
- [Midday documents: bottom bar "9 selected / Deselect all / action"](https://mobbin.com/screens/975c0ea4-58a5-442e-bea9-cd42f360fd5d)
- [Meetup: selected rows tinted grey with checkbox; "2 selected of 2 events" bar](https://mobbin.com/screens/6c4c07bd-3086-4562-81e0-d03089799079)
- [Vercel deployments: status = coloured dot + word (Ready / Error / Building), "Current" and "Rolled Back" tags](https://mobbin.com/screens/b9d9cc23-34a1-434c-a4ed-52a2a4f49bb7)
- [GitLab pipelines: "Failed" with a ✖ icon, red `error` chips, no whole-row tint](https://mobbin.com/screens/5c384c13-e9f9-45be-8cef-f08bc517ff7f)
- [Sentry releases: ⚠ / ✓ glyph beside the numeric crash-free rate](https://mobbin.com/screens/fc242c04-1347-4292-b719-e6584955cd7d)
- [Supabase invocations: red `500` chip + mono log text](https://mobbin.com/screens/b5dc05f0-1a81-475b-ac38-9b852445ef52)

Common pattern:

- Multi-row selection = checkbox + soft tint on the row. No product inverts the row. A bulk-action bar appears with a count ("N selected") and word-labelled actions, above the table or floating at the bottom, with a "deselect all".
- Flagged/warning rows are not tinted: status is a cell with a coloured mark plus a word or glyph (Vercel, GitLab, Sentry). Shopify strikes through cancelled rows.
- Sort: a small glyph beside the header word, often always visible (LangChain, Meetup, Zendesk).
- Sticky header: not verifiable from static captures.

Verdict vs Nib:

- CHALLENGES: "selected table row is a cursor block". With multi-select (checkbox rows) a full ink slab per row gets heavy; every comparable uses a tint. Single-select master/detail lists are a different case and the block is fine there.
- GAP: bulk-action bar; flagged-row rule; "N selected" announcement.

Recommended spec changes (Table and data grid):

1. Split selection: single-selection rows (one chosen row) keep the cursor block. Multi-selection rows (with `[x]`) get the checked glyph plus the hover-fill, not the block; the `[x]` glyph carries "chosen". Flag to owner: ADR 2 lists "selected table row" under the cursor block, so this narrows it.
2. Add a bulk-action bar: mono `3 SELECTED`, word buttons (destructive uses the 1px red form), `CLEAR` ghost; it is a polite live-region update.
3. Flagged rows: no row tint; status cell = glyph + word (`✖ FAILED`, `▲ WARN`), consistent with law 5.

## Q5. Date picker

Representative screens:

- [Airbnb: selected endpoints are solid black circles, range is a light grey band, unavailable dates are grey + strikethrough](https://mobbin.com/screens/54761527-353f-47f1-bcf7-c59d267b0e15)
- [Tripadvisor: black endpoints, grey range, past days light grey](https://mobbin.com/screens/b6e40730-e914-4ae1-8813-1b44d4cb0b4d)
- [Mindtrip: same black endpoints/grey range, past days very light grey](https://mobbin.com/screens/6aeccdb5-3875-4dab-b2ee-a60be3880099)
- [Mercor: today is a pale-tint circle, selected days are solid purple, past days faint](https://mobbin.com/screens/2b92cf81-d037-4789-bb00-609b2b7dbd9a)
- [Navan: event days carry a dot under the number plus a legend line "Event days highlighted with a • dot"](https://mobbin.com/screens/7ae17570-c68c-43e9-9537-9dc4bb841d89)
- [Expedia: endpoints solid blue, range pale blue band](https://mobbin.com/screens/4e996cee-f8d5-4778-8ff1-95217a14321b)
- [Kiwi: range band + endpoints in brand green](https://mobbin.com/screens/48e29624-8b1a-4273-b15c-7f809573f8a1)
- [KAYAK: price-tier colours (green/orange/red) per day with only a legend](https://mobbin.com/screens/cc893e37-8460-4521-a192-d32a1c15501d)

Common pattern: solid endpoints, lighter band between them. This matches Nib's "cursor blocks at both ends, hover fill between". Today: a tint or ring (Mercor); Nib's accent-text number + 2px underline is distinct and does not rely on fill. Disabled: mostly faint grey; Airbnb adds a strikethrough.

Verdict vs Nib: CONFIRMS range model and today marker. GAP on disabled dates: faint grey alone is the common failure (past days in Tripadvisor and Mindtrip look very pale; visually under 3:1). KAYAK's colour-only price tiers are the anti-example for law 5.

Recommended spec change (Date picker): disabled days use strikethrough (or a `·` replacing the digit), plus `aria-disabled`, on-surface 3 or darker (never on-surface 4, which is already banned for text). Any per-day data marker needs a glyph, not just a hue, and a legend line (Navan pattern).

## Q6. Docs sites

Representative screens:

- [Mintlify: left nav current page is a green-tinted pill; "On this page" current heading in green, others grey; callout is a neutral raised box with an ⓘ icon](https://mobbin.com/screens/731c0653-266e-4c03-aae6-df4d07631ebd)
- [Neon: tabs of filenames above a code block with an underline on the current tab, "Copy snippet" with icon + words, numbered steps](https://mobbin.com/screens/94fb6fc0-0fb0-4358-b6da-534a1f5addb9)
- [Exa: code block header shows "Copied ✓" after a copy](https://mobbin.com/screens/95c9d4c9-4004-4b9a-8c45-896b81b59de6)
- [Base44: "Copy" / "Copy all" buttons with icon + word on each block](https://mobbin.com/screens/67828c1b-90e1-4e8d-89a1-9e6f6cec99b4)
- [AirOps API docs: callouts are plain tinted boxes with no label or icon; hue only](https://mobbin.com/screens/a160611c-6fec-46bc-88c1-4aff9898cd36)
- [Vercel/Neon doc steps: icon-only copy button at the corner of the block](https://mobbin.com/screens/8f10d056-15b3-4469-a3d1-7bd371906584)
- [Customer.io: icon-only copy, top-right](https://mobbin.com/screens/8d8c4bd1-ddf9-4fb3-b4a7-2bdb39bb3376)
- [Cloudflare: leading 3px rule on the active row](https://mobbin.com/screens/2dfb1cd3-26ac-4e63-9866-f293a0306177)

Common pattern: left nav current = tint fill (Mintlify) or leading rule (Cloudflare); "On this page" current heading = colour change only; callouts = tinted box, sometimes with icon; copy = icon, with or without word; confirmation = label swap to "Copied ✓" (Exa).

Verdict vs Nib: CONFIRMS the leading-rule idea (Cloudflare) and Nib's callout (glyph + label + hue rule) is more redundant than the market, which is good. GAPs:

- "On this page" current heading: market uses colour alone (Mintlify); Nib needs a non-colour signal. Recommend: current heading gets the 2px accent rule on the inline-start edge of the outline plus accent text.
- Code block copy: spec has no copy affordance. Recommend `[COPY]` word button (icon optional, word stays), swapping to `COPIED ✓` for about 2s with a polite live-region message. Icon-only copy (Vercel, Customer.io) violates Nib's words-first rule for non-dense contexts.
- Tabbed code blocks (Neon): current tab = accent underline, per Nib's navigation rule; no change.

## Q7. Forms

Representative screens:

- [Hashnode: red border + red ● glyph + message "Title is required."](https://mobbin.com/screens/b7a1bb30-1f89-4b6c-9c1e-ad6349c62827)
- [Mintlify settings: red border, ⓘ glyph, message, Save disabled](https://mobbin.com/screens/31a78b73-f62f-4129-8d80-df093e8b7021)
- [Quo: red ● glyph + "Wrong email or password"; "Password*" required star in the label](https://mobbin.com/screens/89fe766d-c4d6-4529-a14b-f0c30ecb8ecc)
- [Unify: same ●-glyph message, `Password*`](https://mobbin.com/screens/1d8626e7-61ca-46d3-be7d-75af15020565)
- [Patreon: top banner "Please enter a valid state of residence" plus inline ⊘ message under the postal code field](https://mobbin.com/screens/cb9f9a4d-4056-4be3-b0f1-a37f28c966ec)
- [Square: inline red message + a toast "We need you to complete all of the required fields before we can continue"](https://mobbin.com/screens/2d04b11c-f3d4-4937-a056-1e1898bec97d)
- [Copy.ai: small uppercase field labels and "This field is required" repeated under every field, no summary](https://mobbin.com/screens/4ab58eec-6cef-4abc-b172-e8943044e1ae)
- [Google Workspace: red underline + message "Address line 1 is required"](https://mobbin.com/screens/e3b6e2a3-cc82-4dec-84c0-7a11e2cebd70)
- [Oyster: checkboxes for scopes and terms, filled Submit](https://mobbin.com/screens/58dc7016-6ea7-4eb2-88b3-27185d9ae2bd)
- [GetYourGuide: switches with "On" / "Off" text beside the knob](https://mobbin.com/screens/2e8f2084-d2ee-4ac5-9bbe-80af2d9e9e65)
- [Linear preferences: switch list, each row = icon + title + helper + switch](https://mobbin.com/screens/332e33ea-6a11-476e-9442-06d1ec5a49bb)
- [Brilliant: switch rows with a ✓ toast "Notification preference updated"](https://mobbin.com/screens/97f59a09-7b04-4e98-9971-9210e0e79ba1)

Common pattern:

- Inline error = red border + glyph + sentence, below the field. Nib's `⚠ ENTER A VALID EMAIL` matches (CONFIRMS). A few products show red border only (PayPal) or red border with a message that is hue-only; those are the failures law 5 prevents.
- Error summary: two models. Banner/toast at the top or bottom (Patreon, Square). None is a focusable list of links.
- Required: star after label (Quo, Unify) or "(optional)" word (Square's "Apt, Suite, etc. (Optional)"). Mixed.
- Switch vs checkbox: switches for immediate-effect preferences (Linear, GetYourGuide, Brilliant); checkboxes for consent and multi-select permissions in a submitted form (Oyster). Every switch has a sliding knob; GetYourGuide adds On/Off words, which supports Nib's ON/OFF text.

Verdict vs Nib: CONFIRMS inline errors and ON/OFF words. GAPs:

1. Form-level error summary. Recommend: on failed submit, an alert callout (`⚠ 2 ERRORS`) at the top listing links to each invalid field, focus moved to it. Square and Patreon are the visible precedent, but their pattern is a toast/banner without links (weaker).
2. Required marker rule. Recommend: label suffix `*` plus the word `REQUIRED` in help text only where it is not the default; or mark `(OPTIONAL)` in the label when most fields are required. Pick one convention in the spec.
3. Switch vs checkbox usage rule: switch = applies immediately, checkbox = part of a submitted set or consent. Add one sentence.
4. Knob-less switch: no market precedent for removing the knob. ON/OFF words carry the state, so risk is low, but note the spec has an affordance difference from every product here and test it with the token-check prototype.

## Q8. Destructive confirmation dialogs

Representative screens:

- [Relevance AI: "Please type UX Intelligence Lab to confirm deletion", red filled Delete Project](https://mobbin.com/screens/552cef13-e0e1-41d4-8715-9b5b7d65cb43)
- [AirOps: lists the items to be deleted, input "Type Delete to confirm", confirm button disabled until it matches](https://mobbin.com/screens/f4e2bee1-3cf3-4c30-b20a-95a192688ed1)
- [HubSpot: red header band "Delete 2 records?", type the record count to confirm](https://mobbin.com/screens/df4fa955-be93-4c8a-9bc3-db54924b7151)
- [Clerk: type the app name; orange ⚠ glyph + sentence; red Delete application](https://mobbin.com/screens/71516c8f-ca28-4b68-bca8-01b6ea6e46ec)
- [Resend: "Type DELETE [copy chip] to confirm"; confirm button dark red](https://mobbin.com/screens/5a77cd07-e815-432f-8b21-43d7ef4a9fbf)
- [Okta Workflows: pale-red disabled Delete until typed; red warning paragraph](https://mobbin.com/screens/7d74714a-0e1c-476a-89bc-1426fe545a87)
- [Tailscale: consequences as checkboxes + type the tailnet name + billing note; confirm disabled](https://mobbin.com/screens/02d3db2b-b934-456c-89fd-402fe12be3fd)
- [Lindy: yellow warning box with ⚠ glyph + "irreversible action", typed name](https://mobbin.com/screens/9f1d4d52-a8f7-48b7-89e5-b113b6aa6419)

Common pattern: title with the object name, a plain consequence sentence ("cannot be undone"), often a list of what disappears, a text input that must equal a shown string (name, "DELETE", or a count), and a red confirm that stays disabled until it matches. Cancel sits next to it as a lighter button. Warning is usually glyph + hue.

Verdict vs Nib: GAP. Nib defines the destructive primary (2px red border) but not the type-to-confirm flow. The 2px red border form fits; disabled-until-match is universal.

Recommended spec additions (Dialog):

- Destructive dialog anatomy: `▲ CANNOT BE UNDONE` callout; consequence list; label `TYPE <name> TO CONFIRM` with the string in mono and a copy chip; input; `[ESC]CANCEL` and 2px red `DELETE <OBJECT>`.
- Disabled-until-match uses `aria-disabled="true"` (so it stays focusable and can explain why via `aria-describedby`), not the 45% opacity alone, because a 45% red 2px stroke is a weak "disabled" cue on dark theme. Pair with a visible `0 / 12 MATCHED` style hint or just the helper text.
- Focus starts on the input, not on the destructive button.

## Q9. Empty and loading states

Empty - representative screens:

- [Render: headline, one sentence, then link-cards for each way to start, no illustration](https://mobbin.com/screens/63958e19-2913-4d0e-85d9-39c9654e106b)
- [Cloudflare VPC: icon, headline, sentence, one primary](https://mobbin.com/screens/cdd97707-d189-4bcf-82a8-5a80ec1fbafe)
- [Modal: icon, "No live apps", example cards offering starting points](https://mobbin.com/screens/655fc3a7-4f0e-4dce-b2a9-0c2263dbc1cf)
- [Whop: "No data available" label over a ghost chart, plus an illustrated empty block with one CTA](https://mobbin.com/screens/6de0f2b2-772e-4d3f-8354-3b24feb3f690)
- [Laravel Cloud: illustration + headline + one primary](https://mobbin.com/screens/5a0b71b3-f06f-4b14-af43-b862c1550a8f)
- [PandaDoc: "No data" + one setup button inside a card](https://mobbin.com/screens/788ff117-8786-4b9e-a168-ef25d94a0ac1)
- [Microsoft Copilot: one line of text and one button, nothing else](https://mobbin.com/screens/5c465bd2-580a-450d-b921-6b6a19fd1f06)

Loading - representative screens:

- [Neon: ruled table skeleton, grey bars in 1px-ruled rows (closest to Nib's ghost rows)](https://mobbin.com/screens/9b5b1374-c015-495b-abcb-9cce659c741b)
- [Coda: skeleton + spinner + words "Setting up your first doc..."](https://mobbin.com/screens/55171e3f-c462-477b-b92c-843a8fd8c9b2)
- [Fresha](https://mobbin.com/screens/f87f38b8-1d1e-4102-aae3-5ac5ab07f350) and [Sentry](https://mobbin.com/screens/c331abde-5e53-4dfe-bd6e-024f07f5feb1): bare spinners with no text (the weak pattern)
- [Causal: "Loading your data" dialog that says it can take a while and offers email when ready](https://mobbin.com/screens/0c984c70-efe9-4762-b959-5552e1562f77)

Common pattern: heading + one sentence + one action. Many products add an illustration (Laravel, Whop); some add alternate starting paths (Render, Modal). Loading is split between skeletons and bare spinners.

Verdict vs Nib: CONFIRMS. Nib's "no illustrations, ghost rows, one label, one sentence, one primary" is a stricter version of the dominant shape. The ruled skeleton in Neon and the spinner-with-words in Coda are direct precedents; bare spinners (Fresha, Sentry) are what Nib's "spinner + words" avoids, and are poor for assistive tech.

Small gaps: (a) long-running load (Causal): add a rule for waits over a few seconds ("this can take a while; you can leave"); (b) when a task is empty because of an error, not "nothing yet", use the callout, not the empty state.

## Q10. Flat / square / monospace-heavy aesthetics

Representative screens:

- [Supabase palette: mono uppercase section labels (SHORTCUTS, QUERIES, ACTIONS) and bracket-like kbd chips](https://mobbin.com/screens/9b4725f5-e038-4fc7-98ad-64a59f74b4d7)
- [Twenty hero: mono uppercase nav + CTAs, thin ruled app frame](https://mobbin.com/screens/76dbb92a-30b1-4910-b6e0-1b5f618860e6)
- [LangChain hero: mono nav, mono labels in outlined pills, 1px ruled frame](https://mobbin.com/screens/b59685a4-716e-40e4-96ce-b5ce02c8841b)
- [Modal app page: dark, hairline-ruled file table, green marks only for "live/current"](https://mobbin.com/screens/29f42649-b28c-4749-91f2-b63a844218c2)
- [Cofounder onboarding: numbered options 01 / 02 / 03 in mono, ASCII wordmark](https://mobbin.com/screens/0e760bcc-2b2a-4069-989a-7009b65b802c)
- [Bolt error overlay: mono stack trace, red top rule, "Esc" hint inline](https://mobbin.com/screens/346cc120-e2e0-4080-98f3-a7bdf318cc68)

Common pattern: no screen found with a truly radius-0 + no-shadow system across a whole product. The terminal-leaning products use mono for labels, shortcuts and data, keep a sans for body, and use hairlines to organise dense areas. Hierarchy comes from type size/weight, and a single accent hue for "live/current" (Modal's green current nav item, [screen](https://mobbin.com/screens/29f42649-b28c-4749-91f2-b63a844218c2)), which is very close to Nib's accent = current.

Verdict vs Nib: GAP by absence, not a challenge. The core vocabulary (mono uppercase labels, kbd chips, hairlines, accent for current) appears in shipping products; zero-radius everywhere does not, so Nib's visual identity will be distinctive and is untested against user expectations (e.g. all comparable controls were rounded 4-8px).

Recommendation: no spec change; record in the roadmap that radius 0 and flat selection have no market precedent in this sample, so usability testing of the cursor block and 2px primary is the real validation, not benchmarking.

## Q11. Visible accessibility signals

State again: screenshots show visual signals only. Roles, ARIA, keyboard behaviour, skip links (hidden until focus), live regions and forced colors cannot be verified from these images.

| Signal              | What the screens show                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Nib implication                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus ring          | Most captured inputs show only a 1px border colour change. Stronger examples: [Brilliant](https://mobbin.com/screens/71aafe51-7837-4233-be6b-8551d19b0f09) (heavy dark 2px outline), [Google Gemini](https://mobbin.com/screens/b6a63c32-daac-4420-b9be-4115653fa372) (2px blue frame with floating label)                                                                                                                                                                                                                                                              | Nib's 2px solid accent + 2px offset on every interactive element is stronger than the norm. CONFIRMS. Check the jade ring against ink block backgrounds (see Q1) |
| Colour-only status  | Redundant (dot + word) in [Vercel](https://mobbin.com/screens/b9d9cc23-34a1-434c-a4ed-52a2a4f49bb7), [GitLab](https://mobbin.com/screens/5c384c13-e9f9-45be-8cef-f08bc517ff7f), [Browserbase filter](https://mobbin.com/screens/f2788484-2372-4307-9621-8e7037c0c633), [Supabase chart legend with words](https://mobbin.com/screens/b5dc05f0-1a81-475b-ac38-9b852445ef52). Colour-only: [KAYAK price tiers](https://mobbin.com/screens/cc893e37-8460-4521-a192-d32a1c15501d), ClickUp's coloured status dots next to words are fine but the priority flags rely on hue | Law 5 is consistent with best practice; KAYAK is the anti-example                                                                                                |
| Muted text contrast | Pale-grey helper text and placeholders are common, e.g. [AirOps param descriptions](https://mobbin.com/screens/a160611c-6fec-46bc-88c1-4aff9898cd36), faint past days in [Tripadvisor](https://mobbin.com/screens/b6e40730-e914-4ae1-8813-1b44d4cb0b4d). These look under 4.5:1 (visual estimate only)                                                                                                                                                                                                                                                                  | Nib's on-surface 3 >= 4.5:1 and "on-surface 4 is never text" is stricter than the market; keep and enforce for disabled dates/rows                               |
| Disabled            | Pale fills and 45%-style fades ([Okta Workflows](https://mobbin.com/screens/7d74714a-0e1c-476a-89bc-1426fe545a87), [Resend Add with empty field](https://mobbin.com/screens/bdfe29cf-a69a-4d75-bc3c-ddd6e6e0e3c3))                                                                                                                                                                                                                                                                                                                                                      | Disabled is intentionally exempt from contrast, but add a non-opacity cue for dates (Q5)                                                                         |
| Status feedback     | Visible toast with a ✓ ([Brilliant](https://mobbin.com/screens/97f59a09-7b04-4e98-9971-9210e0e79ba1)), "Copied ✓" ([Exa](https://mobbin.com/screens/95c9d4c9-4004-4b9a-8c45-896b81b59de6))                                                                                                                                                                                                                                                                                                                                                                              | Nib's polite live region is the semantic layer; the visual is a mono glyph + word message                                                                        |
| Touch targets       | Desktop captures only; dense rows and icon buttons about 24-28px high ([Linear](https://mobbin.com/screens/332e33ea-6a11-476e-9442-06d1ec5a49bb) nav, Vercel nav)                                                                                                                                                                                                                                                                                                                                                                                                       | Cannot verify touch; Nib's 28px desktop / 44px touch split is plausible, and 28px clears the WCAG 2.5.8 AA 24px minimum                                          |
| Skip links          | Not visible in static captures (normally hidden until focus)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Cannot verify; spec should still require one (see below)                                                                                                         |
| Icon-only controls  | Frequent (copy buttons in [Vercel](https://mobbin.com/screens/8f10d056-15b3-4469-a3d1-7bd371906584) and [Customer.io](https://mobbin.com/screens/8d8c4bd1-ddf9-4fb3-b4a7-2bdb39bb3376) docs, header icons everywhere)                                                                                                                                                                                                                                                                                                                                                   | Nib's "words first, icon-only only in dense components with accessible name + tooltip" is the right restriction                                                  |

GAP to close in the Accessibility section: "skip link" is not listed. Recommend: `SKIP TO CONTENT` as the first focusable element of every shell, visually revealed on focus with the same 2px accent ring; and a landmark rule for the docs shell (nav, main, "on this page" aside).

## Recommended spec changes, ranked

1. Q2: add a placement rule so the primary lives in the region's footer/action row and never shares a row with pressed toggles / option pickers; test the worst case on the prototype. (Placement, no ADR reversal.)
2. Q4: narrow "selected table row = cursor block" to single-select; multi-select rows use `[x]` + hover fill. Add a bulk-action bar and a glyph + word flagged-row rule. (Touches ADR 2 list; owner decision.)
3. Q8: define the destructive dialog anatomy (type-to-confirm string in mono with copy chip, consequences list, `aria-disabled` confirm until match, focus on the input).
4. Q7: add a form-level error summary (alert with links to fields), a required/optional marker convention, and a one-line switch-vs-checkbox rule.
5. Q1 + Q5 + Q6: strengthen "current" with rule + fill; verify jade-on-ink contrast for the overlap case; give disabled dates a strikethrough; add `COPY` / `COPIED ✓` for code blocks and a non-colour current-heading cue in "On this page"; add a skip link to Accessibility.

## Unresolved questions

- Does a 2px outline primary read as "the action" next to a solid ink block (Q2)? Mobbin cannot show it; needs a prototype or user test.
- Contrast of the jade rule and focus ring on an ink-inverted block in both themes (Q1): not stated in the spec; run through `nib theme check`.
- Should ADR 2's "selected table row" be narrowed to single-select (Q4)? Needs the owner's call because it is a decided value.
- Is the knob-less ON/OFF switch understood without a knob (Q7)? No comparables in this sample.
- Sticky headers, skip links, forced-colors rendering, and real touch-target sizes could not be verified from static screenshots.
- Mobbin's web corpus has almost no radius-0 products, so "market precedent" for the overall look is unknown; benchmark against GitHub/Stripe docs directly if wanted (the sample returned them rarely).
