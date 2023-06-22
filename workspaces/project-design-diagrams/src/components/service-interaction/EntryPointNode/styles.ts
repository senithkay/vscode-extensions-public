/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { Colors, Level } from '../../../resources';

interface StyleProps {
    awaitLinking: boolean;
    isSelected: boolean;
    level: Level;
}

export const Container: React.FC<any> = styled.div`
    align-items: center;
    background-color: ${(props: StyleProps) => props.level === Level.ONE ? '#FFFFFF' : props.isSelected ?
        Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border: ${(props: StyleProps) => props.awaitLinking ? `2px solid green` : `1px solid ${props.isSelected ?
        Colors.PRIMARY_SELECTED : Colors.PRIMARY_LIGHT}`};
    border-radius: 5px;
    color: ${Colors.DEFAULT_TEXT};
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 13px;
    justify-content: center;
    line-height: 24px;
    min-height: 40px;
    padding-inline: 16px;
`;

export const DisplayName = styled.span`
    margin-left: 12px;
`;
