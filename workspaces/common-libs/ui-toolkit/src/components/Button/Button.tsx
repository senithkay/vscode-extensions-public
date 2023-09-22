/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

export const IconLabel = styled.div`
    // To hide label in small screens
    margin-left: 2px;
    @media (max-width: 320px) {
      display: none;
    }
`;

export interface ButtonProps {
    appearance?: "primary" | "secondary" | "icon";
    tooltip?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Button = (props: ButtonProps) => {
    const { disabled, appearance = "primary", tooltip, children, onClick } = props;

    return (
        <VSCodeButton appearance={appearance} onClick={() => onClick()} title={tooltip} disabled={disabled}>
            {children}
        </VSCodeButton>
    );
};
