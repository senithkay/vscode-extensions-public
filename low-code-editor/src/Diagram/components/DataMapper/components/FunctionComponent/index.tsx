/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { ExplicitAnonymousFunctionExpression, LocalVarDecl, STNode } from "@ballerina/syntax-tree";
import React from "react";
import { SourcePointViewState } from "../../viewstate";
import { DataPoint } from "../DataPoint";
import { TypeDescComponent } from "../TypeDescComponent";

export interface DataMapperFunctionComponentProps {
    model: STNode;
}

export function DataMapperFunctionComponent(props: DataMapperFunctionComponentProps) {
    const { model } = props;
    const functionST = (model as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression;

    const parameters: JSX.Element[] = [];
    const returnType: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    functionST.functionSignature.parameters.forEach(param => {
        parameters.push(<TypeDescComponent model={param}/>)
    });

    returnType.push(<TypeDescComponent model={functionST.functionSignature.returnTypeDesc} isOutput={true}/>);

    functionST.dataMapperViewState.sourcePoints.forEach((dataPoint: SourcePointViewState) => {
        dataPoints.push(<DataPoint dataPointViewState={dataPoint}/>);
    });

    functionST.dataMapperViewState.targetPointMap.forEach((dataPoint: SourcePointViewState) => {
        dataPoints.push(<DataPoint dataPointViewState={dataPoint}/>);
    });

    return (
        <g>
            {parameters}
            {returnType}
            {dataPoints}
        </g>
    )
}
