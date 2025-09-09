import { useState, useEffect } from 'react';
import {
  Button,
  useToast,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FiDownload, FiSmartphone } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      toast({
        title: 'Success!',
        description: 'App installed successfully! You can now access it from your home screen.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS or other browsers
      toast({
        title: 'Add to Home Screen',
        description: 'Tap the share button in your browser and select "Add to Home Screen"',
        status: 'info',
        duration: 8000,
        isClosable: true,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        toast({
          title: 'Installing...',
          description: 'App is being installed to your device.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing app:', error);
      toast({
        title: 'Installation Error',
        description: 'Unable to install app. Try adding to home screen manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show for iOS users even without prompt support
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Always show the button for now (for testing and manual install)
  // if (!showInstallButton && !isIOS) {
  //   return null;
  // }

  return (
    <Box>
      <Button
        leftIcon={<Icon as={isIOS ? FiSmartphone : FiDownload} />}
        colorScheme="purple"
        variant="outline"
        size={{ base: "md", md: "lg" }}
        onClick={handleInstallClick}
        width="full"
        borderWidth="2px"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        }}
        transition="all 0.2s"
      >
        {isIOS ? '📱 Add to Home Screen' : '📦 Download App'}
      </Button>
    </Box>
  );
};

export default InstallButton;
