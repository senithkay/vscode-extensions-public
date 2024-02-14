/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from 'react';
import { Button, Codicon, Dropdown, SearchBox } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { ConstructorPanel } from '../ConstructorPanel';

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    box-shadow: inset 0 -1px 0 0 var(--vscode-panel-border);
`;

const InputContainer = styled.div`
    display: flex;
    margin-bottom: 15px;
`;

const ComponentButton = styled.div`
    margin-right: 20px;
`;

export interface TitleBarProps {
    onQueryChange: (value: string) => void;
    query: string;
}

export function TitleBar(props: TitleBarProps) {
    const { onQueryChange, query } = props;

    const [isPanelOpen, setPanelOpen] = useState(false);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };

    const handleSearch = (value: string) => {
        onQueryChange(value);
    };

    return (
        <Container>
            <InputContainer>
                <div
                    style={{
                        minWidth: 100,
                        marginRight: 20
                    }}
                >
                    <Dropdown
                        id="file-select"
                        items={[{ value: "All" }, { value: "main.bal" }, { value: "test.bal" }]}
                        label="File"
                        onChange={() => { }}
                        value="All"
                        sx={{ width: 200, marginTop: 2 }}
                    />
                </div>
                <SearchBox
                    sx={{ width: "45%", gap: 4 }}
                    placeholder="Search Component"
                    label="Search Component"
                    value={query}
                    onChange={handleSearch}
                />
            </InputContainer>

            <ComponentButton>
                <Button onClick={openPanel} appearance="primary" tooltip='Add Construct'>
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Component
                </Button>
            </ComponentButton>
            {isPanelOpen && <ConstructorPanel isPanelOpen={isPanelOpen} setPanelOpen={setPanelOpen} />}
        </Container>
    );
}
