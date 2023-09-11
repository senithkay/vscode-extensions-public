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

export const ConnectorNode: React.FC<any> = styled.div`
    
    color: ${(props: StyleProps) => props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    padding: 10px;
    text-align: center;
`;

export const ConnectorHead: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.NODE_BACKGROUND};
    border: ${(props: StyleProps) => `2px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.NODE_BORDER}`};
    border-radius: 50%;
    height: 60px;
    width: 60px;
    justify-content: center;
    line-height: 28px;
`;

export const ConnectorName: React.FC<any> = styled.span`
    margin-top: 10px;
    cursor: pointer;
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? PRIMARY_HOVER : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

export const InclusionPortsContainer = styled.div`
    display: flex;
    justify-content: center;
`;

