---
name: UIS
description: University Interface System - A trusted marketplace for students and executors
colors:
  primary: "#6366F1"
  secondary: "#A855F7"
  accent: "#EC4899"
  background: "#F8FAFC"
  surface: "#FFFFFF"
  text: "#1E293B"
  textSecondary: "#64748B"
  border: "#E2E8F0"
  error: "#EF4444"
  success: "#10B981"
  warning: "#F59E0B"
  info: "#3B82F6"
typography:
  display:
    fontFamily: "System"
    fontSize: "32px"
    fontWeight: "bold"
  headline:
    fontFamily: "System"
    fontSize: "24px"
    fontWeight: "600"
  title:
    fontFamily: "System"
    fontSize: "20px"
    fontWeight: "600"
  body:
    fontFamily: "System"
    fontSize: "16px"
    fontWeight: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
---

# Design System: UIS

## 1. Overview

**Creative North Star: "The Trusted Marketplace"**

This system represents a professional, safe, trusted, and flexible environment connecting students with service executors. The aesthetic philosophy is rooted in efficiency and clear affordances. It feels like a serious tool for getting tasks done rather than a casual social space. We explicitly reject looking like a cluttered, untrustworthy, or overly complex generic freelance platform, and we avoid looking like a social media app. 

**Key Characteristics:**
- **Tactile and Confident:** Components have clear boundaries and obvious interactive areas.
- **Trust through transparency:** Clear order statuses, upfront pricing, and accessible support.
- **Professional execution:** Serious, utilitarian, and focused on the job to be done.

## 2. Colors

The palette is anchored by professional blues and purples, providing a stable foundation with distinct actions.

### Primary
- **Trust Indigo** (#6366F1): The primary brand color, used for main navigation, primary actions, and establishing a professional atmosphere.

### Secondary
- **Creative Purple** (#A855F7): Used for secondary actions, highlighting executor profiles, or distinct features within the marketplace.

### Tertiary
- **Action Pink** (#EC4899): Used sparingly as an accent for notifications, badges, or special calls to action.

### Neutral
- **Slate Background** (#F8FAFC): The main app background, providing a low-contrast canvas that lets content breathe.
- **Dark Slate Text** (#1E293B): High-contrast primary text for readability.
- **Medium Slate Text** (#64748B): Secondary text for timestamps, subtitles, and less critical information.
- **Light Slate Border** (#E2E8F0): Dividers and component boundaries.

**The Semantic Meaning Rule.** Colors like error (#EF4444) and success (#10B981) are strictly reserved for system feedback and order statuses. Never use them decoratively.

## 3. Typography

**Display Font:** System native (San Francisco on iOS, Roboto on Android)
**Body Font:** System native

**Character:** Utilitarian, readable, and highly optimized for mobile screens. We rely on the platform's native typography to ensure maximum accessibility and familiarity.

### Hierarchy
- **Display** (bold, 32px): Hero sections or major empty state announcements.
- **Headline** (600, 24px): Screen titles and major section headers.
- **Title** (600, 20px): Card titles and modal headers.
- **Body** (normal, 16px): Primary content, descriptions, and chat messages.
- **Label** (normal, 14px): Small UI elements, metadata, and timestamps.

**The Native Legibility Rule.** Stick to system fonts. Avoid custom display fonts that might compromise readability in a dense, task-oriented app.

## 4. Elevation

The system is relatively flat but uses tactile layering to separate content from the canvas. 

### Shadow Vocabulary
- **Card Lift** (`box-shadow: 0 2px 8px rgba(30, 41, 59, 0.08)`): Used for service cards and order summaries to lift them off the Slate Background.
- **Action Lift** (`box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2)`): Used on primary Trust Indigo buttons to make them feel pressable.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to interactive elements or to lift distinct modular content (like cards) off the background.

## 5. Components

Components are tactile and confident, with clear boundaries to ensure clear affordances.

### Buttons
- **Shape:** Gently rounded edges (8px radius)
- **Primary:** Trust Indigo background (#6366F1) with white text, generous touch targets (min 44px height).
- **Secondary:** Transparent background with Trust Indigo text and a Light Slate Border.

### Cards / Containers
- **Corner Style:** Rounded (12px radius)
- **Background:** Solid Surface White (#FFFFFF)
- **Shadow Strategy:** Card Lift for subtle depth.
- **Internal Padding:** 16px to 24px depending on content density.

### Inputs / Fields
- **Style:** Light Slate Border (#E2E8F0), 8px radius, Slate Background (#F8FAFC) when inactive.
- **Focus:** Border shifts to Trust Indigo (#6366F1).
- **Error:** Border shifts to Error Red (#EF4444).

## 6. Do's and Don'ts

### Do:
- **Do** ensure clear affordances so users always know their next possible action (e.g., waiting for executor, action required).
- **Do** maintain a professional execution feel; the interface must feel like a serious tool for getting things done.
- **Do** use Trust Indigo (#6366F1) for primary, trust-building actions.
- **Do** ensure touch targets are at least 44x44pt for mobile accessibility.

### Don't:
- **Don't** make the app look like a cluttered, untrustworthy, or overly complex generic freelance platform.
- **Don't** design it to look like a social media app. It is a marketplace.
- **Don't** use dark patterns or confusing navigation.
- **Don't** use side-stripe borders (border-left/right > 1px) as colored accents on cards.