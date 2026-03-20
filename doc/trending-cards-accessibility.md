Trending Cards Accessibility Guidelines

Purpose
- Document accessibility requirements and implementation guidance for the "Trending" cards UI component used across the app.

Scope
- Applies to components rendering podcast cards in trending lists (e.g., src/components/TrendingCard.tsx and route screens under src/app/). Covers screen reader, keyboard, focus, touch, and visual contrast.

Goals
- Ensure each card is perceivable, operable, understandable, and robust.
- Provide concrete RN/Expo patterns (accessibilityLabel, accessibilityRole, accessibilityHint, accessibilityState, accessibilityActions).

Component responsibilities
- Expose a clear accessible name: combine podcast title and artist/episode count in accessibilityLabel.
- Use accessibilityRole="button" (if card triggers navigation/play) or "image"+"text" when purely decorative.
- Provide accessibilityHint for the primary action (e.g., "Opens podcast details").
- Announce download/state changes using accessibilityLiveRegion (where supported) or via accessibility announcements.

Keyboard & focus
- Ensure the card is focusable (use accessible={true} and importantForAccessibility if needed).
- Focus order should follow visual order. When opening a modal or navigating, move focus to the new context.
- Support accessibilityActions for complex items (e.g., "Play", "Download" on long-press) and handle onAccessibilityAction.

Screen reader behavior
- Keep labels brief but informative: "{title} by {author}, {episodeCount} episodes. Double tap to open." as accessibilityLabel if space allows.
- Use accessibilityState={{ selected: true }} for highlighted items.
- For status updates (download started/completed), call AccessibilityInfo.announceForAccessibility("Download complete for {title}") from JS.

Touch target & visual
- Minimum touch target: 44x44dp for interactive elements within the card.
- Ensure foreground/background contrast meets WCAG AA (4.5:1 for normal text). Use color tokens in src/constants/ or @assets when available.

Implementation examples (React Native / Expo)

// Example (JSX)
// <Pressable
//   accessible
//   accessibilityRole="button"
//   accessibilityLabel={`${title} by ${author}, ${episodeCount} episodes`}
//   accessibilityHint="Opens podcast details"
//   onPress={() => router.push(`/podcast/${feedId}`)}
// >
//   ...visual content...
// </Pressable>

Testing checklist
- [ ] Card exposes accessible name and role
- [ ] Focusable via keyboard/assistive tech
- [ ] Touch targets meet size requirements
- [ ] Color contrast passes WCAG AA
- [ ] Live announcements for dynamic state changes
- [ ] Screen reader navigation reads title and hint in expected order

Files to inspect/update
- src/components/TrendingCard.tsx (or equivalent)
- src/app/podcasts.tsx and src/app/index.tsx (where trending lists render)

Next steps / TODOs
1. Review existing TrendingCard implementation and apply the patterns above.
2. Add accessibility unit/testing notes in doc/ and update PR checklist.
3. Implement onAccessibilityAction handlers for secondary actions like Play/Download.

References
- React Native Accessibility docs: https://reactnative.dev/docs/accessibility
- WCAG 2.1 guidelines: https://www.w3.org/TR/WCAG21/

Created-by: Copilot CLI
