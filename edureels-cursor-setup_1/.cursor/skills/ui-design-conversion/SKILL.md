---
name: ui-design-conversion
description: Convert a Replit/React web prototype into a React Native (web-first) component breakdown and design tokens. Use in Stage 2 when a prototype is provided or a new screen is being designed. Skip for backend-only features or reused screens.
---

# UI Design Conversion (Stage 2)

## Input → Output
Input: pasted prototype code (React/HTML/Tailwind) or a screen description.
Output: a short design doc appended to the feature spec under `## Design`, containing:
- Component tree (RN primitives: View/Text/Pressable/FlatList — never div/span)
- NativeWind class mapping for the prototype's Tailwind styles
- Navigation placement in expo-router file tree
- testID list matching the Playwright flow

## Conversion rules
- `div`→`View`, `span/p/h*`→`Text` (ALL text must be inside `<Text>` — RN crashes otherwise),
  `button`→`Pressable`, `input`→`TextInput`, `img`→`Image`, lists→`FlatList`.
- CSS not supported by RN (grid, hover, fixed positioning) → nearest flexbox equivalent;
  note the compromise, don't silently drop layout intent.
- Web-only interactions (hover states, right-click) → press/long-press equivalents.
- Multi-select catalogues render as chip grids (`FlatList` numColumns) with selected-state
  styling — never dropdowns or free text.
- Analytics widgets: prefer simple owned components (progress bars, stat cards) over
  chart libraries; if a chart is essential use victory-native (works on web), nothing else.

## Design tokens (use everywhere, define once in tailwind.config)
- Spacing scale 4/8/12/16/24; radius `rounded-2xl` cards, `rounded-full` chips.
- One primary color + neutral grays; dark text on light bg (projector-friendly for judges).
- Minimum touch target 44px.

## Skip conditions
Skip this skill when: backend-only feature; screen already exists and is only
receiving new data; copy-only change.
