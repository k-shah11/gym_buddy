# Design Guidelines: Gym Buddy Accountability App

## Design Approach
**Hybrid Approach**: Combining productivity app clarity with playful personality
- Reference: Duolingo's friendly engagement patterns + Splitwise's clean list design
- Core principle: Functional clarity with delightful micro-moments

## Typography System
**Primary Font**: Inter (Google Fonts) - clean, readable for data
**Accent Font**: Nunito (Google Fonts) - soft, friendly for headings and motivational text

**Hierarchy**:
- Page titles: text-3xl md:text-4xl font-bold (Nunito)
- Section headers: text-xl md:text-2xl font-semibold (Inter)
- Card titles: text-lg font-medium
- Body text: text-base
- Metadata/stats: text-sm font-medium
- Captions: text-xs

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Card spacing: gap-4 to gap-6
- Section margins: my-8 to my-12
- Page containers: max-w-2xl (daily swipe), max-w-4xl (buddies list), max-w-6xl (dashboard)

## Component Design

### Daily Swipe Page (Home)
**Layout**: Single-column centered card-based design
- Hero card: Large rounded-3xl card with generous p-8 to p-12 padding
- Date display: Prominent at top with text-sm tracking-wide uppercase
- Avatar zone: Centered, large (120-160px), with subtle shadow
- Swipe buttons: Full-width horizontal split, each taking 50%, h-20 to h-24
- Summary stats bar: Below main card, showing partner count and total pots (small cards in horizontal row)

### Buddies Overview Page
**Layout**: Splitwise-inspired list with cards
- Header: Add buddy button (top-right), total pots summary card
- Buddy cards: Stacked list (space-y-3), each card containing:
  - Left: Avatar (48px) + name/email stack
  - Center: Pot balance (prominent, text-2xl font-bold)
  - Right: Weekly status badge
- Cards: rounded-2xl, p-5, border with subtle hover elevation

### Weekly Dashboard
**Layout**: Calendar grid visualization
- Week rows: Horizontal 7-column grid per week
- Day cells: Square aspect-ratio boxes (aspect-square), rounded-lg
- Status indicators: Large ✅/❌ centered in cells
- Week summary: Right column showing workout count (text-lg font-bold)
- Per-pair breakdown: Expandable accordion sections below calendar

## Interactive Elements

### Buttons
**Primary action** (swipe right): Rounded-2xl, px-8 py-6, font-semibold text-lg
**Secondary action** (swipe left): Matching style with different semantic treatment
**Add buddy**: Rounded-xl, px-6 py-3, text-base

### Cards
- Base: bg-white with subtle border, rounded-2xl to rounded-3xl
- Shadow: Minimal shadow-sm, shadow-md on hover for interactive cards
- Padding: p-5 to p-8 based on content density

### Avatars
- Bear illustrations: Rounded-full with ring-4 border
- Emotional states: Happy (worked out), crying (missed)
- Size variants: 120px (main swipe), 48px (list), 32px (small)

## Visual Elements

### Status Indicators
- Workout checkmarks: Bold ✅ (text-green-600)
- Missed marks: ❌ (text-red-500)
- Weekly badges: Rounded-full px-3 py-1 text-xs font-medium

### Pot Display
- Honey pot icon: 32-40px inline with balance
- Balance typography: Tabular numbers, font-bold
- Currency symbol: Leading, same size as amount

## Page-Specific Layouts

### Daily Swipe Page Structure
1. Top bar: Date + settings icon
2. Main card (70vh max-height):
   - Date header
   - Avatar display zone
   - Question text ("Did you work out today?")
   - Dual button split
3. Stats summary (below card): 2-column grid of small stat cards

### Buddies Page Structure
1. Header bar: Page title + Add buddy CTA
2. Summary card: Total active pots across all pairs
3. Buddy list: Vertical stack with space-y-4
4. Each row: Flex layout with justify-between

### Dashboard Structure
1. User overview card: Weekly streak summary
2. Calendar grid: 4-8 weeks vertical stack
3. Per-pair comparisons: Tabbed or accordion sections

## Images

**Avatar Illustrations**:
- Happy bear: Cheerful cartoon bear with arms up (public/avatars/bear-happy.svg)
- Sad bear: Crying bear with downturned expression (public/avatars/bear-sad.svg)
- Neutral bear: Default state (public/avatars/bear-neutral.svg)
- Style: Simple line art, soft rounded shapes, 2-3 accent accents

**Honey Pot Icon**:
- Classic honey pot silhouette (public/icons/honey-pot.svg)
- Size: 32x32px to 40x40px for inline use
- Style: Minimal line icon matching avatar aesthetic

**No large hero image** - This is a productivity app focused on daily interaction cards

## Responsive Behavior
- Mobile (base): Single column, full-width cards with px-4 page padding
- Tablet (md:): Maintain single column for swipe, 2-column for buddy list
- Desktop (lg:): Center-aligned with max-width containers, increased padding

## Accessibility
- Focus states: ring-2 ring-offset-2 on all interactive elements
- Contrast: Ensure all text meets WCAG AA standards
- Touch targets: Minimum 44x44px for all buttons
- Labels: Clear aria-labels for icon-only buttons