# Simple Explain UI Source of Truth (For Figma AI)

Use this document as the single source of truth to generate the UI for the web app.

## Project Intent

Design a focused learning app called **Simple Explain**.
The app takes a topic and returns a structured lesson in three levels: Beginner, Intermediate, Advanced.

The product feeling must be:
- Library atmosphere
- Elegant and scholarly
- Calm and focused
- Warm, paper-like, study-friendly

Avoid generic startup aesthetics. This should feel like a modern reading room, not a SaaS dashboard.

## Platform and Scope

- Platform: Responsive web app
- Primary routes: `/en` and `/vi`
- Root route redirects to `/en`
- Single-page experience with state changes (input, loading, lesson)
- No auth UI
- No dark mode

## Core User Flow

1. User lands on input screen.
2. User enters a topic and clicks **Generate Lesson**.
3. User sees a loading screen with animated book motif.
4. User gets lesson screen with three progressive levels.
5. User can:
   - jump between lesson levels
   - adjust reading font size
   - print
   - start a new topic
6. Recent lessons are shown on input screen and can be reopened/exported.

## Screen States to Design

Create high-fidelity frames for:
- Desktop Input state (empty recent list)
- Desktop Input state (populated recent list)
- Desktop Loading state
- Desktop Lesson state
- Mobile Input state
- Mobile Loading state
- Mobile Lesson state

## Global Layout

- Max content width: `980px`
- Horizontal page padding: `2rem` desktop, `1rem` mobile
- Header sits above main card area
- Main content uses card surfaces over textured warm background
- Background should include subtle grid/library pattern and soft radial gradients

## Header Spec

- Left: app logo/title + tagline
- Right: language pills `EN` and `VI`
- Active language pill has stronger background and border emphasis
- Header style:
  - rounded: `24px` desktop, `18px` at smaller widths
  - dark brown to warm brown gradient
  - subtle inner highlight
  - large soft drop shadow

## Input Screen Spec

Main card includes:
- Headline
- Subtitle
- Topic text input
- Primary CTA button
- Hint text
- Recent lessons section

Topic row behavior:
- Desktop: input + button on one row
- Mobile: stacked

Recent lessons area:
- Section title
- Empty state text if no items
- List item when data exists:
  - index number
  - topic button text
  - timestamp
  - export button (JSON)

## Loading Screen Spec

- Centered card
- Book/page loader visual
- Loading message text
- Keep calm, quiet motion feel (not flashy)

## Lesson Screen Spec

Top controls row:
- Left: **New topic** button
- Right: reading tools
  - font size toggle button
  - print button

Lesson article card structure:
- Title
- Decorative divider line
- Meta chips row:
  - generated date
  - total words
  - schema version
- Level jump navigation pills:
  - Beginner
  - Intermediate
  - Advanced
- Three stacked lesson sections:
  - section title
  - word count
  - rich paragraph text body
- Footer line + attribution text

Each lesson section should look like a soft paper inset block inside the main article card.

## Typography

- Display font: `Fraunces` (for titles and key section headings)
- Body font: `Work Sans`
- Tone:
  - editorial
  - readable
  - not overly condensed

Suggested type rhythm:
- Hero/header logo: 2.0rem–2.8rem
- Card headlines: ~2.0rem–2.45rem
- Body reading text: ~1.18rem default
- Meta/helper text: ~0.82rem–0.94rem

## Color Tokens

Use these as base tokens:
- `--bg-0: #f7f2e8`
- `--bg-1: #efe2cd`
- `--surface: #fff9ef`
- `--surface-strong: #fff5e4`
- `--ink: #2f2418`
- `--ink-soft: #685742`
- `--accent-0: #6f4f2b`
- `--accent-1: #ad7c3f`
- `--accent-2: #cfa05f`
- `--line: rgba(95,67,35,0.28)`
- `--line-soft: rgba(95,67,35,0.16)`

## Elevation, Borders, and Radius

- Primary card radius: `16px`
- Header radius: `24px`
- Small controls radius: `8px–11px`
- Use layered paper-like borders:
  - outer border
  - subtle inset border
- Shadows should be soft and warm (brown-tinted), not neutral gray

## Motion and Interaction

- Section transitions: soft fade + slight upward movement
- Primary button hover: slight lift
- Language pills: active/hover emphasis
- Keep transitions subtle and focus-friendly

## Responsive Rules

Breakpoint behavior:
- `<= 900px`
  - header content stacks vertically
  - tighter paddings
- `<= 720px`
  - input row stacks
  - recent list rows stack
  - lesson controls wrap
  - text size slightly reduced

## Print Mode Intent

In print-friendly lesson mode:
- Hide header and interactive controls
- Keep lesson content clean on white background

## Accessibility Requirements

- Clear visual focus rings on interactive controls
- High readability contrast for body text
- Touch-friendly tap targets on mobile
- Respect reduced-motion preferences

## Localization Copy (Must Support EN + VI)

Use these exact content concepts:

English:
- Logo: `Simple Explain`
- Tagline: `From first principles to deep understanding`
- Input heading: `Choose a topic to break down`
- Generate button: `Generate Lesson`
- Recent heading: `Recent lessons`

Vietnamese:
- Logo: `Giải Thích Đơn Giản`
- Tagline: `Từ nền tảng đến hiểu sâu một cách có hệ thống`
- Input heading: `Chọn chủ đề bạn muốn hiểu rõ`
- Generate button: `Tạo Bài Học`
- Recent heading: `Bài học gần đây`

## Component List to Produce in Figma

- `Header / Default`
- `LanguagePill / Default / Active`
- `InputCard / Empty`
- `InputCard / WithRecentItems`
- `RecentItem / Default`
- `Button / Primary`
- `Button / Secondary`
- `ToolButton / FontSize`
- `ToolButton / Print`
- `LoadingCard / BookLoader`
- `LessonCard / Full`
- `MetaChip`
- `LevelJumpPill / Default`
- `LessonLevelBlock`

## Final Instruction for Figma AI

Generate a complete responsive UI system and screen set for this app using the exact structure above.
Preserve the elegant library-study-focus vibe.
Prioritize reading comfort, typographic hierarchy, and warm editorial aesthetics over dashboard-like density.
