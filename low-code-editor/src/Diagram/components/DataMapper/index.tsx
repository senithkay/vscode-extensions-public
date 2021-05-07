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
/* tslint:disable:jsx-no-multiline-js */
import React, { useContext, useState } from 'react';

import {
    CaptureBindingPattern,
    ExplicitAnonymousFunctionExpression,
    LocalVarDecl,
    RecordTypeDesc,
    STNode, traversNode
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { STModification } from '../../../Definitions';
import { DataMapperInputTypeInfo } from '../Portals/ConfigForm/types';

import { DataMapperFunctionComponent } from "./components/FunctionComponent";
import { completeMissingTypeDesc, getDataMapperComponent } from "./util";
import { DataMapperInitVisitor } from './util/data-mapper-init-visitor'
import { DataMapperInitVisitor as NewDataMapperInitVisitor } from './util/data-mapper-input-init-visitor';
import { DataMapperPositionVisitor as NewDataMapperPositionVisitor } from './util/data-mapper-input-position-visitor';
import { DataPointVisitor } from "./util/data-point-visitor";
import { DataMapperPositionVisitor } from "./util/datamapper-position-visitor";
import sampleJSON from './sample-config.json';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state: {
            stSymbolInfo,
            onMutate: dispatchMutations,
            dataMapperConfig,
        }
    } = useContext(DiagramContext)

    // const dataMapperConfig = sampleJSON;
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());

    const onSave = (modifications: STModification[]) => {
        dispatchMutations(modifications);
    }

    let outputType: string = '';

    if (dataMapperConfig.outputType?.type && dataMapperConfig.outputType.type === 'record') {
        const typeInfo = dataMapperConfig.outputType.typeInfo;
        outputType = typeInfo.moduleName !== '.' ?
            `${typeInfo.moduleName}:${typeInfo.name}`
            : typeInfo.name
    } else {
        outputType = dataMapperConfig.outputType.type;
    }

    const outputTypeVariables = stSymbolInfo.variables.size > 0 ? stSymbolInfo.variables.get(outputType) : undefined;
    const selectedNode = outputTypeVariables ?
        outputTypeVariables
            .find((node: LocalVarDecl) => (node.typedBindingPattern.bindingPattern as CaptureBindingPattern)
                .variableName.value === dataMapperConfig.elementName)
        : undefined;



    const components: JSX.Element[] = [];

    debugger;
    const inputVariables: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;

    inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
        const varSTNode: LocalVarDecl = variableInfo.node as LocalVarDecl;
        if (varSTNode.initializer) {
            const varTypeSymbol = varSTNode.initializer.typeData.typeSymbol;

            switch (varTypeSymbol.typeKind) {
                case PrimitiveBalType.String:
                case PrimitiveBalType.Int:
                case PrimitiveBalType.Boolean:
                case PrimitiveBalType.Float:
                    break;
                case PrimitiveBalType.Json:
                    break;
                default:
                    if (varTypeSymbol.moduleID) {
                        const moduleId = varTypeSymbol.moduleID;
                        const qualifiedKey = `${moduleId.orgName}/${moduleId.moduleName}:${moduleId.version}:${varTypeSymbol.name}`;
                        const recordMap: Map<string, STNode> = stSymbolInfo.recordTypeDescriptions;

                        if (recordMap.has(qualifiedKey)) {
                            variableInfo.node.dataMapperTypeDescNode = recordMap.get(qualifiedKey);
                        } else {
                            // todo: fetch record/object ST
                        }
                    }
            }
        }
    });

    const positionVisitor = new NewDataMapperPositionVisitor(15, 15);

    inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
        traversNode(variableInfo.node, new NewDataMapperInitVisitor());

        if (variableInfo.node.dataMapperTypeDescNode) {
            switch (variableInfo.node.dataMapperTypeDescNode.kind) {
                case 'RecordTypeDesc': {
                    (variableInfo.node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach(field => {
                        completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions);
                    })
                }
            }
        }

        traversNode(variableInfo.node, positionVisitor);
        const { dataMapperViewState } = variableInfo.node;
        components.push(getDataMapperComponent(dataMapperViewState.type, { model: variableInfo.node, isMain: true }))
    });

    //     traversNode(selectedNode.initializer, new DataMapperInitVisitor());
    //     const explicitAnonymousFunctionExpression = selectedNode.initializer as ExplicitAnonymousFunctionExpression;
    //     const functionSignature = explicitAnonymousFunctionExpression.functionSignature;

    //     // start : fetch missing type desc node traverse with init visitor
    //     functionSignature.parameters.forEach((field: any) => {
    //         if (field.kind !== 'CommaToken') {
    //             completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions);
    //         }
    //     });
    //     completeMissingTypeDesc(functionSignature.returnTypeDesc, stSymbolInfo.recordTypeDescriptions);
    //     // end : fetch missing type desc node traverse with init visitor

    //     const parameterPositionVisitor = new DataMapperPositionVisitor(15, 15);

    //     // start positioning visitor
    //     functionSignature.parameters.forEach((field: STNode) => {
    //         if (field.kind !== 'CommaToken') {
    //             traversNode(field, parameterPositionVisitor);
    //         }
    //     });
    //     traversNode(functionSignature.returnTypeDesc, parameterPositionVisitor);
    //     // end positioning visitor
    //     const dataPointVisitor = new DataPointVisitor(parameterPositionVisitor.maxOffset);
    //     traversNode(selectedNode, dataPointVisitor);

    //     traversNode(explicitAnonymousFunctionExpression, new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap))

    //     selectedNode.initializer.dataMapperViewState.sourcePoints = dataPointVisitor.sourcePointMap;
    //     selectedNode.initializer.dataMapperViewState.targetPointMap = dataPointVisitor.targetPointMap;
    //     component.push(<DataMapperFunctionComponent model={selectedNode} onSave={onSave} />);

    return (
        <>
            {components}
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
