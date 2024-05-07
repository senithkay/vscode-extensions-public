/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";

import HeaderSearchBox from "./HeaderSearchBox";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import { View } from "../DataMapper";

export interface DataMapperHeaderProps {
    views: View[];
    switchView: (index: number) => void;
    hasEditDisabled: boolean;
    onConfigOpen: () => void;
    onClose?: () => void;
}

export function DataMapperHeader(props: DataMapperHeaderProps) {
    const { views, switchView, hasEditDisabled, onClose } = props;

    return (
        <HeaderContainer>
            <BreadCrumb>
                <Title> DATA MAPPER </Title>
                {!hasEditDisabled && (
                    <HeaderBreadcrumb
                        views={views}
                        switchView={switchView}
                    />
                )}
            </BreadCrumb>
            {!hasEditDisabled && !onClose && (
                <>
                    <FilterBar>
                        <HeaderSearchBox />
                    </FilterBar>
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

const Title = styled.h3`
    margin: 0 10px 0 0;
    color: var(--vscode-sideBarSectionHeader-foreground);
    font-size: var(--vscode-font-size);
`;

const BreadCrumb = styled.div`
    width: 60%;
    display: flex;
`;

const FilterBar = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
  margin-bottom: 3px;
`;
