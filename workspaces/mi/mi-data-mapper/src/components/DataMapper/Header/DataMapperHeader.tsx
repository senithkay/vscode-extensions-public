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

import styled from "@emotion/styled";

import HeaderSearchBox from "./HeaderSearchBox";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import { View } from "../DataMapper";
import ExpressionBar from "./ExpressionBar";

export interface DataMapperHeaderProps {
    views: View[];
    switchView: (index: number) => void;
    hasEditDisabled: boolean;
    onClose?: () => void;
    applyModifications: () => void;
}

export function DataMapperHeader(props: DataMapperHeaderProps) {
    const { views, switchView, hasEditDisabled, onClose, applyModifications } = props;

    return (
        <HeaderContainer>
            <HeaderContent>
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
            </HeaderContent>
            <ExpressionContainer>
                <ExpressionBar applyModifications={applyModifications} />
            </ExpressionContainer>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    height: 74px;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--vscode-editorWidget-background);
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 15px;
`;

const ExpressionContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    border-bottom: 1px solid var(--vscode-menu-separatorBackground);
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
  margin-bottom: 3px;
`;
