import { Box, Button, Icon, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react';
import { FiDownload, FiSmartphone, FiBookmark } from 'react-icons/fi';
import { useInstallCta } from '../hooks/useInstallCta';
import { trackEvent } from '../utils/analytics';

const IOSGuide = () => {
  return (
    <Box fontSize="sm" color="gray.700" lineHeight="tall">
      <Text mb={2}>Add to Home Screen:</Text>
      <Text>1. Tap the Share icon (square with arrow) in Safari.</Text>
      <Text>2. Scroll and tap "Add to Home Screen".</Text>
      <Text>3. Tap Add.</Text>
    </Box>
  );
};

export default function InstallCta() {
  const { ctaType, promptInstall } = useInstallCta();
  const iosModal = useDisclosure();

  if (ctaType === 'NONE') return null;

  if (ctaType === 'ANDROID_PWA') {
    return (
      <Button
        leftIcon={<Icon as={FiDownload} />}
        colorScheme="purple"
        variant="solid"
        size={{ base: 'md', md: 'lg' }}
        onClick={() => {
          trackEvent('cta_click_android_pwa');
          promptInstall?.();
        }}
      >
        Install App
      </Button>
    );
  }

  if (ctaType === 'IOS_A2HS') {
    return (
      <>
        <Button
          leftIcon={<Icon as={FiSmartphone} />}
          colorScheme="purple"
          variant="outline"
          size={{ base: 'md', md: 'lg' }}
          onClick={() => {
            trackEvent('cta_click_ios_a2hs');
            iosModal.onOpen();
          }}
        >
          Add to Home Screen
        </Button>
        <Modal isOpen={iosModal.isOpen} onClose={iosModal.onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Install on iOS</ModalHeader>
            <ModalBody>
              <IOSGuide />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  if (ctaType === 'DESKTOP_BOOKMARK') {
    return (
      <Button
        leftIcon={<Icon as={FiBookmark} />}
        colorScheme="purple"
        variant="outline"
        size={{ base: 'md', md: 'lg' }}
        onClick={() => {
          trackEvent('cta_click_desktop_bookmark');
          // Show keyboard tip via alert; could swap to toast if desired
          alert('Tip: Press Cmd/Ctrl + D to bookmark this page.');
        }}
      >
        Bookmark this tool (Cmd/Ctrl + D)
      </Button>
    );
  }

  return null;
}


