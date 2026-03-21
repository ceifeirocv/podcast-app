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
