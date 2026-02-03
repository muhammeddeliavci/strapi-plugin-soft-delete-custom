import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  SingleSelect,
  SingleSelectOption,
  SearchForm,
  Searchbar,
  Pagination,
} from '@strapi/design-system';
import { Trash, ArrowClockwise } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

interface SoftDeletedEntry {
  id: string | number;
  contentType: string;
  title: string;
  _softDeletedAt: string;
  _softDeletedById: number | null;
  _softDeletedByType: string | null;
}

const SoftDeleteExplorer = () => {
  const [entries, setEntries] = useState<SoftDeletedEntry[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const { get, post, del } = useFetchClient();
  const toggleNotification = useNotification();

  // Fetch soft deleted entries
  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(selectedContentType && { contentType: selectedContentType }),
        ...(searchQuery && { search: searchQuery }),
      });

      const { data } = await get(`/soft-delete-custom/list?${params}`);

      // Flatten entries from all content types
      const allEntries: SoftDeletedEntry[] = [];
      let total = 0;

      data.data.forEach((ct: any) => {
        allEntries.push(
          ...ct.entries.map((entry: any) => ({
            ...entry,
            contentType: ct.contentType,
            title: extractTitle(entry),
          }))
        );
        total += ct.count;
      });

      setEntries(allEntries);
      setTotalCount(total);
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to fetch soft deleted entries',
      });
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, pageSize, selectedContentType, searchQuery]);

  // Extract title from entry
  const extractTitle = (entry: any): string => {
    return entry.title || entry.name || entry.label || `Entry #${entry.id}`;
  };

  // Handle restore
  const handleRestore = async (contentType: string, id: string | number) => {
    if (!confirm('Are you sure you want to restore this entry?')) return;

    try {
      await post(`/soft-delete-custom/restore/${contentType}/${id}`);
      toggleNotification({
        type: 'success',
        message: 'Entry restored successfully',
      });
      fetchEntries();
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to restore entry',
      });
    }
  };

  // Handle permanent delete
  const handleDeletePermanently = async (contentType: string, id: string | number) => {
    if (
      !confirm(
        'WARNING: This will permanently delete the entry. This action cannot be undone. Are you sure?'
      )
    ) {
      return;
    }

    try {
      await del(`/soft-delete-custom/delete-permanently/${contentType}/${id}`);
      toggleNotification({
        type: 'success',
        message: 'Entry permanently deleted',
      });
      fetchEntries();
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to delete entry permanently',
      });
    }
  };

  // Handle bulk restore
  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Restore ${selectedIds.size} selected entries?`)) return;

    try {
      const items = Array.from(selectedIds).map((id) => {
        const entry = entries.find((e) => e.id === id);
        return { contentType: entry?.contentType, id };
      });

      await post('/soft-delete-custom/restore-bulk', { items });
      toggleNotification({
        type: 'success',
        message: `${selectedIds.size} entries restored successfully`,
      });
      setSelectedIds(new Set());
      fetchEntries();
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to restore entries',
      });
    }
  };

  // Handle bulk permanent delete
  const handleBulkDeletePermanently = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `WARNING: Permanently delete ${selectedIds.size} entries? This cannot be undone!`
      )
    ) {
      return;
    }

    try {
      const items = Array.from(selectedIds).map((id) => {
        const entry = entries.find((e) => e.id === id);
        return { contentType: entry?.contentType, id };
      });

      await del('/soft-delete-custom/delete-permanently-bulk', { data: { items } });
      toggleNotification({
        type: 'success',
        message: `${selectedIds.size} entries permanently deleted`,
      });
      setSelectedIds(new Set());
      fetchEntries();
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to delete entries',
      });
    }
  };

  // Toggle selection
  const toggleSelection = (id: string | number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  return (
    <Box padding={8}>
      <Typography variant="alpha" marginBottom={4}>
        Soft Delete Explorer
      </Typography>

      <Flex gap={4} marginBottom={4}>
        <Box style={{ width: '300px' }}>
          <SingleSelect
            label="Content Type"
            placeholder="All Content Types"
            value={selectedContentType}
            onChange={(value: string) => setSelectedContentType(value)}
          >
            <SingleSelectOption value="">All Content Types</SingleSelectOption>
            {/* Dynamically populate with content types */}
          </SingleSelect>
        </Box>

        <SearchForm onSubmit={() => fetchEntries()}>
          <Searchbar
            placeholder="Search..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </SearchForm>
      </Flex>

      {selectedIds.size > 0 && (
        <Flex gap={2} marginBottom={4}>
          <Button size="S" variant="secondary" onClick={handleBulkRestore}>
            Restore Selected ({selectedIds.size})
          </Button>
          <Button size="S" variant="danger" onClick={handleBulkDeletePermanently}>
            Delete Selected ({selectedIds.size})
          </Button>
        </Flex>
      )}

      <Table>
        <Thead>
          <Tr>
            <Th>
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelectedIds(
                    e.target.checked ? new Set(entries.map((e) => e.id)) : new Set()
                  )
                }
              />
            </Th>
            <Th>Content Type</Th>
            <Th>ID</Th>
            <Th>Title</Th>
            <Th>Deleted At</Th>
            <Th>Deleted By</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <Tr key={`${entry.contentType}-${entry.id}`}>
              <Td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(entry.id)}
                  onChange={() => toggleSelection(entry.id)}
                />
              </Td>
              <Td>{entry.contentType.split('.').pop()}</Td>
              <Td>{entry.id}</Td>
              <Td>{entry.title}</Td>
              <Td>{new Date(entry._softDeletedAt).toLocaleString()}</Td>
              <Td>{entry._softDeletedById || 'System'}</Td>
              <Td>
                <Flex gap={2}>
                  <Button
                    size="S"
                    variant="secondary"
                    startIcon={<ArrowClockwise />}
                    onClick={() => handleRestore(entry.contentType, entry.id)}
                  >
                    Restore
                  </Button>
                  <Button
                    size="S"
                    variant="danger-light"
                    startIcon={<Trash />}
                    onClick={() => handleDeletePermanently(entry.contentType, entry.id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {totalCount > pageSize && (
        <Flex justifyContent="center" marginTop={4}>
          <Pagination activePage={page} pageCount={Math.ceil(totalCount / pageSize)} onChange={setPage} />
        </Flex>
      )}
    </Box>
  );
};

export default SoftDeleteExplorer;
