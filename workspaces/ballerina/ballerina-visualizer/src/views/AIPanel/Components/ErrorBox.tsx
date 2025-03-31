/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import React from "react";

const Container = styled.div`
    display: inline-flex;
    align-items: flex-start;
    margin-top: 1em;
    gap: 12px;
    padding: 8px;
    border: 1px solid var(--vscode-inputValidation-errorBorder);
    border-radius: 4px;
    background-color: var(--vscode-inputValidation-errorBackground);
    color: var(--vscode-inputValidation-errorForeground);
    max-width: 100%;
`;

const ErrorText = styled.span`
    word-break: break-word;
`;

interface ErrorBoxProps {
    message: string;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ message }) => {
    return (
        <Container>
            <Codicon name="error" />
            <ErrorText>{message}</ErrorText>
        </Container>
    );
};

export default ErrorBox;
