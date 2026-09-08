# bubbles-notifications-expo-example

Expo SDK 57 example app plus the local `@fishonfire/bubbles-expo` package workspace.

## Repository layout

- `bubbles-notifications-expo/`
  Local package source for the Expo config plugin, background task entrypoint, and provider/hook
  runtime.
- `src/`
  Example Expo Router app that consumes the local package.
- `index.ts`
  Imports `@fishonfire/bubbles-expo/register-task` before `expo-router/entry`.
- `app.json`
  Configures Firebase Messaging and the `@fishonfire/bubbles-expo` plugin.

## Run the example app

```bash
npm install
npx expo start
```

For real push-token registration and background notification behavior, use a native build:

- `npm run android`
- `npm run ios`

Important constraints:

- The example app uses a local backend at `http://10.0.2.2:4000` on Android emulators and
  `http://localhost:4000` elsewhere.
- Expo Go is not a valid environment for this notification integration.
- This repository currently includes `google-services.json` for Android only. iOS push-token
  validation is still incomplete until `GoogleService-Info.plist` and APNs/Firebase iOS setup are
  added.

## Package integration in this repo

The example app delegates notification orchestration to `@fishonfire/bubbles-expo`:

- `index.ts` performs the required early background-task import.
- `src/notifications/demo-provider.tsx` supplies demo `appId`, `userId`, aliasing, API base URL,
  and Firebase installation id to `BubblesNotificationsProvider`.
- `src/components/push-token-card.tsx` uses `useBubblesNotifications()` for package-owned device
  registration and status display.
- `src/app/_layout.tsx` keeps app-specific notification-tap navigation in the app layer.

## Work on the local package

```bash
cd bubbles-notifications-expo
npm install
npm test
npm run typecheck
npm run build
```

The root app depends on the local package through `file:./bubbles-notifications-expo`.
