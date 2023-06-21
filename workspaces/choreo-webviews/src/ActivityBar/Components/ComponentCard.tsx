/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";
import styled from "@emotion/styled";
import { Component } from "@wso2-enterprise/choreo-core";

const ComponentCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 0px;
`;

const ComponentName = styled.span`
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
`;

export const ComponentCard = (props: { component: Component}) => {
    return (<ComponentCardContainer>
        <ComponentName>{props.component.name}</ComponentName>
        <span>{props.component.description}</span>
    </ComponentCardContainer>)
};
