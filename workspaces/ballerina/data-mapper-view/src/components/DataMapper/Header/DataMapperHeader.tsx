/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { Button, Codicon, Icon, Typography } from "@wso2-enterprise/ui-toolkit";

import { SelectionState, ViewOption } from "../DataMapper";
import AutoMapButton from "./AutoMapButton";
import ConfigureButton from "./ConfigureButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderSearchBox from "./HeaderSearchBox";

export interface DataMapperHeaderProps {
    selection: SelectionState;
    hasEditDisabled: boolean;
    experimentalEnabled: boolean;
    isBI?: boolean;
    changeSelection: (mode: ViewOption, selection?: SelectionState, navIndex?: number) => void;
    onConfigOpen: () => void;
    onEdit: () => void;
    onClose?: () => void;
    autoMapWithAI: () => Promise<void>;
}

export function DataMapperHeader(props: DataMapperHeaderProps) {
    const {
        selection,
        hasEditDisabled,
        experimentalEnabled,
        isBI,
        changeSelection,
        onConfigOpen,
        onEdit,
        onClose,
        autoMapWithAI
    } = props;

    const handleAutoMap = async () => {
        await autoMapWithAI();
    };

    return (
        <HeaderContainer>
            <BreadCrumb>
                <Icon name="dataMapper" sx={{ paddingTop: "1px", marginRight: "5px" }} />
                <Title variant="body3"> Data Mapper: </Title>
                {!hasEditDisabled && (
                    <HeaderBreadcrumb
                        selection={selection}
                        changeSelection={changeSelection}
                    />
                )}
                {isBI && (
                    <Button appearance="icon" onClick={onEdit} sx={{ marginLeft: "5px" }}>
                        <Codicon name="edit" />
                        <>Edit</>
                    </Button>
                )}
            </BreadCrumb>
            {!hasEditDisabled && !onClose && (
                <>
                    <FilterBar>
                        <HeaderSearchBox selection={selection} />
                    </FilterBar>
                    <AutoMapButton onClick={handleAutoMap} />
                    {!isBI && <ConfigureButton onClick={onConfigOpen} />}
                </>
            )}
            {onClose && (
                <VSCodeButton 
                    appearance="icon"
                    onClick={onClose}
                    style={{ marginLeft: "15px" }}
                >
                    <Codicon name="chrome-close" />
                </VSCodeButton>
            )}
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    height: 50px;
    display: flex;
    padding: 15px;
    background-color: var(--vscode-editorWidget-background);
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(102,103,133,0.15);
`;

const Title = styled(Typography)`
    margin: 0 10px 0 0;
`;

const BreadCrumb = styled.div`
    width: 60%;
    display: flex;
    align-items: center;
`;

const FilterBar = styled.div`
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 20px;
`;
