/* tslint:disable:jsx-no-multiline-js */
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

import React, { useContext, useEffect, useRef, useState } from 'react';

import {
    CaptureBindingPattern,
    ExplicitAnonymousFunctionExpression,
    LocalVarDecl,
    STNode, traversNode
} from '@ballerina/syntax-tree';

import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { positionVisitor } from "../../../index";

import { completeMissingTypeDesc } from "./util";
import { DataMapperInitVisitor } from './util/data-mapper-init-visitor';
import { DataMapperMappingVisitor } from "./util/data-mapper-mapping-visitor";
import { DataPointVisitor } from "./util/data-point-visitor";
import { DataMapperPositionVisitor } from "./util/datamapper-position-visitor";
import { TypeDescViewState } from "./viewstate";

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state: {
            stSymbolInfo,
            dataMapperFunctionName,
            originalSyntaxTree,
            syntaxTree
        }
    } = useContext(DiagramContext)
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());
    const drawingLineRef = useRef(null);

    const selectedNode = (stSymbolInfo.variables.size > 0) ?
        stSymbolInfo.variables.get("var")
            .find((node: LocalVarDecl) => (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value === "dataMapperFunction")
        : undefined;
    const parameters: any[] = [];

    if (selectedNode) {
        traversNode(selectedNode.initializer, new DataMapperInitVisitor());
        const explicitAnonymousFunctionExpression = selectedNode.initializer as ExplicitAnonymousFunctionExpression;
        const functionSignature = explicitAnonymousFunctionExpression.functionSignature;

        // start : fetch missing type desc node traverse with init visitor
        functionSignature.parameters.forEach((field: any) => {
            if (field.kind !== 'CommaToken') {
                completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions);
            }
        });
        completeMissingTypeDesc(functionSignature.returnTypeDesc, stSymbolInfo.recordTypeDescriptions);
        // end : fetch missing type desc node traverse with init visitor

        const parameterPositionVisitor = new DataMapperPositionVisitor(10, 15);

        // start positioning visitor
        functionSignature.parameters.forEach((field: STNode) => {
            if (field.kind !== 'CommaToken') {
                traversNode(field, parameterPositionVisitor);
            }
        });
        traversNode(functionSignature.returnTypeDesc, parameterPositionVisitor);
        // end positioning visitor
        const dataPointVisitor = new DataPointVisitor(parameterPositionVisitor.maxOffset);
        traversNode(selectedNode, dataPointVisitor);

        traversNode(explicitAnonymousFunctionExpression, new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap))

        selectedNode.initializer.dataMapperViewState.sourcePoints = dataPointVisitor.sourcePointMap;
        selectedNode.initializer.dataMapperViewState.targetPointMap = dataPointVisitor.targetPointMap;
        debugger;
    }

    // if (selectedNode) {
    //     traversNode(selectedNode, new DataMapperInitVisitor());
    //     // todo: fetch missing records and visit
    //     traversNode(selectedNode, new DataMapperPositionVisitor(15, 10));
    //     ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression).functionSignature.parameters.forEach(param => {
    //         parameters.push(<TypeDescComponent model={param}/>)
    //     });
    // }
    // const returnTypeModel = selectedNode ?
    //     ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression)
    //         .functionSignature
    //         .returnTypeDesc : null;
    //
    const returnTypeElement: any = null; // returnTypeModel ? <TypeDescComponent model={returnTypeModel} isOutput={true} /> : null;

    return (
        <>
            <g>
                {parameters}
                {returnTypeElement}
            </g>
            <g>
                <line ref={drawingLineRef}/>
            </g>
            {/* <DiagramOverlayContainer>
                    position={{ x: 15, y: 15 }}
                >
                    <div>
                        hahaha
                    </div>
                </DiagramOverlay>
                <DiagramOverlay
                    position={{ x: width + (width / 2), y: -5 }}
                >
                    <div>
                        hahaha
                    </div>
                </DiagramOverlay>
                <DiagramOverlay
                    position={{ x: width + (width / 2), y: -25 }}
                >
                    <div>
                        hahaha
                    </div>
                </DiagramOverlay>
            </DiagramOverlayContainer> */}
        </>
    )

}
