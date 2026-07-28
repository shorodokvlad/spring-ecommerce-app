# SHV Store — Design System & Architecture Specification (`DESIGN.md`)

Welcome to the official **Design System Specification** for the Spring Boot + React E-Commerce application. This document details the color palette, typography, UI components, layout standards, and dynamic configuration architecture.

---

## 🎨 1. Color System & Design Tokens

The application follows a curated, high-contrast, modern tech-store palette defined via CSS variables in `client/src/index.css`.

### Primary Palette

| CSS Variable | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| `--paper` | `#FFFFFF` | Primary page background |
| `--well` | `#F2F4F6` | Soft gray media wells and thumbnail containers |
| `--card` | `#FFFFFF` | Card surface color |
| `--ink` | `#1F4E63` | Deep dark teal — primary headings, main buttons, active pills |
| `--ink-deep` | `#17435A` | Hover state for primary buttons and dark elements |
| `--muted` | `#4A7086` | Secondary body text, descriptions, inactive labels |
| `--faint` | `#93A9B5` | Small caps metadata, eyebrow labels |
| `--line` | `#DCE7EC` | Borders, card outlines, subtle dividers |

### Accents & Status Colors

| CSS Variable | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| `--accent` | `#8D7BEA` | Soft purple — interactive link highlights, focus rings |
| `--accent-soft`| `#EEEAFC` | Message banners, toast notifications |
| `--ok` | `#2E9C90` | Store green/mint — in-stock status badges, success indicators |
| `--low` | `#C08A16` | Amber — low stock warnings |
| `--danger` | `#E4595C` | Red — out-of-stock badges, delete buttons, error alerts |

---

## 🔤 2. Typography

The design system uses a dual-font hierarchy imported via Google Fonts:

1. **Display Headings**: `Archivo Black` (`sans-serif`)
   - **Applied To**: Main section titles (`<h1>`, `<h2>`).
   - **Styling**: Uppercase, letter-spaced (`1px`), clean impact.
2. **Body & Controls**: `PT Sans` (`sans-serif`)
   - **Applied To**: Paragraphs, descriptions, buttons, forms, product titles.
   - **Styling**: Readable, warm, 1.65 line-height.

---

## 🧩 3. Key UI Components

### 🏷️ Price Tickets (`.price-ticket`)
- **Standard**: Rounded pill chip (`border-radius: 999px`), background `#EEF4F6`, border `#D5E3E8`, text `var(--ink)`.
- **Large**: `font-size: 1.3rem`, padding `5px 18px` (`.price-ticket-lg`).

### 🟢 Stock Badges (`.stock-badge`)
- Uppercase text with a 7px circular status dot.
- Colors: Green (`var(--ok)`), Amber (`var(--low)`), Red (`var(--danger)`).

### 🔘 Action Buttons
- **Primary Buttons** (`.btn-primary`, `.add-to-cart`, `submit`):
  - Background: `var(--ink)` (`#1F4E63`).
  - Text: White.
  - Hover: `var(--ink-deep)` (`#17435A`) with smooth `-2px` vertical lift.
- **Ghost Buttons** (`.btn-ghost`):
  - Transparent background, 2px solid `var(--ink)` border.

### 🎛️ Variant Option Pills (`.option-pill`)
- **Default State**: White background, `1.5px solid var(--line)`, text in `var(--ink)`.
- **Active State**: Solid `var(--ink)` (`#1F4E63`), crisp white text, soft elevation shadow (`0 4px 12px rgba(31, 78, 99, 0.25)`).
- **Color Swatches**: Render a 14px circular color swatch dot inside the pill for Color attributes.

---

## ⚙️ 4. Dynamic Product Configurations Architecture

The application supports fully custom, dynamic product configurations:

1. **No Hardcoded Attribute Names**:
   - Admins can type any custom key-value pairs (e.g. `Color: Desert Titanium`, `Case Size: 44mm`, `Memory: 256GB`, `Band: Ocean Band`).
2. **Direct Photo Uploads per Variant**:
   - Every configuration card includes direct file upload inputs (`<input type="file" multiple />`) with drag-and-drop photo reordering.
3. **Photo Set Reuse Dropdown**:
   - Admins can select *"Reuse Photos from Config #1"* to share image sets across multiple storage/RAM options without duplicate file uploads.
4. **Automatic Stock Aggregation**:
   - Total product inventory is automatically calculated as `SUM(variant.stockQuantity)`.

---

## 📐 5. Layout & Responsive Grid

- **Container Measure**: `max-width: 1120px; margin: 0 auto; padding: 32px 24px 64px;`
- **Product Details Layout**: 2-column grid (`5fr 4fr`) on desktop; collapses smoothly to single-column stack on mobile viewports (< 768px).
- **Product Grid**: Responsive CSS Grid (`repeat(auto-fill, minmax(240px, 1fr))`) with hover lift transitions.
