import { registerBubblesBackgroundHandlers } from '@fishonfire/bubbles-expo';
import 'expo-router/entry';

// Should register background handlers before any other code runs
// so that the app can handle notifications when it is in the background or terminated.
registerBubblesBackgroundHandlers();
