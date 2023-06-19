/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import styled from "@emotion/styled";

export const Container: React.FC<any> = styled.div`
    width: 600px;
    height: 100vh;
    opacity: ${(props: { isLoading: boolean }) => props.isLoading ? 0.3 : 1};
`;

export const LoadingWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

export const LoaderTitle = styled.p`
    font-weight: 600;
    font-size: 17px;
    line-height: 24px;
    margin-top: 28px;
    margin-bottom: 4px;
    color: #1d2028;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 450px;
`;

export const LoaderSubtitle = styled.p`
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: #8d91a3;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 450px;
`;

export const ErrorTitle = styled.p`
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: #8d91a3;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 450px;
`;

export const DetailContainer = styled.div`
    margin: 28px;
    display: flex;
    flex-direction: column;
`;

export const IconCard = styled.div`
    display: flex;
    align-items: flex-start;
`;

export const IconCardContent = styled.div`
    margin-left: 20px;
`;

export const ConnectorName = styled.p`
    font-weight: 600;
    margin: unset;
`;

export const OrgName = styled.p`
    margin-top: 4px;
`;

export const ConnectorDetails = styled.div`
    margin-top: 24px;
    color: #8d91a3;
`;

export const ActionContainer = styled.div`
    margin-top: 36px;
    display: flex;
    justify-content: end;
`;
