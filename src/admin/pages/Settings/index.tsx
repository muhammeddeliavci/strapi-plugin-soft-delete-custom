import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ContentLayout,
  HeaderLayout,
  Layout,
  Main,
  NumberInput,
  Grid,
  GridItem,
  Loader,
  MultiSelect,
  MultiSelectOption
} from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

const Settings = () => {
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [enabledContentTypes, setEnabledContentTypes] = useState<string[]>([]);
  const [availableContentTypes, setAvailableContentTypes] = useState<{ uid: string; displayName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { get, post } = useFetchClient();
  const toggleNotification = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await get('/soft-delete-custom/settings');
        if (data) {
           setRetentionDays(data.retentionDays || 30);
           setEnabledContentTypes(data.enabledContentTypes || []);
           setAvailableContentTypes(data.availableContentTypes || []);
        }
      } catch (err) {
        toggleNotification({
          type: 'warning',
          message: 'Failed to fetch settings',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [get, toggleNotification]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await post('/soft-delete-custom/settings', {
        retentionDays,
        enabledContentTypes,
      });
      toggleNotification({
        type: 'success',
        message: 'Settings saved successfully',
      });
    } catch (err) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Main aria-busy={isLoading}>
          <ContentLayout>
             <Loader>Loading settings...</Loader>
          </ContentLayout>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Main>
        <HeaderLayout
          title="Soft Delete Settings"
          subtitle="Configure soft delete behavior"
          primaryAction={
            <Button
              startIcon={<Check />}
              onClick={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
            >
              Save
            </Button>
          }
        />
        <ContentLayout>
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            padding={6}
          >
             <Grid gap={6}>
                <GridItem col={6} s={12}>
                   <NumberInput
                      label="Retention Period (Days)"
                      name="retentionDays"
                      hint="Days to keep soft-deleted items before permanent deletion"
                      value={retentionDays}
                      onValueChange={(value: number) => setRetentionDays(value)}
                   />
                </GridItem>
                <GridItem col={6} s={12}>
                  <MultiSelect
                    label="Enabled Content Types"
                    placeholder="Select content types..."
                    hint="Select which content types should have soft delete enabled"
                    onClear={() => setEnabledContentTypes([])}
                    value={enabledContentTypes}
                    onChange={setEnabledContentTypes}
                    withTags
                  >
                    {availableContentTypes.map((ct) => (
                      <MultiSelectOption key={ct.uid} value={ct.uid}>
                        {ct.displayName}
                      </MultiSelectOption>
                    ))}
                  </MultiSelect>
                </GridItem>
             </Grid>
          </Box>
        </ContentLayout>
      </Main>
    </Layout>
  );
};

export default Settings;
