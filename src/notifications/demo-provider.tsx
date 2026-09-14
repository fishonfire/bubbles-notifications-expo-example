import {
  BubblesNotificationsProvider,
  type BubblesNotificationResponseEvent,
} from '@fishonfire/bubbles-expo';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

const PENDING_APP_ID = '__bubbles_demo_app_id_pending__';
const PENDING_APP_KEY = '__bubbles_demo_app_key_pending__';
const CUSTOM_API_URL = undefined;
const DEVICE_CONFIG_DEBOUNCE_MS = 250;

interface DemoNotificationsContextValue {
  appIdInput: string;
  setAppIdInput: (value: string) => void;
  appKeyInput: string;
  setAppKeyInput: (value: string) => void;
  userIdInput: string;
  setUserIdInput: (value: string) => void;
  aliasingInput: string;
  setAliasingInput: (value: string) => void;
  apiBaseUrl: string;
}

interface DemoNotificationsProviderProps {
  children: ReactNode;
  onNotificationResponse?: (
    event: BubblesNotificationResponseEvent,
  ) => void;
}

const DemoNotificationsContext =
  createContext<DemoNotificationsContextValue | null>(null);

function fail(message: string): never {
  throw new Error(`[@/notifications/demo-provider] ${message}`);
}

function parseAliasingInput(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function resolveApiBaseUrl(): string {
  if (CUSTOM_API_URL) {
    return CUSTOM_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

export function DemoNotificationsProvider(
  props: DemoNotificationsProviderProps,
) {
  const { children, onNotificationResponse } = props;
  const [appIdInput, setAppIdInput] = useState('');
  const [appKeyInput, setAppKeyInput] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [aliasingInput, setAliasingInput] = useState('');
  const [debouncedDeviceConfig, setDebouncedDeviceConfig] = useState({
    appIdInput: '',
    appKeyInput: '',
    userIdInput: '',
    aliasingInput: '',
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedDeviceConfig({
        appIdInput,
        appKeyInput,
        userIdInput,
        aliasingInput,
      });
    }, DEVICE_CONFIG_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [aliasingInput, appIdInput, appKeyInput, userIdInput]);

  const normalizedAppId = debouncedDeviceConfig.appIdInput.trim();
  const normalizedAppKey = debouncedDeviceConfig.appKeyInput.trim();
  const normalizedUserId = debouncedDeviceConfig.userIdInput.trim();
  const aliasing = parseAliasingInput(debouncedDeviceConfig.aliasingInput);
  const apiBaseUrl = resolveApiBaseUrl();
  const ready =
    normalizedAppId.length > 0 &&
    normalizedAppKey.length > 0 &&
    normalizedUserId.length > 0;

  return (
    <DemoNotificationsContext.Provider
      value={{
        appIdInput,
        setAppIdInput,
        appKeyInput,
        setAppKeyInput,
        userIdInput,
        setUserIdInput,
        aliasingInput,
        setAliasingInput,
        apiBaseUrl,
      }}>
      <BubblesNotificationsProvider
        appId={normalizedAppId || PENDING_APP_ID}
        appKey={normalizedAppKey || PENDING_APP_KEY}
        apiBaseUrl={apiBaseUrl}
        ready={ready}
        userId={normalizedUserId || null}
        aliasing={aliasing}
        onNotificationResponse={onNotificationResponse}>
        {children}
      </BubblesNotificationsProvider>
    </DemoNotificationsContext.Provider>
  );
}

export function useDemoNotificationsConfig() {
  const context = useContext(DemoNotificationsContext);

  if (context === null) {
    fail(
      '"useDemoNotificationsConfig()" must be used inside "DemoNotificationsProvider".',
    );
  }

  return context;
}
