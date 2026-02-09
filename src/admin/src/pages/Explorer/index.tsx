import React, { useState, useEffect } from 'react';
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
  Flex,
  SingleSelect,
  SingleSelectOption,
  Loader,
  Alert
} from '@strapi/design-system';
import { ArrowClockwise, ArrowsCounterClockwise } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

interface ContentType {
  uid: string;
  info: {
    displayName: string;
  };
}

interface SoftDeletedItem {
  id: number | string;
  documentId?: string;
  [key: string]: any;
}

export const Explorer = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [items, setItems] = useState<SoftDeletedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useFetchClient();
  const { toggleNotification } = useNotification();

  // Fetch available content types on mount
  useEffect(() => {
    fetchContentTypes();
  }, []);

  // Fetch soft deleted items when model changes
  useEffect(() => {
    if (selectedModel) {
      fetchSoftDeletedItems();
    }
  }, [selectedModel]);

  const fetchContentTypes = async () => {
    try {
      const response = await get('/content-type-builder/content-types');
      const types = response.data.data.filter((ct: ContentType) => 
        ct.uid.startsWith('api::')
      );
      setContentTypes(types);
      if (types.length > 0) {
        setSelectedModel(types[0].uid);
      }
    } catch (err) {
      console.error('Failed to fetch content types:', err);
      setError('Failed to load content types');
    }
  };

  const fetchSoftDeletedItems = async () => {
    if (!selectedModel) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(`/soft-delete/items?modelUid=${selectedModel}`);
      setItems(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch soft deleted items:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string | number) => {
    try {
      await post(`/soft-delete/restore/${selectedModel}/${id}`);
      toggleNotification({
        type: 'success',
        message: 'Item restored successfully'
      });
      fetchSoftDeletedItems();
    } catch (err: any) {
      toggleNotification({
        type: 'warning',
        message: err.response?.data?.error?.message || 'Failed to restore item'
      });
    }
  };

  const getItemName = (item: SoftDeletedItem) => {
    return item.name || item.title || item.documentId || item.id || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box padding={8}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Typography variant="beta">Soft Delete Explorer</Typography>
        <Button 
          startIcon={<ArrowClockwise />} 
          onClick={fetchSoftDeletedItems}
          loading={loading}
        >
          Refresh
        </Button>
      </Flex>

      {error && (
        <Box paddingBottom={4}>
          <Alert closeLabel="Close" variant="danger" title="Error">
            {error}
          </Alert>
        </Box>
      )}

      <Box paddingBottom={4}>
        <Typography variant="pi" fontWeight="bold" paddingBottom={2}>Content Type</Typography>
        <SingleSelect
          value={selectedModel}
          onChange={(value: string | number) => setSelectedModel(String(value))}
        >
          {contentTypes.map((ct) => (
            <SingleSelectOption key={ct.uid} value={ct.uid}>
              {ct.info?.displayName || ct.uid}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Box>

      <Box padding={4} background="neutral0" hasRadius shadow="filterShadow">
        {loading ? (
          <Flex justifyContent="center" padding={8}>
            <Loader>Loading...</Loader>
          </Flex>
        ) : (
          <Table colCount={4} rowCount={items.length || 1}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">Name/ID</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Deleted At</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Deleted By</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">Actions</Typography>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.length === 0 ? (
                <Tr>
                  <Td colSpan={4}>
                    <Box padding={4} textAlign="center">
                      <Typography>No soft-deleted items found.</Typography>
                    </Box>
                  </Td>
                </Tr>
              ) : (
                items.map((item) => (
                  <Tr key={item.id || item.documentId}>
                    <Td>
                      <Typography>{getItemName(item)}</Typography>
                    </Td>
                    <Td>
                      <Typography>{formatDate(item.softDeletedAt)}</Typography>
                    </Td>
                    <Td>
                      <Typography>
                        {item.softDeletedByType === 'admin' ? 'Admin' : 'API'} 
                        {item.softDeletedById ? ` (ID: ${item.softDeletedById})` : ''}
                      </Typography>
                    </Td>
                    <Td>
                      <Button
                        size="S"
                        variant="secondary"
                        onClick={() => handleRestore(item.documentId || item.id)}
                        startIcon={<ArrowsCounterClockwise />}
                      >
                        Restore
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};
