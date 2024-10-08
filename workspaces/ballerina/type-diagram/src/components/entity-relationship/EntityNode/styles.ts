/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
const ANON_RECORD_HOVER: string = '#0289e3';
const PRIMARY_HOVER: string = '#2c09ed';

interface StyleProps {
    isAnonymous: boolean;
    isEditMode?: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    shouldShade?: boolean;
    isFocused?: boolean;
}

export const EntityNode: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.SECONDARY};
    border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.PRIMARY_LIGHT}`};
    border-radius: 5px !important;
    color: ${(props: StyleProps) => props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.DEFAULT_TEXT};
    cursor: ${(props: StyleProps) => props.isEditMode ? `pointer` : `auto`};
    display: flex;
    flex-direction: column;
    min-height: 40px;
    opacity: ${(props: StyleProps) => props.shouldShade ? 0.85 : 1};
`;

export const EntityHead: React.FC<any> = styled.div`
    align-items: center;
    border-bottom: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.PRIMARY_LIGHT}`};
    display: flex;
    font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 13px;
    height: 40px;
    justify-content: center;
    line-height: 20px;
    min-width: calc(100% - 32px);
    padding: 0px 16px;
    text-align: center;
`;

export const EntityName: React.FC<any> = styled.span`
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? (props.isAnonymous ? ANON_RECORD_HOVER : PRIMARY_HOVER) : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

export const AttributeContainer: React.FC<any>  = styled.div`
    align-items: center;
    background-color: ${(props: { isSelected: boolean }) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border-bottom: 0.5px solid #cccde3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    display: flex;
    flex-direction: row;
    font-size: 12px;
    height: 30px;
    justify-content: space-between;
    min-width: calc(100% - 20px);
    padding: 8px 8px 8px 12px;
`;

export const AttributeName: React.FC<any> = styled.span`
    align-items: center;
    color: #000000;
    display: flex;
    flex: 1;
    font-family: GilmerRegular;
    font-size: 12px;
    line-height: 30px;
    padding-right: 8px;
    text-align: left;
`;

export const AttributeType: React.FC<any>  = styled.span`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SHADED_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.SECONDARY};
    border-radius: 3px;
    color: #000000;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 24px;
    line-height: 24px;
    min-width: 60px;
    padding-inline: 6px;
    text-align: center;
    cursor: pointer;
    white-space: nowrap;
`;

export const InclusionPortsContainer: React.FC<any> = styled.div`
    display: flex;
    justify-content: center;
`;
