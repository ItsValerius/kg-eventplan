---
name: "Knallköpp Golkrath Vereinskalender"
description: "Club green, confident condensed lettering and an open, date-led season calendar."
colors:
  green: "#176717"
  green-dark: "#124d22"
  ink: "#17251c"
  muted: "#5b685e"
  pale: "#e2f9c5"
  wash: "#f5f7f2"
  line: "#dce3d9"
  white: "#fff"
  field-border: "#7f8e7c"
  open-row: "#fafcf7"
  focus: "#439537"
  error-bg: "#fff0eb"
  error-ink: "#9a3524"
  danger: "#a33928"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(48px, 5.7vw, 80px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  date:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "43px"
    fontWeight: 700
    lineHeight: 1
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
  panel-title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  date-compact:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "35px"
    fontWeight: 700
    lineHeight: 1
  login-display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "62px"
    fontWeight: 700
    lineHeight: 1.03
  login-display-compact:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "49px"
    fontWeight: 700
    lineHeight: 1.03
  wordmark:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.1
  wordmark-compact:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.1
  micro:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  tag: "3px"
  field: "5px"
  control: "6px"
  panel: "12px"
spacing:
  4: "4px"
  8: "8px"
  12: "12px"
  16: "16px"
  20: "20px"
  24: "24px"
  30: "30px"
  36: "36px"
  48: "48px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 19px"
  button-primary-hover:
    backgroundColor: "{colors.green-dark}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 19px"
  button-text:
    textColor: "{colors.green}"
    padding: "0"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 19px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px"
  month-tile:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
  month-tile-empty:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
  next-date:
    textColor: "{colors.green}"
  form-panel:
    backgroundColor: "{colors.wash}"
    rounded: "{rounded.panel}"
    padding: "30px"
---

# Design System: Knallköpp Golkrath

## Overview

**Creative North Star: "Vereinskalender"**

The Vereinskalender gives club life a clear, welcoming visual voice: strong green, white space and sturdy condensed lettering. Large dates and compact metadata establish a readable rhythm shared by the public calendar and its administration.

The design is flat and practical, with pale green selection and restrained borders. Expressive typography carries the celebration; controls remain familiar and plainly labelled. The established green-and-white club identity and its crest remain the durable brand anchors.

**Key Characteristics:**

- Condensed display lettering with ordinary sans-serif reading text.
- Green actions, pale green selection and white open rows.
- Date-led alignment with compact supporting metadata.
- Responsive reflow that preserves event order and publication status.

## Colors

Club green carries recognition and action; cool white and green-tinted neutrals keep dense date information calm. Frontmatter values are the normative palette.

### Primary

- **Club Green / Deep Club Green:** primary controls, active navigation, dates and green heading spans; the deeper value is the primary hover state.
- **Pale Celebration Green:** selected months, successful form feedback and light lettering on the season block.

### Secondary

- **Publication states:** pale green marks published dates in administration; the neutral wash marks drafts.
- **Error red:** error feedback and destructive controls; reserve the danger fill for the explicit delete action.

### Neutral

- **White:** page and field surfaces.
- **Ink / Muted:** primary text and supporting metadata.
- **Wash / Line:** quiet form panels, hover surfaces and thin row dividers. Fields, checkboxes and the scrollbar use the stronger field-border tone, which keeps input outlines at 3:1 or more against white and wash (WCAG 1.4.11).

### Dark theme

Dark mode follows the system until a visitor uses the footer toggle (remembered per browser); it applies on screen only, so printouts stay light. Green-tinted near-black (`#0f1712`) replaces white, and club green lightens to `#56b04a` so it reads on dark while staying green rather than lime; danger deepens to `#b8452f` so white labels keep 5:1. Dialog scrims use the `--scrim` token in both themes.

**The Green Action Rule.** Use club green for primary actions and active navigation; pale green identifies selected or successful states.

## Typography

**Display Font:** locally served Barlow Condensed Bold (woff2 for the web; the TTF remains for the PDF and social images), with sans-serif fallback.
**Body Font:** Arial, Helvetica, sans-serif.

The display face supplies dense, cheerful weight while the body face makes labels and details practical. This is an observed role hierarchy, not a mathematical modular scale.

### Hierarchy

- **Display:** primary public heading uses the frontmatter clamp. Login headings use login-display (62px) and login-display-compact (49px) below 1000px; the admin page headline uses headline (44px), dropping to panel-title (32px) below 700px. The header wordmark uses wordmark (27px) and wordmark-compact (23px).
- **Headline:** section headings use the frontmatter headline role; public schedule headings become 38px on mobile. Form headings use 35px, reducing to 29px on mobile.
- **Date:** public day numerals use the date role, reducing to 39px on mobile; administration dates use 35px. The public hero states the complete season title in the display face.
- **Title:** public event titles use the title role, reducing to 18px on mobile. Admin titles use 16px, reducing to 15px.
- **Body:** global body uses the frontmatter body role; event details use 13px with 1.75 line-height and a 65ch measure.
- **Label:** buttons use the label role; field labels and admin row metadata use 12px. 11px is the floor for all text: weekdays, month abbreviations, column headers and status badges.

**The Date Rhythm Rule.** Keep calendar dates aligned in a dedicated leading column and use tabular numerals for public date values and month counts.

## Layout

The shared shell is centered with a 1280px maximum width and 48px side padding. At 1500px and above the maximum grows to 1360px. At 1000px and below gutters become 30px, and at 700px and below 20px. On the overview, the club crest and call sit directly beside the season headline without a separate header bar.

The public desktop agenda uses a 300px session-month rail, a flexible event column and a 48px gap; the intermediate layout uses 270px and 32px. From 700px up the rail is sticky. At 700px the month overview moves above the agenda, and the month view shows only the caption and arrows so the events follow directly. Public date, title and disclosure remain aligned while time and venue stack. Desktop event rows use 22px vertical padding; mobile uses 20px.

Administration lists events in a shadcn data table (TanStack Table) under the same month headings as the public agenda; the headings are full-width rows inserted wherever the month changes, so they follow whatever is filtered. Above it, a search field (club, title and venue; umlauts match their ae/oe/ue spellings) sits beside status and month selects and a “Vergangene ausblenden” checkbox. Filters live in the query string (suche, status, monat, kommend) via history.replaceState, so reloads and shared links keep the view without a server round trip. Desktop columns are date (compact 35px numerals), event (capped at 34rem from 1000px so the status switch sits near the titles), status and 160px actions (edit, duplicate, delete); below 700px the status switch moves under the event text, beside a single “⋯” menu (Bearbeiten, Duplizieren, Löschen) that replaces the three icon buttons. Icon actions are 44px ghost squares with native tooltips: edit, duplicate and delete stay muted until their row is hovered or focused; then edit and duplicate turn green and delete turns danger red (the Zugänge rows follow the same rule). Past events mute their numerals and titles, like the public month view, so the list shows where the season stands. Duplicating opens a new-event form with everything but the date and publication copied, focused on the date. The status column is a switch, so publishing and withdrawing need no form; switch and its text form one 44px-tall tap target, and only the toggled row waits for the server. The form uses the same switch. The count line above the table reports the drafts still to publish and doubles as a toggle for the drafts filter (semibold and underlined at rest, a pale-green tag while active); a filtered view states “N von M Terminen”. Every per-event label, confirmation and toast names the event with its short date (“KG Knallköpp – Biwak, So., 24. Jan.”), so duplicates stay distinguishable. Below 700px the search stays visible and status, month and “Vergangene ausblenden” fold behind a “Filter” button that shows how many are active. A skip link after the toolbar jumps keyboard users past the list to Zugänge. Admin headings use the display face at headline (44px) for the page and panel-title (32px) for dialogs, sections and the empty state. Deleting asks first in an alert dialog (“Behalten” focused, “Ja, löschen” in danger fill). Feedback appears as shadcn toasts (Base UI), bottom left on desktop so they never cover the status and action columns, full width at the bottom on phones; the list never shifts. Success toasts close after 3s and name the event with its date, saves included; errors stay until dismissed. After a save the row scrolls into view and carries a brief pale-green tint. Adding, editing and duplicating open the form in a dialog; closing it returns focus to the button that opened it. The close button and “Abbrechen” close at once; Escape or a backdrop click on an edited form first asks “Änderungen verwerfen?” (“Weiter bearbeiten” focused, “Verwerfen” in danger fill); a nested confirm dims the dialog beneath it with the scrim token instead of stacking a second page scrim. While a publish is saving, a small spinner replaces the row's status text. Below 700px the page headline drops to the panel-title size. The Zugänge section below the events follows the same patterns: “Jemanden einladen” opens the invite form in a dialog with inline field errors, removing access asks in an alert dialog (“Behalten” focused), and both sections share one toast stack. Event forms use two columns with a 20px gap: title, venue and description span both columns while date and time stay paired. Native date/time appearance follows browser locale.

## Elevation & Depth

Depth comes entirely from white, wash and pale surfaces with fine borders. There are no box shadows. Login and edit panels have more generous rounding than the open event rows; this marks an editing context without suggesting floating layers.

**The Flat Surface Rule.** Separate content with whitespace, fine borders and tonal fills; the shipped system has no box shadows. Overlays follow it too: dialogs, the row menu and toasts are popover-filled with a 1px line border (panel rounding for dialogs, field rounding for toasts) over a flat, unblurred ink scrim, and dialog buttons sit directly in the panel without a tinted footer bar. On phones the alert dialog stacks “Behalten” above the danger action.

## Shapes

Small rectangular controls use restrained corners: field and month-selection rounding, control rounding and tag rounding are specified in frontmatter. Form panels use the larger panel radius. Rows stay open and square, divided by a single bottom rule. The public hero pairs the headline with the club crest and “Jolkere, Knall Mött!” call.

## Components

### Buttons

Confident, compact controls. Primary and outline variants share a 45px minimum height, inline icon gap of 12px and the frontmatter padding. Primary hover deepens the green; outline hover uses wash with a stronger border. Text actions use green, no fill and an underline on hover. Danger is a distinct filled delete action. Disabled buttons fade to 0.55 opacity and use a wait cursor. The button doing the work stays solid, swaps its icon for a spinner and names the action in progress (e.g. “Wird gespeichert …”). Preserve meaningful labels alongside SVG icons.

### Inputs / Fields

White fields have a fine field-border stroke, field rounding and 12px padding; edit inputs have a 46px minimum height. Validation is German and inline: each invalid field gets the error border and its message directly below, and focus moves to the first one. Keyboard focus is a 3px green outline offset by 4px on every control, including switches, checkboxes, native selects and toasts (one global rule in globals.css; components must not add their own rings or `outline-none`), and it turns red on a field marked invalid; the resting outline colour is also green, so colour transitions never flash ink. Error feedback uses the error pair; success uses pale green and deep green. Native selectors and date/time controls retain their platform behavior.

### Navigation

The overview integrates the club crest and call into the hero. Administration remains available at `/admin`. The public filter rail initially shows November 2026 through February 2027 as four 56px month tiles, each with its event count in the display face; months without events and months that are already over use the quiet bordered tile. The agenda shows only upcoming events; past events stay reachable through the month tiles, where a month view lists all of that month’s events with past ones muted. Empty states name their case in one line: no events yet, an empty month (future or past tense), no further dates yet, or the session is over. The session ends on Aschermittwoch (10 February 2027). Selecting a tile replaces the overview with that month’s full calendar and filters the list. Only event days are active in the calendar: they are filled pale green, and selecting one opens and scrolls to its row. Today carries a field-border ring; calendar navigation stays within those four months, and a control returns to the month overview and all events.

### Loading

Placeholders mirror the real layout (month tiles, date-led rows, admin actions) with soft green-tinted bars and a slow sweep. They fade in after 150ms so fast loads never flash them; reduced motion leaves them static.

### Chips

Published rows stay quiet: muted “Veröffentlicht” text beside the switch. Drafts, the work still to do, carry a wash “Entwurf” tag with a field-border outline, micro type and tag rounding. They are labels, not filter buttons.

### Cards / Containers

The form panel is a wash-filled, line-bordered container with panel rounding, 30px edit-form padding and 36px login padding. Mobile reduces edit padding to 20px 16px and login padding to 26px. The public agenda itself is composed of open rows.

### Event disclosure

Native details/summary rows combine a leading date, title and metadata with an SVG plus control. The next upcoming date switches its numeral and weekday to the brighter club green, with a bold weekday; it has no fill. Past rows in a month view use muted numerals and titles. Hover adds wash. Opening a row writes its link (#termin-<id>) into the address bar, and opening such a link opens the row, switching to its month when the event is past. Opening adds a faint green surface, rotates the plus 45 degrees and reveals the description aligned under the title. The reveal lasts 0.25s with cubic-bezier(0.16, 1, 0.3, 1); button color transitions last 0.18s. Reduced-motion overrides remove animations, transitions and smooth scrolling, including script-driven scrolling.

## Do's and Don'ts

### Do:

- Do preserve the green-and-white identity and existing club crest.
- Do pair Barlow Condensed headings and dates with the body sans-serif stack.
- Do keep publication state explicit in administration and hide drafts from public responses.
- Do provide a visible keyboard focus outline and respect reduced motion.
- Do use native disclosure, input and select semantics for familiar interaction.

### Don't:

- Don't turn the open event agenda into a collection of elevated cards.
- Don't use decorative eyebrows as a recurring heading style.
- Don't introduce shadows, gradients or unrelated accent colors into ordinary controls.

## Implementation: shadcn + Tailwind

Both routes use Tailwind CSS v4 utilities for component and responsive layout styling. `app/globals.css` owns only semantic shadcn theme tokens, shared element defaults, and reduced-motion/reveal rules. `primary` maps to club green, `primary-dark` to deep green, `muted` to the wash surface, `muted-foreground` to secondary text, and `accent` to pale green. The local Barlow font is exposed as `font-display` via `--font-barlow`; body copy uses `font-sans`.

`components.json` uses **base-nova**. The user explicitly requested **Base UI, without Radix**. Local shadcn components live in `components/ui`: `Button`, `Input`, `Textarea`, `NativeSelect`, `Checkbox`, and `Badge`. Button variants retain primary, outline, ghost, destructive and text actions; sizes cover ordinary, icon, text and month-filter controls. Anchor composition uses the Base UI `render` prop with `nativeButton={false}`. Submit buttons declare `type="submit"` explicitly. The calendar retains native details/summary disclosure.

Add future components with `pnpm dlx shadcn@latest add <component>`; preserve Base UI and the current tokens. Use utility classes at the component boundary and `cn` for conditional class merging. Do not restore the old global component selectors or header navigation. Existing isolated component previews describe the retained appearance; source implementations are now the shadcn files above.
