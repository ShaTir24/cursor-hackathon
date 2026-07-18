# EduReels Design System (Master)

## Brand
EduReels — personalized educational video for students and teachers.
**Accounts required:** Sign in or Create account (Supabase). No guest path in the primary product.

## Logo
Geometric reel + leaf monogram (`EduReelsLogo`) + wordmark “EduReels”.
- Favicon / app icon: `public/favicon.svg` + `app/icon.svg` (same mark)
- Entry (`/`): hero-level mark + wordmark
- Auth split panel: logo in form header + brand column (frozen)
- App chrome: compact mark; wordmark collapses with sidebar
- Home empty states + player chrome: mark-only logo

## Color
| Token | Hex |
|-------|-----|
| primary | #0B6E4F |
| primary-hover | #095c42 |
| background | #F7F4EF |
| surface | #FFFFFF |
| text | #1C1917 |
| muted | #57534E |
| border | #E7E5E4 |
| danger | #B91C1C |
| accent | #E8F5EF |

Light mode only for product surfaces. No purple/indigo. No OLED dark default.

## Typography
- Display: Fraunces (headings, brand)
- Body: Source Sans 3
- Icons: Lucide only (no emoji)

## Auth surfaces
- Split-panel `/login`: form (Sign in | Create account) + brand panel (`edu-mesh`) on `lg+`
- Fields: email, password (show/hide), confirm on signup
- Errors: friendly Supabase messages; labels always visible

## Dual persona (same palette, different chrome)
| Role | Header eyebrow | Primary CTA | Stage emphasis |
|------|----------------|-------------|----------------|
| Student | Learn | Generate learning reel | Topics + interests → watch |
| Teacher | Teach | Generate class demo | Subjects + grades → watch + lesson pack Sheet |

## Layout signature (craft chrome)
1. **Entry:** Brand-first full-bleed mesh — Sign in / Create account CTAs only
2. **Auth (frozen):** Split panel — do not edit login/signup function or `auth-form`
3. **App shell:** Sidebar workspace; Learn/Teach as first-class eyebrow; soft mesh inset
4. **Role → Onboarding Stepper → Home stage → Player:** classroom light-table; reel is the hero plane; lesson pack is a companion Sheet

**Page overrides:** `web/design-system/pages/{entry,shell,role,onboarding,home,player}.md`

**Signature:** Soft `edu-mesh` atmosphere + forest primary; product stage (generate / watch), not ops dashboard.

## Motion
GSAP 150–200ms `fromTo` entrances (never leave staggered cards at `autoAlpha: 0`). Respect `prefers-reduced-motion`.

## Anti-patterns
No purple/indigo gradients, no emoji icons, no guest UUID path, no Comic/Baloo fonts, no KPI dashboard chrome, no OLED dark default. Auth files stay byte-stable during craft chrome work.
