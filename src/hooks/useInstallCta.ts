import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../utils/analytics';

type CtaType = 'IOS_A2HS' | 'ANDROID_PWA' | 'DESKTOP_BOOKMARK' | 'NONE';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallCta() {
  const [ctaType, setCtaType] = useState<CtaType>('DESKTOP_BOOKMARK');
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Platform detection
  const { isIOS, isSafari, isStandalone, isDesktop } = useMemo(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator?.standalone === true);
    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return { isIOS, isSafari, isStandalone, isDesktop };
  }, []);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      setCtaType('NONE');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      // If Android Chrome, prefer PWA install
      setCtaType('ANDROID_PWA');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial CTA decision if no beforeinstallprompt yet
    if (isIOS && isSafari) {
      setCtaType('IOS_A2HS');
    } else if (isDesktop) {
      setCtaType('DESKTOP_BOOKMARK');
    }

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCtaType('NONE');
      deferredPromptRef.current = null;
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Desktop: Track Cmd/Ctrl + D bookmark shortcut
    const handleKeydown = (e: KeyboardEvent) => {
      const ua = navigator.userAgent || '';
      const isMac = /Macintosh|Mac OS X/i.test(ua);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const keyIsD = (e.key && e.key.toLowerCase() === 'd') || e.code === 'KeyD';
      if (cmdOrCtrl && keyIsD && !e.altKey) {
        trackEvent('cta_click_desktop_bookmark');
      }
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isIOS, isSafari, isStandalone, isDesktop]);

  const promptInstall = useCallback(async () => {
    const dp = deferredPromptRef.current;
    if (!dp) return;
    await dp.prompt();
    await dp.userChoice;
    deferredPromptRef.current = null;
  }, []);

  return {
    ctaType,
    promptInstall: ctaType === 'ANDROID_PWA' ? promptInstall : undefined,
    isInstalled
  } as const;
}


