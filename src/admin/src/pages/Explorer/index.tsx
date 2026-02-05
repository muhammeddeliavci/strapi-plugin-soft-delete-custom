import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td,
  Flex
} from '@strapi/design-system';
import { Plus } from '@strapi/icons';

export const Explorer = () => {
  return (
    <Box padding={8}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Typography variant="beta">Soft Delete Explorer</Typography>
        <Button startIcon={<Plus />}>Refresh</Button>
      </Flex>
      
      <Box padding={4} background="neutral0" hasRadius shadow="filterShadow">
        <Table colCount={3} rowCount={1}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">Name</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Deleted At</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
             <Tr>
               <Td colSpan={3}>
                 <Box padding={4} textAlign="center">
                   <Typography>No soft-deleted items found.</Typography>
                 </Box>
               </Td>
             </Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};
