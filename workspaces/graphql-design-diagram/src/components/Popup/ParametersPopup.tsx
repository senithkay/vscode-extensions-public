/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Param } from "../resources/model";
import { FieldName, FieldType } from "../resources/styles/styles";

import { Container } from "./styles";

interface ParametersPopupProps {
    parameters: Param[];
}

export function ParametersPopup(props: ParametersPopupProps) {
    const { parameters } = props;
    return (
        <Container>
            <div>
                <p>Parameters</p>
                <ul style={{ display: 'block', paddingInlineStart: '10px' }}>
                    {/* tslint:disable-next-line:jsx-no-multiline-js */}
                    {parameters.map((param, index) => {
                        return (
                            <li key={index}>
                                <div style={{ display: 'flex' }}>
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
