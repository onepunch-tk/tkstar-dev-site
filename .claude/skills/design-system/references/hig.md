# Apple Human Interface Guidelines — Design Reference

Reference data for iOS/iPadOS design. All values in pt (points) unless noted.

---

## Component Heights

### Navigation Bar
| Variant | Height |
|---------|--------|
| Standard (content area) | 44 pt |
| Large Title (content area) | ~96 pt (44 + ~52 large title area) |

Navigation bar total height = bar height + status bar safe area inset.

### Tab Bar
| Context | Height |
|---------|--------|
| iPhone portrait | 49 pt |
| iPhone landscape | 32 pt |
| iPad | 50 pt |

Add home indicator height (34 pt portrait, 21 pt landscape) on Face ID devices.

### Other Bars
| Component | Height |
|-----------|--------|
| Toolbar (iPhone) | 44 pt |
| Toolbar (iPad) | 50 pt |
| Search Bar | 56 pt |
| Search Field (internal) | 36 pt |

### Status Bar
| Device Category | Height |
|----------------|--------|
| Home Button (iPhone SE) | 20 pt |
| Notch (iPhone X–14) | 47 pt |
| Dynamic Island Gen1 (14 Pro, all 15) | 59 pt safe area |
| Dynamic Island Gen2 (16/16 Plus) | 59 pt safe area |
| Dynamic Island Gen2 (16 Pro/Pro Max) | 62 pt safe area |
| iPhone 17 (all) | 62 pt safe area |

---

## Device Resolution Matrix

### iPhones

| Device | Screen | Points (w×h) | Pixels (w×h) | Scale |
|--------|--------|-------------|-------------|-------|
| iPhone SE (3rd) | 4.7" | 375×667 | 750×1334 | @2x |
| iPhone 15 / 15 Pro | 6.1" | 393×852 | 1179×2556 | @3x |
| iPhone 15 Plus / 15 Pro Max | 6.7" | 430×932 | 1290×2796 | @3x |
| iPhone 16 / 16 Plus | 6.1" / 6.7" | 393×852 / 430×932 | 1179×2556 / 1290×2796 | @3x |
| iPhone 16 Pro | 6.3" | 402×874 | 1206×2622 | @3x |
| iPhone 16 Pro Max | 6.9" | 440×956 | 1320×2868 | @3x |
| iPhone 16e | 6.1" | 390×844 | 1170×2532 | @3x |
| iPhone 17 / 17 Pro | 6.3" | 402×874 | 1206×2622 | @3x |
| iPhone 17 Pro Max | 6.9" | 440×956 | 1320×2868 | @3x |

### iPads

| Device | Screen | Points (w×h) | Pixels (w×h) | Scale |
|--------|--------|-------------|-------------|-------|
| iPad Mini (7th) | 8.3" | 744×1133 | 1488×2266 | @2x |
| iPad (11th) | 11" | 820×1180 | 1640×2360 | @2x |
| iPad Air 11" (8th) | 11" | 820×1180 | 1640×2360 | @2x |
| iPad Air 13" (8th) | 13" | 1024×1366 | 2048×2732 | @2x |
| iPad Pro 11" (8th) | 11" | 834×1210 | 1668×2420 | @2x |
| iPad Pro 13" (8th) | 13" | 1032×1376 | 2064×2752 | @2x |

---

## Size Classes

| Device | Portrait | Landscape |
|--------|----------|-----------|
| iPhone SE | Compact W × Regular H | Compact W × Compact H |
| iPhone (standard) | Compact W × Regular H | Compact W × Compact H |
| iPhone Plus/Max | Compact W × Regular H | Regular W × Compact H |
| iPad (full screen) | Regular W × Regular H | Regular W × Regular H |
| iPad Split View (narrow) | Compact W × Regular H | Compact W × Regular H |

### Device Class Breakpoints (for responsive mobile design)

