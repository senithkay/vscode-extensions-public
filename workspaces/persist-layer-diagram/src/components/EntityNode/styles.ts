/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import styled from '@emotion/styled';
import { Colors } from '../../resources';

const ANON_RECORD_PRIMARY: string = '#0d6fbf';
const ANON_RECORD_SECONDARY: string = '#e8f5ff';
const PRIMARY_HOVER: string = '#2c09ed';

interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
}

export const EntityNode: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.NODE_BACKGROUND};
    border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.NODE_BORDER}`};
    border-radius: 6px !important;
    color: ${(props: StyleProps) => props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

export const EntityHead: React.FC<any> = styled.div`
    align-items: center;
    display: flex;
    font-family: GilmerMedium;
    font-size: 13px;
    height: 40px;
    justify-content: center;
    line-height: 20px;
    min-width:  ${(props: StyleProps) => props.isCollapsed ? `calc(100% - 40px)` : `calc(100% - 100px)`};
    padding: ${(props: StyleProps) => props.isCollapsed ? `0px 20px` : `0px 50px`};
    text-align: center;
`;

export const EntityName: React.FC<any> = styled.span`
    cursor: pointer;
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? PRIMARY_HOVER : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

export const AttributeContainer: React.FC<any> = styled.div`
    align-items: center;
    background-color: ${(props: { isSelected: boolean }) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border: 0.5px solid ${Colors.NODE_BORDER};
    display: flex;
    flex-direction: row;
    font-size: 12px;
    gap: 15px;
    height: 35px;
    justify-content: space-between;
    min-width: calc(100% - 40px);
    padding: 8px 8px 8px 32px;
`;

export const AttributeName = styled.span`
    align-items: center;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex: 1;
    font-family: GilmerRegular;
    font-size: 12px;
    line-height: 16px;
    text-align: left;
`;

export const AttributeType: React.FC<any> = styled.span`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SHADED_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.SECONDARY};
    border-radius: 3px;
    color: #000000;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 20px;
    gap: 10px;
    line-height: 20px;
    min-width: 50px;
    padding-inline: 8px;
    text-align: center;
    white-space: nowrap;
`;

export const InclusionPortsContainer = styled.div`
    display: flex;
    justify-content: center;
`;
