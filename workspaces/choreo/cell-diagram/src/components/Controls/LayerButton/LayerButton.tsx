/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode } from "react";
import styled from "@emotion/styled";

export const Button: React.FC<any> = styled.div`
    border: 1px solid #e0e2e9;
    width: 40px;
    height: 40px;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.54);
    background-color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    padding: 5px;
    font-size: 1.125rem;
    cursor: pointer;
`;

interface LayerButtonProps {
    children: ReactNode;
    onClick: () => void;
}

export function LayerButton(props: LayerButtonProps) {
    const { children, onClick } = props;

    return (
        <Button
            onClick={onClick}
        >
            {children}
        </Button>
    );
}