| Class | Width (pt) | Devices | Layout Strategy |
|-------|-----------|---------|-----------------|
| Compact | < 390 | iPhone SE, Mini | Single column, condensed spacing |
| Regular | 390–430 | iPhone 15/16, Pro, Pro Max | Single column, comfortable spacing |
| Expanded | > 430 | iPad Mini, iPad, iPad Pro | Multi-column, sidebar navigation |

---

## Typography Scale

Default sizes at "Large" Dynamic Type setting. Font: SF Pro.

| Style | Size (pt) | Weight | Leading (pt) |
|-------|----------|--------|-------------|
| Extra Large Title | 36 | Bold | — |
| Large Title | 34 | Regular | 41 |
| Title 1 | 28 | Regular | 34 |
| Title 2 | 22 | Regular | 28 |
| Title 3 | 20 | Regular | 25 |
| Headline | 17 | Semibold | 22 |
| Body | 17 | Regular | 22 |
| Callout | 16 | Regular | 21 |
| Subheadline | 15 | Regular | 20 |
| Footnote | 13 | Regular | 18 |
| Caption 1 | 12 | Regular | 16 |
| Caption 2 | 11 | Regular | 13 |

Font rule: SF Pro Text for ≤ 19 pt, SF Pro Display for ≥ 20 pt.

### Dynamic Type Scale

| Style | xS | S | M | **L (default)** | xL | xxL | xxxL |
|-------|----|----|----|----|-----|------|------|
| Title 1 | 25 | 26 | 27 | **28** | 30 | 32 | 34 |
| Title 2 | 19 | 20 | 21 | **22** | 24 | 26 | 28 |
| Title 3 | 17 | 18 | 19 | **20** | 22 | 24 | 26 |
| Headline | 14 | 15 | 16 | **17** | 19 | 21 | 23 |
| Body | 14 | 15 | 16 | **17** | 19 | 21 | 23 |
| Callout | 13 | 14 | 15 | **16** | 18 | 20 | 22 |
| Subheadline | 12 | 13 | 14 | **15** | 17 | 19 | 21 |
| Footnote | 12 | 12 | 12 | **13** | 15 | 17 | 19 |
| Caption 1 | 11 | 11 | 11 | **12** | 14 | 16 | 18 |
| Caption 2 | 11 | 11 | 11 | **11** | 13 | 15 | 17 |

Accessibility sizes (AX1–AX5) scale Body from 28 to 53 pt.

12 content size categories: xSmall → Small → Medium → Large (default) → xLarge → xxLarge → xxxLarge → AX1 → AX2 → AX3 → AX4 → AX5.

---

## Spacing & Layout

| Context | Margin |
|---------|--------|
| Compact width (iPhone) | 16 pt |
| Regular width (iPad) | 20 pt |
| Between sibling views | 8 pt |
| View to superview edge | 20 pt |
| Card internal padding | 16 pt |
| Button row gap | 8 pt |

### Touch Targets
- **Minimum tappable area**: 44×44 pt
- Minimum spacing between targets: 8 pt
- Recommended spacing: 12–16 pt
- Near destructive actions: 24–32 pt

---

## Safe Area Insets

| Device Category | Top | Bottom | Left/Right (landscape) |
|----------------|-----|--------|----------------------|
| Home Button (SE) | 20 | 0 | 0 |
| Notch (X–14) | 47 | 34 | 47 |
| Dynamic Island Gen1 (14 Pro, all 15) | 59 | 34 | 59 |
| Dynamic Island Gen2 (16/16 Plus) | 59 | 34 | 59 |
| Dynamic Island Gen2 (16 Pro/Pro Max) | 62 | 34 | 62 |
| iPhone 17 (all) | 62 | 34 | 62 |
| iPad (with Home Indicator) | 24 | 20 | 0 |

Bottom safe area: 34 pt (iPhone portrait), 21 pt (iPhone landscape), 20 pt (iPad).
