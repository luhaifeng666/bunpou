export type RuntimeKind = 'web-site' | 'desktop-app' | 'mobile-app';

export type FeatureKey = 'audio-entry' | 'deepseek-entry' | 'visitors-entry';

type Visibility = 'visible' | 'hidden';

const entryPolicy: Record<FeatureKey, Record<RuntimeKind, Visibility>> = {
  'audio-entry': {
    'web-site': 'visible',
    'desktop-app': 'visible',
    'mobile-app': 'hidden',
  },
  'deepseek-entry': {
    'web-site': 'visible',
    'desktop-app': 'visible',
    'mobile-app': 'hidden',
  },
  'visitors-entry': {
    'web-site': 'visible',
    'desktop-app': 'hidden',
    'mobile-app': 'hidden',
  },
};

const hasWindow = () => typeof window !== 'undefined';

const isDesktopApp = () => hasWindow() && '__TAURI_IPC__' in window;

const isMobileShell = () => {
  if (!hasWindow()) {
    return false;
  }

  const runtimeFlag = (
    window as typeof window & { __BUNPOU_RUNTIME__?: string }
  ).__BUNPOU_RUNTIME__;
  if (runtimeFlag === 'mobile-app') {
    return true;
  }

  const mobileAppFlag = (
    window as typeof window & { __BUNPOU_MOBILE_APP__?: boolean }
  ).__BUNPOU_MOBILE_APP__;
  if (mobileAppFlag === true) {
    return true;
  }

  const capacitor = (
    window as typeof window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    }
  ).Capacitor;

  if (capacitor?.isNativePlatform?.()) {
    return true;
  }

  return false;
};

export const getRuntimeKind = (): RuntimeKind => {
  if (isDesktopApp()) {
    return 'desktop-app';
  }

  if (isMobileShell()) {
    return 'mobile-app';
  }

  return 'web-site';
};

export const isEntryVisible = (
  feature: FeatureKey,
  runtime = getRuntimeKind(),
) => entryPolicy[feature][runtime] === 'visible';

export const getEntryPolicy = () => entryPolicy;
