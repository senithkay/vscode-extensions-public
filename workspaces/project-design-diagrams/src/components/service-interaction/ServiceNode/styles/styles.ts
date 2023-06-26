/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
