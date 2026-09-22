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
  field-border: "#b8c4b4"
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
  month-selected:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.green-dark}"
    rounded: "{rounded.field}"
    padding: "13px 14px"
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
- **Wash / Line:** quiet form panels, hover surfaces and thin row dividers. Fields use the stronger field-border tone.

**The Green Action Rule.** Use club green for primary actions and active navigation; pale green identifies selected or successful states.

## Typography

**Display Font:** locally served Barlow Condensed Bold, with sans-serif fallback.
**Body Font:** Arial, Helvetica, sans-serif.

The display face supplies dense, cheerful weight while the body face makes labels and details practical. This is an observed role hierarchy, not a mathematical modular scale.

### Hierarchy
- **Display:** primary public heading uses the frontmatter clamp. Login headings use 62px and admin headings 58px on desktop; mobile uses 49px and 42px respectively.
- **Headline:** section headings use the frontmatter headline role; public schedule headings become 38px on mobile. Form headings use 35px, reducing to 29px on mobile.
- **Date:** public day numerals use the date role, reducing to 39px on mobile; administration dates use 35px. The public hero states the complete season title in the display face.
- **Title:** public event titles use the title role, reducing to 18px on mobile. Admin titles use 16px, reducing to 15px.
- **Body:** global body uses the frontmatter body role; event details use 13px with 1.75 line-height and a 65ch measure.
- **Label:** buttons use the label role; field labels use 12px and compact event metadata uses 11px. Status badges are compact annotations, not a general text size.

**The Date Rhythm Rule.** Keep calendar dates aligned in a dedicated leading column and use tabular numerals for public date values and month counts.

## Layout

The shared shell is centered with a 1280px maximum width and 48px side padding. At 1500px and above the maximum grows to 1360px. At 1000px and below gutters become 30px, and at 700px and below 20px. On the overview, the club crest and call sit directly beside the season headline without a separate header bar.

The public desktop agenda uses a 300px session-month rail, a flexible event column and a 48px gap; the intermediate layout uses 270px and 32px. At 700px the month overview moves above the agenda. Public date, title and disclosure remain aligned while time and venue stack. Desktop event rows use 22px vertical padding; mobile uses 20px.

Administration reuses the shell and date-led rows. The desktop list allocates flexible event information plus 190px status and 100px actions; intermediate widths use 135px and 90px. Mobile places status below event information and stacks actions at the right. Forms use two columns with a 20px gap; on mobile the venue field spans both columns while date and time remain paired. Native date/time appearance follows browser locale.

## Elevation & Depth

Depth comes entirely from white, wash and pale surfaces with fine borders. There are no box shadows. Login and edit panels have more generous rounding than the open event rows; this marks an editing context without suggesting floating layers.

**The Flat Surface Rule.** Separate content with whitespace, fine borders and tonal fills; the shipped system has no box shadows.

## Shapes

Small rectangular controls use restrained corners: field and month-selection rounding, control rounding and tag rounding are specified in frontmatter. Form panels use the larger panel radius. Rows stay open and square, divided by a single bottom rule. The public hero pairs the headline with the club crest and “Jolkere, Knall Mött!” call.

## Components

### Buttons
Confident, compact controls. Primary and outline variants share a 45px minimum height, inline icon gap of 12px and the frontmatter padding. Primary hover deepens the green; outline hover uses wash with a stronger border. Text actions use green, no fill and an underline on hover. Danger is a distinct filled delete action. Disabled buttons fade to 0.55 opacity and use a wait cursor. Preserve meaningful labels alongside SVG icons.

### Inputs / Fields
White fields have a fine field-border stroke, field rounding and 12px padding; edit inputs have a 46px minimum height. Keyboard focus is a 3px green outline offset by 4px. Error feedback uses the error pair; success uses pale green and deep green. Native selectors and date/time controls retain their platform behavior.

### Navigation
The overview integrates the club crest and call into the hero. Administration remains available at `/admin`. The public filter rail initially shows November 2026 through February 2027 as four square month tiles. The agenda shows the complete session by default. Selecting a tile replaces the overview with that month’s full calendar and filters the list; calendar navigation stays within those four months, and a control returns to the month overview and all events.

### Chips
Admin publication badges use pale green for published dates and the neutral wash for drafts, with compact padding and tag rounding. They are labels, not filter buttons.

### Cards / Containers
The form panel is a wash-filled, line-bordered container with panel rounding, 30px edit-form padding and 36px login padding. Mobile reduces edit padding to 20px 16px and login padding to 26px. The public agenda itself is composed of open rows.

### Event disclosure
Native details/summary rows combine a leading date, title and metadata with an SVG plus control. Hover adds wash. Opening adds a faint green surface, rotates the plus 45 degrees and reveals description and calendar export aligned under the title. The reveal lasts 0.25s with cubic-bezier(0.16, 1, 0.3, 1); button color transitions last 0.18s. Reduced-motion overrides remove animations, transitions and smooth scrolling.

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
