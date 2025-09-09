import { useState } from 'react'
import { ChakraProvider, Text, useToast, Box, extendTheme } from '@chakra-ui/react'
import SearchBar from './components/SearchBar'
import ResultCard from './components/ResultCard'
import EmailCapture from './components/EmailCapture'
import InstallCta from './components/InstallCta'

import { getKeepaData } from './utils/keepaApi'
import type { KeepaResult } from './types.ts';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        bg: 'gray.50',
      },
      '#root': {
        width: '100%',
        minHeight: '100vh',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'lg',
        },
      },
    },
  },
})

function App() {
  const [loading, setLoading] = useState(false)
  const [keepaResult, setKeepaResult] = useState<KeepaResult | null>(null)
  const toast = useToast()

  const handleSearch = async (url: string) => {
    try {
      setLoading(true)
      const data = await getKeepaData(url)
      setKeepaResult(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Box 
        minH="100vh" 
        bgGradient="linear(to-br, blue.50, gray.50)"
        py={{ base: 6, md: 12 }}
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Box 
          w="full"
          maxW="6xl"
          px={{ base: 4, sm: 6, md: 8 }}
          mx="auto"
        >
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="flex-start"
            w="full" 
            maxW="4xl" 
            mx="auto"
            gap={{ base: 6, md: 10 }}
          >
            <Box textAlign="center" mb={{ base: 4, md: 8 }} px={4}>
              <Text 
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} 
                fontWeight="bold"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                mb={{ base: 2, md: 3 }}
                lineHeight="shorter"
              >
                Amazon Price Checker
              </Text>
              <Text 
                fontSize={{ base: "sm", md: "lg" }} 
                color="gray.600"
                px={{ base: 2, md: 0 }}
              >
                Find the best time to buy with price history analysis
              </Text>
            </Box>
            
            <Box 
              bg="white" 
              p={{ base: 4, sm: 6, md: 8 }} 
              borderRadius="2xl" 
              boxShadow="xl"
              border="1px"
              borderColor="gray.100"
              w="full"
              maxW="4xl"
              mx="auto"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Box 
                display="flex" 
                flexDirection="column" 
                w="full" 
                gap={{ base: 6, md: 8 }}
              >
                <InstallCta />
                <SearchBar onSearch={handleSearch} isLoading={loading} />
                {keepaResult && <ResultCard result={keepaResult} />}
              </Box>
            </Box>

            <EmailCapture />
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App
