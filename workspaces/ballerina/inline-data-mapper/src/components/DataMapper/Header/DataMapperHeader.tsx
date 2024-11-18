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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "@wso2-enterprise/ui-toolkit";

import HeaderSearchBox from "./HeaderSearchBox";

export interface DataMapperHeaderProps {
    hasEditDisabled: boolean;
    onClose?: () => void;
}

export function DataMapperHeader(props: DataMapperHeaderProps) {
    const { hasEditDisabled, onClose } = props;

    return (
        <HeaderContainer>
            <HeaderContent>
                <BreadCrumb>
                    <Title> DATA MAPPER </Title>
                </BreadCrumb>
                {!hasEditDisabled && !onClose && (
                    <>
                        <IOFilterBar>
                            <HeaderSearchBox />
                        </IOFilterBar>
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
            </HeaderContent>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    height: 36px;
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

const Title = styled.h3`
    width: 18%;
    margin: 0 10px 0 0;
    color: var(--vscode-sideBarSectionHeader-foreground);
    font-size: var(--vscode-font-size);
`;

const BreadCrumb = styled.div`
    width: 70%;
    display: flex;
`;

const IOFilterBar = styled.div`
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 3px;
`;
