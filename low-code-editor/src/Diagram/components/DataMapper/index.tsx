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

import React, { useContext, useEffect, useState } from 'react';

import {
    CaptureBindingPattern,
    ExplicitAnonymousFunctionExpression,
    LocalVarDecl,
    STNode, traversNode
} from '@ballerina/syntax-tree';

import { Context as DiagramContext } from '../../../Contexts/Diagram';

import { Parameter } from './components/Parameter';
import { DataMapperInitVisitor } from './util/data-mapper-init-visitor';
import { DataMapperPositionVisitor } from './util/datamapper-position-visitor';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const { state: { originalSyntaxTree, syntaxTree, stSymbolInfo, dataMapperFunctionName } } = useContext(DiagramContext)
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());

    const selectedNode = stSymbolInfo.variables.get("var")
        .find((node: LocalVarDecl) => (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value === dataMapperFunctionName);

    const parameters: any[] = [];

    if (selectedNode) {
        traversNode(selectedNode, new DataMapperInitVisitor(stSymbolInfo.recordTypeDescriptions));
        // todo: fetch missing records and visit
        traversNode(selectedNode, new DataMapperPositionVisitor(15, 10));
        ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression).functionSignature.parameters.forEach(param => {
            parameters.push(<Parameter model={param} />)
        });
    }
    const returnTypeModel = selectedNode ?
        ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression)
        .functionSignature
        .returnTypeDesc : null;

    const returnTypeElement = returnTypeModel ? <Parameter model={returnTypeModel} /> : null;

    return (
        <>
            <g>
                {parameters}
                {returnTypeElement}
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
