/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import "../../../resources/codicons/codicon.css"

import styled from "@emotion/styled";

interface CodiconContainerProps {
    sx?: any;
}

const CodiconContainer = styled.div<CodiconContainerProps>`
    height: 16px;
    width: 14px;
    cursor: pointer;
    ${(props: CodiconContainerProps) => props.sx};
`;

export interface CodiconProps {
	name: string; // Identifier for the icon
    sx?: any;
    onClick?: () => void;
}

export const Codicon: React.FC<CodiconProps> = (props: CodiconProps) => {
    const { name, sx, onClick } = props;
    const handleComponentClick = () => {
        onClick();
    }
    const icon = (<i className={`codicon codicon-${name}`} />);
    
    return (
        <CodiconContainer sx={sx} onClick={handleComponentClick}>
            {icon}
        </CodiconContainer>
    );
};
