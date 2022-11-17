/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import { Colors } from '../../../resources';

const ANON_RECORD_PRIMARY: string = '#0d6fbf';
const ANON_RECORD_SECONDARY: string = '#e8f5ff';
const ANON_RECORD_HOVER: string = '#0289e3';
const PRIMARY_HOVER: string = '#2c09ed';

interface StyleProps {
    isSelected: boolean;
    isAnonymous: boolean;
    shouldShade?: boolean;
    isClickable?: boolean;
}

export const EntityNode = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_SECONDARY : Colors.SECONDARY};
    border: ${(props: StyleProps) => props.isSelected ? `2px solid ${Colors.PRIMARY_SELECTED}` :
        `1px solid ${props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.PRIMARY}`};
    border-radius: 2px !important;
    color: ${(props: StyleProps) => props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.PRIMARY};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 32px;
    opacity: ${(props: StyleProps) => props.shouldShade ? 0.85 : 1};
`;

export const EntityHead = styled.div`
    align-items: center;
    border-bottom: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED :
        props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.PRIMARY}`};
    display: flex;
    font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 13px;
    height: 32px;
    justify-content: center;
    line-height: 20px;
    min-width: calc(100% - 16px);
    padding-inline: 8px;
    text-align: center;
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? (props.isAnonymous ? ANON_RECORD_HOVER : PRIMARY_HOVER) : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

export const AttributeContainer = styled.div`
    align-items: center;
    background-color: ${(props: { isSelected: boolean }) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border-bottom: 0.5px solid #cccde3;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    display: flex;
    flex-direction: row;
    font-size: 12px;
    height: 30px;
    justify-content: space-between;
    min-width: calc(100% - 20px);
    padding: 8px 8px 8px 12px;
`;

export const AttributeName = styled.span`
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

export const AttributeType = styled.span`
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
    white-space: nowrap;
`;

export const InclusionPortsContainer = styled.div`
    display: flex;
    justify-content: center;
`;
