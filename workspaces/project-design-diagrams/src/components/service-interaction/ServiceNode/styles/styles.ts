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
import { Colors, Level } from '../../../../resources';

interface StyleProps {
    isNew?: boolean;
    level?: Level;
    alignStart?: boolean;
    isSelected?: boolean;
    awaitLinking?: boolean;
    isEditMode?: boolean;
    isNoData?: boolean;
}

export const ServiceNode: React.FC<any> = styled.div`
    animation: ${(props: StyleProps) => props.isNew ? 'fadeIn 5s' : ''};
    background-color: ${(props: StyleProps) => props.level === Level.ONE ? `#FFFFFF` :
        props.isSelected ? Colors.SECONDARY_SELECTED : Colors.SECONDARY};
    border: ${(props: StyleProps) => props.isNoData ? `1px solid ${Colors.PRIMARY_SELECTED}` : (props.awaitLinking ?
            `2px solid green` : `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY_LIGHT}`)};;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom-left-radius: ${(props: StyleProps) => props.level === Level.ONE ? `5px` : `0px`};
    border-bottom-right-radius: ${(props: StyleProps) => props.level === Level.ONE ? `5px` : `0px`};
    color: ${Colors.DEFAULT_TEXT};
    cursor: ${(props: StyleProps) => props.isEditMode ? `cursor` : props.isNoData ? `pointer` : `auto`};
    display: flex;
    flex-direction: column;
    min-height: 40px;
`;

export const ServiceHead: React.FC<any> = styled.div`
    align-items: center;
    border-bottom: ${(props: StyleProps) => props.level === Level.TWO ?
        `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY_LIGHT}` : ``};
    display: flex;
    font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 13px;
    height: 40px;
    justify-content: center;
    line-height: 24px;
    padding: 0px 16px;
    min-width: calc(100% - 32px);
    text-align: center;
    text-transform: capitalize;
    white-space: nowrap;
`;

export const ServiceName = styled.span`
    margin-left: 12px;
`;

export const FunctionContainer: React.FC<any> = styled.div`
    align-items: center;
    background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
    border-bottom: 0.5px solid #cccde3;
    color: #000000;
    display: flex;
    flex-direction: row;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 30px;
    justify-content: ${(props: StyleProps) => props.alignStart ? 'flex-start' : 'center'};
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
    width: 50px;
`;

export const ResourceName = styled.div`
    display: flex;
    flex: 1;
    height: 30px;
    line-height: 30px;
    margin-left: 8px;
    text-align: left;
    white-space: nowrap;
`;

export const RemoteName: React.FC<any> = styled.span`
    margin-left: ${(props: { spaceOut: boolean }) => props.spaceOut ? '8px' : '0px'};
`;

export const ActionColors = new Map<string, string>([
    ['put', '#fdba68'],
    ['post', '#74d8ab'],
    ['get', '#9accfe'],
    ['delete', '#fb8383'],
    ['patch', '#6af7d9'],
    ['head', '#c587fa'],
    ['options', '#378ee6']
]);
