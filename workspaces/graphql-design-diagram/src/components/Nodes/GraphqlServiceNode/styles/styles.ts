/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import styled from '@emotion/styled';

import { Colors } from "../../../resources/model";

interface StyleProps {
    isNew?: boolean;
    isResource?: boolean;
    isSelected?: boolean;
    awaitLinking?: boolean;
}

export const ServiceNode = styled.div`
    animation: ${(props: StyleProps) => props.isNew ? 'fadeIn 5s' : ''};
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED : Colors.SECONDARY};
    border: ${(props: StyleProps) => props.awaitLinking ? `2px solid green` : `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED
        : Colors.PRIMARY}`};
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    color: ${Colors.PRIMARY};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 32px;
`;

export const ServiceHead = styled.div`
    align-items: center;
    border-bottom: ${(props: StyleProps) =>
        `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}`};
    display: flex;
    font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 13px;
    height: 32px;
    justify-content: center;
    line-height: 24px;
    padding-inline: 8px;
    min-width: calc(100% - 16px);
    text-align: center;
    white-space: nowrap;
`;

export const ServiceName = styled.span`
    margin-left: 8px;
`;

export const FunctionContainer = styled.div`
    align-items: center;
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border-bottom: 0.5px solid #cccde3;
    color: #000000;
    display: flex;
    flex-direction: row;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 30px;
    justify-content: ${(props: StyleProps) => props.isResource ? 'flex-start' : 'center'};
    line-height: 16px;
    min-width: calc(100% - 16px);
    padding: 8px 8px 8px 8px;
    text-align: center;
`;

export const ResourceAction = styled.div`
    background-color: ${(props: { color: string }) => `${props.color}`};
    border-radius: 5px;
    height: 22px;
    line-height: 22px;
    margin-right: 8px;
    width: 50px;
`;

export const ResourceName = styled.div`
    display: flex;
    flex: 1;
    height: 30px;
    line-height: 30px;
    text-align: left;
    white-space: nowrap;
`;
