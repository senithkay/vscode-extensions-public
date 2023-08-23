/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { Colors } from '../../../resources';

const ANON_RECORD_PRIMARY: string = '#0d6fbf';
const ANON_RECORD_SECONDARY: string = '#e8f5ff';
const PRIMARY_HOVER: string = '#2c09ed';

interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
    isFocused?: boolean;
}

export const ComponentNode: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.NODE_BACKGROUND};
    border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.NODE_BORDER}`};
    border-radius: 6px !important;
    color: ${(props: StyleProps) => props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    padding: 8px;
`;

export const ComponentHead: React.FC<any> = styled.div`
    align-items: center;
    display: flex;
    font-family: GilmerMedium;
    font-size: 13px;
    height: 30px;
    justify-content: center;
    line-height: 20px;
    min-width:  ${(props: StyleProps) => props.isCollapsed ? `calc(100% - 40px)` : `calc(100% - 100px)`};
    padding: ${(props: StyleProps) => props.isCollapsed ? `0px 20px` : `0px 50px`};
    text-align: center;
`;

export const ComponentName: React.FC<any> = styled.span`
    cursor: pointer;
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? PRIMARY_HOVER : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

