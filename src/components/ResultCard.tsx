import {
  Box,
  Text,
  Button,
  HStack,
  Link,
  Grid,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowRight, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import type { KeepaResult } from '../types.ts';

interface ResultCardProps {
  result: KeepaResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box w="full" display="flex" justifyContent="center">
      <Box w="full" maxW="4xl">
        <Box display="flex" flexDirection="column" gap={6}>
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <Box p={6}>
                         <Text fontSize="xl" fontWeight="bold" noOfLines={2} mb={4} textAlign="center">
               {result.title}
             </Text>

             <Box display="flex" flexDirection="column" gap={4} mb={6}>
               <Box textAlign="center">
                 <Text fontSize="sm" color="gray.500" mb={1}>Current Price</Text>
                 <HStack justifyContent="center" align="baseline" spacing={3}>
                  <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.600">
                    {formatPrice(result.currentPrice)}
                  </Text>
                  {(() => {
                    const percentDiff = ((result.thirtyDayAvg - result.currentPrice) / result.thirtyDayAvg) * 100;
                    const roundedPercent = Math.round(Math.abs(percentDiff));
                    
                    return (
                      <Badge
                        colorScheme={percentDiff > 0 ? "green" : "red"}
                        variant="solid"
                        fontSize="sm"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {percentDiff > 0 ? '-' : '+'}{roundedPercent}%
                      </Badge>
                    );
                  })()}
                </HStack>
                {(() => {
                  const percentDiff = ((result.thirtyDayAvg - result.currentPrice) / result.thirtyDayAvg) * 100;
                  const roundedPercent = Math.round(Math.abs(percentDiff));
                  
                  return (
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {percentDiff > 0 
                        ? `${roundedPercent}% below average price`
                        : `${roundedPercent}% above average price`
                      }
                    </Text>
                  );
                })()}
              </Box>

                             <Box display="flex" justifyContent="center" flexWrap="wrap">
                <Badge
                  colorScheme={
                    result.buyDecision.message.includes("Good") ? "green" :
                    result.buyDecision.message.includes("Decent") ? "yellow" : "red"
                  }
                  px={{ base: 2, md: 3 }}
                  py={1}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  fontSize={{ base: "xs", md: "sm" }}
                  maxW="full"
                  textAlign="center"
                  whiteSpace="normal"
                  lineHeight="1.2"
                >
                  <Icon 
                    as={
                      result.buyDecision.message.includes("Good") ? FiTrendingDown :
                      result.buyDecision.message.includes("Decent") ? FiMinus : FiTrendingUp
                    }
                    mr={2}
                    boxSize={{ base: 3, md: 4 }}
                    flexShrink={0}
                  />
                  <Text>{result.buyDecision.message}</Text>
                </Badge>
              </Box>
            </Box>

            <Grid 
              templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} 
              gap={{ base: 3, md: 4 }}
              p={{ base: 4, md: 5 }}
              bg={useColorModeValue('blue.50', 'blue.900')}
              borderRadius="lg"
              mb={6}
            >
                             <Box textAlign="center">
                 <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('blue.600', 'blue.200')} mb={1}>
                   30-day Average
                 </Text>
                 <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                   {formatPrice(result.thirtyDayAvg)}
                 </Text>
               </Box>
               
               <Box textAlign="center">
                 <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('blue.600', 'blue.200')} mb={1}>
                   30-day High
                 </Text>
                 <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                   {formatPrice(result.thirtyDayHigh)}
                 </Text>
               </Box>
               
               <Box textAlign="center" gridColumn={{ base: "1 / -1", sm: "auto" }}>
                 <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue('blue.600', 'blue.200')} mb={1}>
                   30-day Low
                 </Text>
                 <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                   {formatPrice(result.thirtyDayLow)}
                 </Text>
               </Box>
            </Grid>

            <Box>
              <Button
                as={Link}
                href={result.affiliateUrl}
                size="lg"
                width="full"
                colorScheme="yellow"
                rightIcon={<Icon as={FiArrowRight} />}
                isExternal
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  textDecoration: 'none'
                }}
                transition="all 0.2s"
              >
                Buy on Amazon
              </Button>
              
              <Text 
                fontSize="sm" 
                color="gray.600" 
                textAlign="center" 
                mt={3}
                lineHeight="1.4"
              >
                As an Amazon Associate, we earn from qualifying purchases at no extra cost to you
              </Text>
            </Box>
          </Box>
        </Box>

        <Box textAlign="center">
          <Text fontSize="sm" color="gray.500">
            Price data powered by Keepa, updated daily based on the last 30 days
          </Text>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResultCard;
