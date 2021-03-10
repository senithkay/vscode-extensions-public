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
    FunctionBodyBlock,
    FunctionDefinition,
    STNode,
    traversNode,
    ExplicitAnonymousFunctionExpression,
    LocalVarDecl
} from '@ballerina/syntax-tree';

import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { DiagramOverlay, DiagramOverlayContainer } from '../Portals/Overlay';

import { DataMapperInitVisitor } from './util/data-mapper-init-visitor';
import { DataMapperPositionVisitor } from './util/datamapper-position-visitor';
import { Parameter } from './components/Parameter';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const { state: { originalSyntaxTree, syntaxTree, stSymbolInfo } } = useContext(DiagramContext)
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());

    const selectedNode = ((syntaxTree as FunctionDefinition).functionBody as FunctionBodyBlock).statements[3];
    traversNode(selectedNode, new DataMapperInitVisitor(stSymbolInfo.recordTypeDescriptions));
    // todo: fetch missing records and visit

    traversNode(selectedNode, new DataMapperPositionVisitor(15, 10));

    const parameters: any[] = [];

    ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression).functionSignature.parameters.forEach(param => {
        parameters.push(<Parameter model={param} />)
    });

    const returnTypeModel = ((selectedNode as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression)
        .functionSignature
        .returnTypeDesc;

    const returnTypeElement = <Parameter model={returnTypeModel} />

    return (
        <>
            <g>
                {/* <line x1={10} x2={100} y1={15} y2={100} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} /> */}
                {/*<text*/}
                {/*    x={10}*/}
                {/*    y={15}*/}
                {/*    font-family="Verdana"*/}
                {/*    font-size="15"*/}
                {/*    fontWeight={'bold'}*/}
                {/*    fill="blue"*/}
                {/*>*/}
                {/*    Title: type*/}
                {/*</text>*/}
                {/*<text*/}
                {/*    x={30}*/}
                {/*    y={35}*/}
                {/*    font-family="Verdana"*/}
                {/*    font-size="15"*/}
                {/*    // fontWeight={'bold'}*/}
                {/*    fill="blue"*/}
                {/*>*/}
                {/*    Title: type*/}
                {/*</text>*/}
                {parameters}
                {returnTypeElement}
            </g>
            {/* <DiagramOverlayContainer>
                <DiagramOverlay
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
