/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Codicon, COMPLETION_ITEM_KIND, Divider, Dropdown, getIcon, HelperPane, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { HelperPaneCompletionItem } from '@wso2-enterprise/mi-core';

import { getHelperPaneCompletionItem } from '../FormExpressionField/utils';

const Form = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
`;

const Title = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ButtonPanel = styled.div`
    display: flex;
    margin-top: 20px;
    margin-left: auto;
    gap: 16px;
`;

type ConfigsPageProps = {
    isLoading: boolean;
    configInfo: HelperPaneCompletionItem[];
    setFilterText: (filterText: string) => void;
    onChange: (value: string) => void;
};

/* Validation schema for the config form */
const schema = yup.object({
    configName: yup.string().required('Config Name is required'),
    configType: yup.string().oneOf(['string', 'cert'] as const).required('Config Type is required')
});

type ConfigFormData = yup.InferType<typeof schema>;

export const ConfigsPage = ({
    isLoading,
    configInfo,
    setFilterText,
    onChange
}: ConfigsPageProps) => {
    const { rpcClient } = useVisualizerContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

    const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            configName: '',
            configType: 'string'
        }
    });

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            setFilterText('');
        }
    }, []);

    const onSubmit = (data: ConfigFormData) => {
        // Handle form submission
        rpcClient.getMiDiagramRpcClient().saveConfig({
            configName: data.configName,
            configType: data.configType
        }).then(({ success }) => {
            if (success) {
                // Retrieve the updated config info
                setFilterText('');
                clearForm();
            }
        });
    };

    const clearForm = () => {
        setIsFormOpen(false);
        reset();
    };

    const handleSearch = (searchText: string) => {
        setFilterText(searchText);
        setSearchValue(searchText);
    };

    const getCompletionItemIcon = () => getIcon(COMPLETION_ITEM_KIND.Variable);

    return (
        <>
            {!isFormOpen ? (
                <>
                    <HelperPane.Header
                        searchValue={searchValue}
                        onSearch={handleSearch}
                    />
                    <HelperPane.Body loading={isLoading}>
                        {configInfo?.map((config) => (
                            getHelperPaneCompletionItem(config, onChange, getCompletionItemIcon)
                        ))}
                    </HelperPane.Body>
                </>
            ) : (
                <Form>
                    <Title>
                        <Typography variant="h3" sx={{ margin: '0' }}>
                            Add configuration
                        </Typography>
                        <Divider sx={{ margin: '0' }} />
                    </Title>
                    <Alert
                        variant='primary'
                        title="Important!"
                        subTitle="After adding the configuration through the form, please add config name and the value to the .env file."
                        sx={{ marginBottom: '0' }}
                    />
                    <TextField
                        id="configName"
                        placeholder="Name of the configuration"
                        label="Name"
                        autoFocus
                        required
                        {...register('configName')}
                        errorMsg={errors.configName?.message}
                    />
                    <Dropdown
                        id="configType"
                        label="Type"
                        required
                        {...register('configType')}
                        errorMsg={errors.configType?.message}
                        items={[
                            { id: '1', content: 'string', value: 'string' },
                            { id: '2', content: 'cert', value: 'cert' }
                        ]}
                    />
                    <ButtonPanel>
                        <Button appearance="secondary" onClick={clearForm}>
                            Cancel
                        </Button>
                        <Button appearance="primary" onClick={handleSubmit(onSubmit)} disabled={!isValid}>
                            Save
                        </Button>
                    </ButtonPanel>
                </Form>
            )}
            {!isFormOpen && (
                <HelperPane.Footer>
                    <HelperPane.IconButton
                        title="Create New Configurable Variable"
                        getIcon={() => <Codicon name="add" />}
                        onClick={() => setIsFormOpen(true)}
                    />
                </HelperPane.Footer>
            )}
        </>
    );
};
