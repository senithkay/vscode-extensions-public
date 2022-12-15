/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import styled from "@emotion/styled";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";

export interface LocalVarManagerNodeWidgetProps {
    context: IDataMapperContext;
}

export function LocalVarManagerNodeWidget(props: LocalVarManagerNodeWidgetProps) {
    const { context } = props;

    const onClick = () => {
        context.handleLocalVarConfigPanel(true);
    };

    return (
        <ConfigurationButton
            onClick={onClick}
        >
            <ConfBtnText>Manage Local Variables</ConfBtnText>
        </ConfigurationButton>
    );
}

const ConfigurationButton = styled.div`
    height: 40px;
    padding: 15px;
    background: #FFFFFF;
    //border: 1px solid #d2d4da;
    box-shadow: 0 5px 50px rgba(203, 206, 219, 0.5);
    color: #1D2028;
    border-radius: 5px;
    display: flex;
    align-items: center;
    :hover {
        background: #e5e6ea;
        cursor: pointer;
    }
`;

const ConfBtnText = styled.div`
    font-weight: 400;
    font-size: 13px;
    line-height: 24px;
`;
