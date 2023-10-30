/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { COMPONENT_CIRCLE_WIDTH, Colors, LABEL_FONT_SIZE, LABEL_MAX_WIDTH } from "../../../resources";

const PRIMARY_HOVER: string = "#2c09ed";

interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
    isFocused?: boolean;
    borderWidth?: number;
}

export const ComponentNode: React.FC<any> = styled.div`
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 2px;
    pointer-events: all;
    cursor: pointer;
`;

export const ComponentHead: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => (props.isSelected ? Colors.SECONDARY_SELECTED : Colors.NODE_BACKGROUND_PRIMARY)};
    border: ${(props: StyleProps) =>
        `${props.borderWidth}px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.PRIMARY}`};
    border-radius: 50%;
    height: ${COMPONENT_CIRCLE_WIDTH}px;
    width: ${COMPONENT_CIRCLE_WIDTH}px;
    line-height: 28px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    position: relative;
`;

export const ComponentKind: React.FC<any> = styled.div`
    background-color: ${Colors.NODE_BACKGROUND_PRIMARY};
    border-radius: 50%;

    height: ${COMPONENT_CIRCLE_WIDTH / 3}px;
    width: ${COMPONENT_CIRCLE_WIDTH / 3}px;

    position: relative;
    bottom: -16px;
    right: 44px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding: 4px;
`;

export const ComponentName: React.FC<any> = styled.span`
    font-size: ${LABEL_FONT_SIZE}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    max-width: ${LABEL_MAX_WIDTH}px;
    &:hover {
        color: ${(props: StyleProps) => (props.isClickable ? PRIMARY_HOVER : ``)};
        cursor: ${(props: StyleProps) => (props.isClickable ? `grabbing` : ``)};
        text-decoration: ${(props: StyleProps) => (props.isClickable ? `underline` : ``)};
    }
`;

export const IconWrapper: React.FC<any> = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;

    color: ${(props: StyleProps) => (props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.PRIMARY)};
    font-size: 32px;

    svg {
        fill: ${(props: StyleProps) => (props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.PRIMARY)};
        height: 32px;
        width: 32px;
    }
`;

export const PortsContainer = styled.div`
    display: flex;
    justify-content: center;
`;
