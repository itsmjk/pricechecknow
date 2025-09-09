import { useState } from 'react';
import {
  Box,
  Input,
  Button,
  Text,
  useToast,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMail } from 'react-icons/fi';

const EmailCapture = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Try to connect to CSV backend, fallback to local storage if not available
      try {
        const response = await fetch('http://localhost:3003/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to subscribe');
        }
        
        toast({
          title: 'Success!',
          description: 'Successfully subscribed! We\'ll keep you updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (networkError) {
        // Fallback: Save to localStorage if backend is not running
        const existingEmails = JSON.parse(localStorage.getItem('subscribers') || '[]');
        
        if (existingEmails.includes(email)) {
          throw new Error('Email already subscribed!');
        }
        
        existingEmails.push(email);
        localStorage.setItem('subscribers', JSON.stringify(existingEmails));
        
        console.log('Email saved locally:', email);
        console.log('All emails:', existingEmails);
        
        toast({
          title: 'Success!',
          description: 'Successfully subscribed! We\'ll keep you updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit}
      maxW="3xl"
      mx="auto"
      mt={{ base: 8, md: 12 }}
      p={{ base: 4, sm: 6, md: 8 }}
      borderRadius="2xl"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      w="full"
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={{ base: 4, md: 6 }}>
        <Icon as={FiMail} boxSize={{ base: 6, md: 8 }} color="blue.500" />
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Text 
            fontSize={{ base: "lg", md: "xl" }} 
            fontWeight="bold"
            textAlign="center"
          >
            Stay Updated
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            textAlign="center" 
            color="gray.500"
            px={2}
          >
            Want to know when we roll out new features?
          </Text>
        </Box>
        
        <Box w="full" maxW="md">
          <Input
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            size={{ base: "md", md: "lg" }}
            fontSize={{ base: "sm", md: "md" }}
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="2px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
            _hover={{
              borderColor: 'blue.400',
            }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: 'outline',
            }}
            mb={4}
            h={{ base: "44px", md: "48px" }}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            width="full"
            size={{ base: "md", md: "lg" }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
            h={{ base: "44px", md: "48px" }}
          >
            Subscribe
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EmailCapture;
