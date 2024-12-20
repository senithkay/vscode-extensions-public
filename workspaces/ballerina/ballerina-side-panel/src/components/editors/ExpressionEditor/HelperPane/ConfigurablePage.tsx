/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button, Codicon, COMPLETION_ITEM_KIND, getIcon, HelperPane, TextField } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneVariableInfo } from '../../../Form/types';
import styled from '@emotion/styled';
import { Colors } from '../../../../resources/constants';

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

    export const PrimaryButton = styled(Button)`
        appearance: "primary";
        background-color: ${Colors.PRIMARY};
    `;

    export const SecondaryButton = styled(Button)`
        appearance: "secondary";
        background-color: ${Colors.SECONDARY};
        margin-left: 20px;
    `;

    export const ButtonPanel = styled.div`
        display: flex;
        margin-top: 20px;
    `;

}

export const ConfigurablePage = ({ isLoading, variableInfo, setCurrentPage, setFilterText, onClose, onChange, onSave }: ConfigurablePageProps) => {
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
    const [confName, setConfName] = useState<string>('');
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

    const handleSave = () => {

        const confData = {
            confName: confName,
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
                {!isFormVisible ?
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
                    :

                    <HelperPane.Section title="Create New Configurable Variable">
                        <TextField
                            label="Variable Name"
                            placeholder="Enter a name for the variable"
                            value={confName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfName(e.currentTarget.value)}
                            sx={{ marginBottom: '20px' }}
                        />
                        <TextField
                            label="Value"
                            placeholder="Enter a value for the variable"
                            value={confValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfValue(e.currentTarget.value)}
                        />
                        <S.ButtonPanel>
                            <S.PrimaryButton onClick={handleSave}>
                                Save
                            </S.PrimaryButton>
                            <S.SecondaryButton onClick={() => setIsFormVisible(false)}>
                                Cancel
                            </S.SecondaryButton>
                        </S.ButtonPanel>
                    </HelperPane.Section>
                }

            </HelperPane.Body>

            {
                !isFormVisible &&
                <HelperPane.Footer>
                    <HelperPane.IconButton
                        title="Create New Configurable Variable"
                        getIcon={() => <Codicon name="add" />}
                        onClick={() => setIsFormVisible(true)}
                    />
                </HelperPane.Footer>

            }

        </>
    );
};
