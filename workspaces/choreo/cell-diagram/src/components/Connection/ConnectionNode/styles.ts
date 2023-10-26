/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { CIRCLE_WIDTH, COMPONENT_LINE_WIDTH, Colors, LABEL_FONT_SIZE, LABEL_MAX_WIDTH } from "../../../resources";
import { Orientation } from "./ConnectionModel";

const PRIMARY_HOVER: string = "#2c09ed";
interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
    isFocused?: boolean;
    orientation?: Orientation;
}

export const ConnectionNode: React.FC<any> = styled.div`
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: ${(props: StyleProps) => (props.orientation === Orientation.VERTICAL ? "column" : "row")};
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;
    padding: 2px;
    pointer-events: all;
    cursor: pointer;
`;

export const ConnectionHead: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => (props.isSelected ? Colors.SECONDARY_SELECTED : Colors.NODE_BACKGROUND_PRIMARY)};
    border: ${(props: StyleProps) =>
        `${COMPONENT_LINE_WIDTH}px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.NODE_BORDER}`};
    border-radius: 50%;
    height: ${CIRCLE_WIDTH}px;
    width: ${CIRCLE_WIDTH}px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 28px;
`;

export const ConnectionName: React.FC<any> = styled.span`
    cursor: pointer;
    font-size: ${LABEL_FONT_SIZE}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    max-width: ${(props: StyleProps) => (props.orientation === Orientation.VERTICAL ? LABEL_MAX_WIDTH: 'unset')};
    &:hover {
        color: ${(props: StyleProps) => (props.isClickable ? PRIMARY_HOVER : ``)};
        cursor: ${(props: StyleProps) => (props.isClickable ? `grabbing` : ``)};
        text-decoration: ${(props: StyleProps) => (props.isClickable ? `underline` : ``)};
    }
`;

export const IconWrapper: React.FC<any> = styled.div`
    height: 32px;
    width: 32px;
    svg {
        fill: ${(props: StyleProps) => (props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.NODE_BORDER)};
    }
`;
