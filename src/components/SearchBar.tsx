import { useState } from 'react';
import {
  Input,
  Button,
  InputGroup,
  InputRightElement,
  FormControl,
  FormHelperText,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(url.trim());
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      w="full"
      maxW="3xl"
      mx="auto"
    >
      <FormControl>
        <Box display="flex" flexDirection="column" gap={4}>
          <InputGroup size={{ base: "md", md: "lg" }}>
            <Input
              pr={{ base: "5rem", md: "7rem" }}
              placeholder="Paste Amazon URL or shortened link (amzn.to)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
              h={{ base: "48px", md: "60px" }}
            />
            <InputRightElement 
              width={{ base: "4.5rem", md: "6.5rem" }} 
              h={{ base: "48px", md: "60px" }}
            >
              <Button
                size={{ base: "sm", md: "lg" }}
                type="submit"
                isLoading={isLoading}
                colorScheme="blue"
                px={{ base: 3, md: 6 }}
                h={{ base: "32px", md: "40px" }}
                leftIcon={<Icon as={FiSearch} boxSize={{ base: 3, md: 4 }} />}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
                fontSize={{ base: "sm", md: "md" }}
              >
                Check
              </Button>
            </InputRightElement>
          </InputGroup>
          
          <FormHelperText
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.500"
            textAlign="center"
            px={2}
          >
            Works with full Amazon URLs, mobile links, and shortened links (amzn.to)
          </FormHelperText>
        </Box>
      </FormControl>
    </Box>
  );
};

export default SearchBar;
