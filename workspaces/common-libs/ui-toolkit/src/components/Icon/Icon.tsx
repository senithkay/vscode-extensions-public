/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import "@wso2-enterprise/font-wso2-vscode/dist/wso2-vscode.css";

import styled from "@emotion/styled";

interface IconContainerProps {
    sx?: any;
}

const IconContainer = styled.div<IconContainerProps>`
    height: 16px;
    width: 14px;
    cursor: pointer;
    ${(props: IconContainerProps) => props.sx};
`;

export interface IconProps {
    id?: string;
    className?: string;
	name: string; // Identifier for the icon
    sx?: any;
    iconSx?: any;
    onClick?: () => void;
}

export const Icon: React.FC<IconProps> = (props: IconProps) => {
    const { id, className, name, sx, iconSx, onClick } = props;
    const handleComponentClick = () => {
        onClick && onClick();
    }
    const icon = (<i style={iconSx} className={`fw-${name}`} />);
    return (
        <IconContainer id={id} className={className} sx={sx} onClick={handleComponentClick}>
            {icon}
        </IconContainer>
    );
};
