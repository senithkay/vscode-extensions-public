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

interface StyleProps {
    isSelected: boolean;
    shouldShade?: boolean;
    isClickable?: boolean;
}

export const EntityNode = styled.div`
    background-color: ${(props: StyleProps) => props.isSelected ? '#f7f1e9' : `#F0F1FB`};
    border: ${(props: StyleProps) => props.isSelected ? `2px solid #ffaf4d` : `1px solid  #5567D5`};
    border-radius: 2px !important;
    color: ${(props: StyleProps) => props.isSelected ? `#ffaf4d` : `#5567D5`};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 32px;
    opacity: ${(props: StyleProps) => props.shouldShade ? 0.85 : 1};
`;

export const EntityHead = styled.div`
    align-items: center;
    border-bottom: ${(props: StyleProps) => props.isSelected ? `1px solid #ffaf4d` : `1px solid #5567D5`};
    display: flex;
    font-family: GilmerRegular;
    font-size: 13px;
    height: 32px;
    justify-content: center;
    line-height: 20px;
    min-width: calc(100% - 16px);
    padding-inline: 8px;
    text-align: center;
    &:hover {
        color: ${(props: StyleProps) => props.isClickable ? `#2c09ed` : ``};
        cursor: ${(props: StyleProps) => props.isClickable ? `grabbing` : ``};
        text-decoration: ${(props: StyleProps) => props.isClickable ? `underline` : ``};
    }
`;

export const AttributeContainer = styled.div`
    align-items: center;
    background-color: ${(props: { isSelected: boolean }) => props.isSelected ? '#f7f1e9' : '#FFFFFF'};
    border-bottom: 0.5px solid #F0F1FB;
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
    background-color: ${(props: { isSelected: boolean }) => props.isSelected ? '#f7e4cb' : '#F0F1FB'};
    border-radius: 3px;
    color: #000000;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 24px;
    line-height: 24px;
    min-width: 60px;
    padding-inline: 6px;
    text-align: center;
`;

export const InclusionPortsContainer = styled.div`
    display: flex;
    justify-content: center;
`;
