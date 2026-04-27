# Material Design 3 — Design Reference

Reference data for Android app design. All values in dp (density-independent pixels) unless noted.

---

## Component Heights

### Top App Bar

| Variant | Collapsed | Expanded |
|---------|-----------|----------|
| Small / Center-Aligned | 64 dp | 64 dp |
| Medium | 64 dp | 112 dp |
| Large | 64 dp | 152 dp |

### Navigation Components

| Component | Standard M3 | M3 Expressive |
|-----------|-------------|---------------|
| Bottom Navigation Bar | 80 dp | 64 dp |
| Bottom App Bar | 80 dp | — |
| Navigation Rail width | 80 dp | 96 dp |
| Navigation Drawer max width | 280 dp | — |

### FAB

| Variant | Size | Icon | Corner Radius |
|---------|------|------|--------------|
| Small | 40×40 dp | 24 dp | 12 dp (Medium) |
| Standard | 56×56 dp | 24 dp | 16 dp (Large) |
| Large | 96×96 dp | 36 dp | 28 dp (Extra Large) |
| Extended | 56 dp height | 24 dp | 16 dp (Large) |

### Other Components

| Component | Key Dimension |
|-----------|--------------|
| Bottom Sheet | max-width 640 dp, corner 28 dp |
| Chips | min-height 32 dp, corner 8 dp |
| Cards | corner 12 dp (Medium) |
| Drag Handle | 32×4 dp visual, 48×48 dp touch |

---

## Window Size Classes

### Width Classes

| Class | Breakpoint | Devices | Navigation |
|-------|-----------|---------|------------|
| Compact | < 600 dp | 99.96% phones portrait | Bottom Navigation |
| Medium | 600–840 dp | Tablets portrait, foldables | Navigation Rail |
| Expanded | 840–1200 dp | Tablets landscape | Rail or Drawer |
| Large | 1200–1600 dp | Large tablets | Navigation Drawer |
| Extra-Large | ≥ 1600 dp | Desktop | Navigation Drawer |

### Height Classes

| Class | Breakpoint | Devices |
|-------|-----------|---------|
| Compact | < 480 dp | Phones landscape |
| Medium | 480–900 dp | Tablets landscape, phones portrait |
| Expanded | ≥ 900 dp | Tablets portrait |

### Grid System

| Window Class | Columns | Margins | Gutters |
|-------------|---------|---------|---------|
| Compact | 4 | 16 dp | 16 dp |
| Medium | 8 | 24 dp | 24 dp |
| Expanded | 12 | 24 dp | 24 dp |

---

## Typography Scale

Font: Roboto (default). Sizes in sp (scale-independent pixels).

| Style | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| Display Large | 57 sp | 64 sp | -0.25 sp | 400 |
| Display Medium | 45 sp | 52 sp | 0 sp | 400 |
| Display Small | 36 sp | 44 sp | 0 sp | 400 |
| Headline Large | 32 sp | 40 sp | 0 sp | 400 |
| Headline Medium | 28 sp | 36 sp | 0 sp | 400 |
| Headline Small | 24 sp | 32 sp | 0 sp | 400 |
| Title Large | 22 sp | 28 sp | 0 sp | 400 |
| Title Medium | 16 sp | 24 sp | 0.15 sp | 500 |
| Title Small | 14 sp | 20 sp | 0.1 sp | 500 |
| Body Large | 16 sp | 24 sp | 0.15 sp | 400 |
| Body Medium | 14 sp | 20 sp | 0.25 sp | 400 |
| Body Small | 12 sp | 16 sp | 0.4 sp | 400 |
| Label Large | 14 sp | 20 sp | 0.1 sp | 500 |
| Label Medium | 12 sp | 16 sp | 0.5 sp | 500 |
| Label Small | 11 sp | 16 sp | 0.5 sp | 500 |

Emphasized variants: Display/Headline/Body use Medium (500), Title/Label use Bold (700).

---

## Spacing System

- **Primary grid**: 8 dp
- **Detail grid**: 4 dp
- **Standard values**: 4, 8, 12, 16, 24, 32, 40, 48 dp

### Margins by Window Class

| Window Class | Content Margins |
|-------------|----------------|
| Compact (< 600 dp) | 16 dp |
| Medium (600–840 dp) | 24 dp |
| Expanded (> 840 dp) | 24 dp |

---

## Shape Scale (Corner Radius)

| Category | Radius | Usage |
|----------|--------|-------|
| None | 0 dp | — |
| Extra Small | 4 dp | Chip top corners |
| Small | 8 dp | Chips, small buttons |
| Medium | 12 dp | Cards, small FABs |
| Large | 16 dp | Standard FABs, drawers |
| Extra Large | 28 dp | Bottom sheets, dialogs |
| Full | 50% | Badges, pills, circular buttons |

---

## Touch Targets

- **Minimum touch target**: 48×48 dp
- Material components auto-expand to 48 dp even if visually smaller

| Component | Visual Size | Touch Target |
|-----------|------------|--------------|
| Chip | 32 dp | 48 dp |
| Checkbox | 20 dp | 48×48 dp |
| Radio Button | 20 dp | 48×48 dp |
| Icon Button | 24 dp icon | 48×48 dp |
| FAB Small | 40 dp | 48×48 dp |

---

## Elevation System

| Level | Shadow (dp) | Usage |
|-------|------------|-------|
| Level 0 | 0 | Flat surfaces, filled buttons, outlined cards |
| Level 1 | 1 | Elevated cards, resting bottom sheets |
| Level 2 | 3 | Navigation bars, rails |
| Level 3 | 6 | FABs (resting), dialogs |
| Level 4 | 8 | Navigation drawers |
| Level 5 | 12 | — |

M3 prefers **tonal elevation** (surface color tone changes) over shadow elevation. Components can set both `tonalElevation` and `shadowElevation` independently.

---

## Canonical Layouts

### List-Detail
| Window Class | Behavior |
|-------------|----------|
| Compact / Medium | Single pane (list OR detail) |
| Expanded+ | Side-by-side (list AND detail) |

### Supporting Pane
| Window Class | Behavior |
|-------------|----------|
| Compact | Supporting content below or in bottom sheet |
| Medium | 50/50 side-by-side |
| Expanded | 70% main / 30% supporting |

### Feed
| Window Class | Behavior |
|-------------|----------|
| Compact | Single column scroll |
| Medium / Expanded | Multi-column grid (`GridCells.Adaptive(minSize = 180.dp)`) |
