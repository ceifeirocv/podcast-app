# Episode deep links

This document describes the minimal deep-linking configuration for episode details.

Pattern

podcastapp://episode/:feedId/:episodeId

Examples

- podcastapp://episode/12345/67890
- podcastapp://episode/abcde/ef012

Testing

- iOS Simulator:
  - Run the app on the simulator (dev client or standalone), then open the URL:
    xcrun simctl openurl booted "podcastapp://episode/FEEDID/EPISODEID"

- Android Emulator:
  - Run the app on the emulator (dev client or standalone), then open the URL:
    adb shell am start -W -a android.intent.action.VIEW -d "podcastapp://episode/FEEDID/EPISODEID"

- Expo dev client / dev builds:
  - Use `npx uri-scheme` (install globally or with npx):
    npx uri-scheme open "podcastapp://episode/FEEDID/EPISODEID" --android
    npx uri-scheme open "podcastapp://episode/FEEDID/EPISODEID" --ios

Notes

- Expo Go does not support custom schemes; use a dev client or standalone build to test custom URL schemes.
- The app scheme is set in `app.json` as `"scheme": "podcastapp"`.
- App routes should map the incoming URL to the episode details route (for example: `/episode/[feedId]/[episodeId]`).

Unit tests

This repository currently does not include a test runner or testing libraries in package.json. To add a basic render test for the Episode Details screen, follow these steps:

1) Install dev dependencies (example):

   pnpm add -D jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer @types/jest

2) Add a Jest configuration. In package.json or a separate jest.config.cjs add:

   module.exports = {
     preset: 'jest-expo',
     setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
     transformIgnorePatterns: [
       'node_modules/(?!(react-native|@react-native|@react-navigation)/)'
     ]
   };

3) Create a test setup file (e.g. jest-setup.ts) and import the jest-native matchers:

   // jest-setup.ts
   import '@testing-library/jest-native/extend-expect';

   Then reference this file from `setupFilesAfterEnv` in the Jest config if needed.

4) Example test to add at src/__tests__/EpisodeDetails.test.tsx (adjust imports to match your component path):

   import React from 'react';
   import { render } from '@testing-library/react-native';
   import usePodcast from '@/hooks/usePodcast';
   // Replace with the actual import path to your episode details screen/component
   import EpisodeDetails from '@/app/episode/[feedId]/[episodeId]';

   jest.mock('@/hooks/usePodcast');

   test('renders episode title and show notes placeholder', () => {
     (usePodcast as jest.Mock).mockReturnValue({
       data: {
         podcast: { title: 'Test Podcast' },
         episodes: [{ id: 'e1', title: 'Test Episode', content: 'Show notes here' }]
       },
       isLoading: false,
     });

     const { getByText } = render(<EpisodeDetails />);
     expect(getByText('Test Episode')).toBeTruthy();
     expect(getByText('Show notes here')).toBeTruthy();
   });

Notes and tips

- The example assumes the EpisodeDetails screen exists at src/app/episode/[feedId]/[episodeId].tsx. If your route or component is located elsewhere, import that component directly in the test.
- Expo apps include native modules; jest-expo helps mock the native runtime. You may need additional mocks for navigation, Reanimated, or other native libraries used by the screen.
- After installing the dev dependencies and adding the Jest config, run tests with:

   pnpm test

If you want, I can add the example test file and configure Jest in this repository. Since this repo currently lacks test dependencies and scripts, this document only provides instructions to get started.
