# Trending Cards Accessibility QA Plan

Summary
---
This document defines the accessibility checklist, manual test steps (iOS VoiceOver and Android TalkBack), device matrix, automation suggestions, manual test cases, and acceptance criteria for the Trending Cards UI component.

1. Accessibility checklist
---
- Screen reader labels
  - Each card must be a single accessible element with an explicit accessibilityLabel describing: "Podcast title by author — short description/metadata" (e.g., "The Daily by The New York Times, 3 episodes today").
  - Actions (play, add to queue, download) must expose accessibilityRole ("button") and accessibilityLabel ("Play episode: <title>") and accessibilityHint where helpful.
  - Decorative images must set accessibilityIgnoresInvertColors (if needed) and accessibilityLabel to empty string or accessible={false}.
- Touch target sizes
  - Interactive targets (entire card and inline action buttons) must be at least 44x44 points (Apple) / 48x48 dp (Android). Use padding or hitSlop to meet this.
- Color contrast
  - Text and icons must meet WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text. Check stateful contrasts (disabled, selected, focus).
- Dynamic type / font scaling
  - Support system font scaling. Verify layout adapts without clipping or overlap at Large/Accessibility font sizes.
- Keyboard & focus navigation
  - Cards and action buttons must be focusable (accessible focusable) and navigable by keyboard, external keyboard, and D-pad/TV remotes where applicable.
  - Provide visible focus ring/highlight state for keyboard focus.
- Focus order & semantics
  - Ensure semantic reading order matches visual order. Group related elements so screen reader users perceive the card as a meaningful unit.
- Live regions & announcements
  - When content changes (e.g., download completed), send an accessibility announcement (AccessibilityInfo.announceForAccessibility) or use live region semantics.

2. Test steps
---
A. iOS (VoiceOver)
- Setup
  - Settings → Accessibility → VoiceOver → turn ON.
- Navigation
  1. With VoiceOver on, swipe right/left to move through elements on the Trending screen.
  2. Verify each card is announced as a single element with useful text (title, author, short metadata) and ends with action hint (e.g., "double-tap to open").
  3. Explore actions: use two-finger scrub or rotor to find actionable controls. Activate card (double-tap); verify it opens correct detail.
  4. Focus on inline buttons (Play/Download). VoiceOver must announce role (button) and label.
- Dynamic checks
  - Increase Dynamic Type to Large/Accessibility sizes: re-run navigation verifying no truncation and logical reading order.
  - Trigger a download and verify that completion is announced.

B. Android (TalkBack)
- Setup
  - Settings → Accessibility → TalkBack → turn ON.
- Navigation
  1. Use swipe right/left to move between elements. Verify each card and its role/descriptions are read correctly.
  2. Long-press or explore by touch to interact with inline actions; verify contentDescription and role are correct.
  3. Activate card (double-tap) and confirm navigation.
- Dynamic checks
  - Change font size (Display → Font size / Accessibility → Font size) and verify layout and readability.
  - Trigger download flow and ensure TalkBack announces status changes.

3. Device matrix and variants to test
---
- iOS
  - iPhone SE (small screen) — Portrait + Landscape
  - iPhone 13/14/15 (standard) — Portrait + Landscape
  - iPad (mini / Air) — Portrait + Landscape
  - OS versions: iOS 15, iOS 16, iOS 17+ (or current supported min)
- Android
  - Small phone (e.g. Pixel 4a) — Portrait + Landscape
  - Large phone (e.g. Pixel 6/7 / Samsung) — Portrait + Landscape
  - Tablet (8" + 10") — Portrait + Landscape
  - OS versions: Android 11, Android 12, Android 13+
- Variants
  - Dark mode and Light mode
  - High contrast mode (Android) / Increase Contrast (iOS) where available
  - Font scaling at multiple steps: Default / Large / Accessibility Largest
  - RTL (right-to-left) language testing

4. Automation suggestions
---
- Unit and snapshot tests
  - Ensure components render accessibility props: assert presence of accessibilityLabel, accessibilityRole, and accessible flags in unit tests.
- Static analysis
  - Use an accessibility lint rule (ESLint plugin for React Native accessibility) to flag missing accessibility props.
- Accessibility scanning
  - For web (expo web): integrate axe-core / jest-axe to scan the Trending page DOM for common violations.
  - For React Native: use tools like react-native-accessibility-engine or axe for Android via WebDriver/Playwright where possible.
- E2E flows
  - Detox / Appium / Playwright Mobile: write E2E tests that enable TalkBack/VoiceOver (or simulate) and assert accessibility labels and activation paths. Example flow:
    1. Launch app → navigate to Trending
    2. Query for card element by accessibilityLabel → assert it exists
    3. Press action button via accessibility id → assert navigation or playback state
- CI Integration
  - Fail PR builds when accessibility lint rules or automated scans find high-severity violations.

5. Manual test cases
---
- TC-01: Card screen reader label
  - Steps: Open Trending, enable VoiceOver/TalkBack, navigate to first card
  - Expected: Card read as "<Title> by <Author>, <meta>. Double-tap to open."
- TC-02: Tap targets
  - Steps: Inspect Play and Download buttons on multiple devices with grid overlay or inspector
  - Expected: Both buttons have at least 44x44pt / 48x48dp clickable area
- TC-03: Contrast
  - Steps: Use colour contrast analyzer or browser dev tools (web) to measure ratios
  - Expected: Normal text >= 4.5:1, large text >= 3:1
- TC-04: Dynamic type
  - Steps: Set largest system font size and verify card remains readable and actions accessible
  - Expected: No clipping, all labels read fully
- TC-05: Keyboard navigation
  - Steps: Attach external keyboard, use Tab/Shift+Tab to focus cards and buttons
  - Expected: Focus order logical, visible focus indicator, Enter/Space activates

6. Acceptance criteria & pass/fail markers
---
- Pass if ALL of the following are true:
  - Every interactive card exposes a non-empty accessibilityLabel and accessibilityRole.
  - All action buttons expose accessibilityLabel and are reachable via accessibility focus.
  - Touch targets meet minimum size requirements on all tested devices.
  - Text contrast meets WCAG AA thresholds for normal and large text in both themes.
  - UI remains usable and readable at the highest system font scaling setting.
  - Keyboard navigation order is logical and complete; focus states visible.
  - Dynamic updates (download complete, queue changes) are announced.

- Fail if ANY of the following occur:
  - Missing or generic labels (e.g., "button") on actionable controls.
  - Touch targets smaller than required on any primary device class.
  - Contrast failures on primary brand text or interactive labels.
  - Layout breaks (overlap/clipping) at large font sizes.

- Severity & markers
  - Critical (blocker): Missing labels preventing navigation/activation; these must be fixed before release.
  - Major: Contrast below required thresholds or unusable layout at large fonts.
  - Minor: Hints, small visual focus styling, or non-critical wording improvements.

Appendix: Notes for devs
---
- Recommended props (React Native / Expo):
  - Card container: accessible={true}, accessibilityRole="button", accessibilityLabel={`${title} by ${author}. ${shortMeta}`}, accessibilityHint="Opens podcast details"
  - Inline actions: accessibilityRole="button", accessibilityLabel="Play episode: <title>"
  - Use hitSlop to expand touch area without changing visual layout.
- Use AccessibilityInfo.announceForAccessibility on status changes.



