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

import React from "react";

import { Param } from "../resources/model";
import { FieldName, FieldType } from "../resources/styles/styles";

import { Container } from "./styles";

interface ParametersPopupProps {
    parameters: Param[];
}
export function ParametersPopup(props: ParametersPopupProps){
    const { parameters } = props;
    return(
        <Container>
            <div>
            <p>Parameters</p>
                <ul style={{display: 'block', paddingInlineStart: '10px'}}>
                    {/* tslint:disable-next-line:jsx-no-multiline-js */}
                    {parameters.map((param, index) => {
                        return(
                            <li key={index}>
                                <div style={{display: 'flex'}}>
                                    <FieldName>{param.name}</FieldName>
                                    <FieldType>{param.type}</FieldType>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Container>
    );
}
