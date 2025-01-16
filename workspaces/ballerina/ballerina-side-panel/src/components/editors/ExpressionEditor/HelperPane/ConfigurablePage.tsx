/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button, Codicon, COMPLETION_ITEM_KIND, Dropdown, getIcon, HelperPane, TextField } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneVariableInfo } from '../../../Form/types';
import styled from '@emotion/styled';

type ConfigurablePageProps = {
    isLoading: boolean;
    variableInfo: HelperPaneVariableInfo;
    setCurrentPage: (page: number) => void;
    setFilterText: (filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
    onSave: (values: any) => Promise<void>;
};

namespace S {
    export const FormSection = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    
    export const ButtonPanel = styled.div`
        display: flex;
        margin-top: 20px;
        margin-left: auto;
        gap: 16px;
    `;
}

export const ConfigurablePage = ({ isLoading, variableInfo, setCurrentPage, setFilterText, onClose, onChange, onSave }: ConfigurablePageProps) => {
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
    const [confName, setConfName] = useState<string>('');
    const [confType, setConfType] = useState<string>('');
    const [confValue, setConfValue] = useState<string>('');

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            setFilterText('');
        }
    }, []);

    const handleSearch = (searchText: string) => {
        setFilterText(searchText);
        setSearchValue(searchText);
    };

    const clearForm = () => {
        setIsFormVisible(false);
        setConfName('');
        setConfType('');
        setConfValue('');
    }

    const handleSave = () => {
        const confData = {
            confName: confName,
            confType: confType,
            confValue: confValue
        }

        onSave(confData as any)
            .then(() => {
            setIsFormVisible(false);
            setCurrentPage(3);
            })
            .catch((error) => {
            console.error('Failed to save variable:', error);
            });
    };

    const isConfigDataValid = () => {
        return confName.length > 0 && confType.length > 0 && confValue.length > 0;
    }

    return (
        <>
            <HelperPane.Header
                title="Configurables"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body isLoading={isLoading}>
                {!isFormVisible ?(
                    <>
                        {variableInfo?.category.map((category) => (
                            <React.Fragment key={category.label}>
                                {category.items.map((item, index) => (
                                    <HelperPane.CompletionItem
                                        key={index}
                                        label={item.label}
                                        type={item.type}
                                        onClick={() => onChange(item.label)}
                                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </>
                ) : (
                    <HelperPane.Section title="Create New Configurable Variable">
                        <S.FormSection>
                            <TextField
                                label="Name"
                                placeholder="Enter a name for the variable"
                                value={confName}
                                onChange={(e) => setConfName(e.target.value)}
                            />
                            {/* TODO: Update the component to a TypeSelector when the API is provided */}
                            <TextField
                                label="Type"
                                placeholder="Enter a type for the variable"
                                value={confType}
                                onChange={(e) => setConfType(e.target.value)}
                            />
                            <TextField
                                label="Value"
                                placeholder="Enter a value for the variable"
                                value={confValue}
                                onChange={(e) => setConfValue(e.target.value)}
                            />
                        </S.FormSection>
                        <S.ButtonPanel>
                            <Button appearance='secondary' onClick={clearForm}>
                                Cancel
                            </Button>
                            <Button appearance='primary' onClick={handleSave} disabled={!isConfigDataValid()}>
                                Save
                            </Button>
                        </S.ButtonPanel>
                    </HelperPane.Section>
                )}
            </HelperPane.Body>
            {!isFormVisible && (
                <HelperPane.Footer>
                    <HelperPane.IconButton
                        title="Create New Configurable Variable"
                        getIcon={() => <Codicon name="add" />}
                        onClick={() => setIsFormVisible(true)}
                    />
                </HelperPane.Footer>
            )}
        </>
    );
};
