# Trending Cards Accessibility

This document is the single source of truth for the trending cards accessibility guidance in the current repo.

## Current implementation

- Screen: `src\app\(tabs)\home\index.tsx`
- Card component: `src\components\trending-card.tsx`
- Data is rendered in a `FlatList` of `TrendingCard` items on the Home tab.
- There is no `src\components\TrendingCard.tsx`.
- There is no `src\app\podcasts.tsx`.

## What exists today

`src\components\trending-card.tsx` currently does the following:

- wraps the card in a `Pressable`
- sets `accessible={true}`
- sets `accessibilityRole="button"`
- sets an explicit `accessibilityLabel` in the format:
  - `"{title} by {author}. Trend score: {trendScore}"`
- sets `accessibilityHint="Opens podcast details"`
- uses `hitSlop` to expand the touch target
- enables font scaling on title and metadata text
- uses `accessibilityIgnoresInvertColors` on the artwork image

`src\app\(tabs)\home\index.tsx` currently does the following:

- renders the trending cards in a 2-column or 3-column responsive grid
- exposes the retry action as a button with `accessibilityRole="button"`
- provides loading, error, and empty states

## Current gap to watch

On the Home screen, `TrendingCard` is rendered without an `onPress` handler right now. That means the card is announced like a button and says it opens podcast details, but the screen does not currently wire up that action.

Treat this as the key accessibility follow-up:

- if the card should navigate, keep the button role and hint, and wire `onPress`
- if the card is not interactive yet, remove the button semantics and action hint until navigation exists

## Practical review checklist

Use this checklist when touching either file above.

### Screen reader semantics

- Each card should be announced once, not as disconnected artwork/title/meta fragments.
- The card label should include the podcast title and author.
- The label should only include trend score if it is useful to the user.
- Hints must match real behavior on the current screen.

### Touch targets

- The card must meet the platform minimum target size:
  - iOS: 44x44 pt
  - Android: 48x48 dp
- Keep `hitSlop` or equivalent spacing if the visual layout shrinks.

### Dynamic type

- Title and metadata must remain readable with larger system font sizes.
- Card content must not overlap or clip when font scaling is increased.

### Focus and navigation

- Focus order should follow the visual grid order.
- The retry button in the error state must remain reachable and clearly announced.
- If card interaction is added later, keyboard and assistive-tech activation should trigger the same behavior as touch.

### Visual accessibility

- Text should continue to meet WCAG AA contrast against the card background.
- Artwork should stay decorative unless it conveys information not already present in the card label.

## Manual QA

### VoiceOver / TalkBack

1. Open the Home tab.
2. Move through the loading, error, empty, and populated states.
3. In the populated state, verify each trending card is announced with a useful label.
4. Confirm the retry button is announced as a button in the error state.
5. If cards remain non-interactive, confirm the docs and implementation do not claim they open details.

### Font scaling

1. Increase system font size to a large accessibility setting.
2. Re-open the Home tab.
3. Verify the title and metadata still fit within the card without clipping or overlap.

## When updating the implementation

- Update this document if the card becomes interactive, gains secondary actions, or changes its accessible label strategy.
- Keep references aligned to:
  - `src\components\trending-card.tsx`
  - `src\app\(tabs)\home\index.tsx`

## References

- React Native accessibility docs: https://reactnative.dev/docs/accessibility
- WCAG 2.1: https://www.w3.org/TR/WCAG21/
