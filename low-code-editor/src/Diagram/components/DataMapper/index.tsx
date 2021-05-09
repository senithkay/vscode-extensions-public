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
import { DataMapperInitVisitor as NewDataMapperInitVisitor, VisitingType } from './util/data-mapper-input-init-visitor';
import { DataMapperPositionVisitor as NewDataMapperPositionVisitor } from './util/data-mapper-input-position-visitor';
import { DataPointVisitor } from "./util/data-point-visitor";
import sampleJSON from './sample-config.json';
import { DataPoint } from './components/DataPoint';
import { SourcePointViewState, TargetPointViewState } from './viewstate';
import { DataMapperMappingVisitor } from './util/data-mapper-mapping-visitor';

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
            .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
        : undefined;


    const components: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    if (selectedNode) {

        const inputVariables: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;

        inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
            const varSTNode: LocalVarDecl = variableInfo.node as LocalVarDecl;
            addTypeDescInfo(varSTNode, stSymbolInfo.recordTypeDescriptions);
        });

        addTypeDescInfo(selectedNode, stSymbolInfo.recordTypeDescriptions);
        traversNode(selectedNode, new NewDataMapperInitVisitor(VisitingType.OUTPUT));

        if (selectedNode.dataMapperTypeDescNode) {
            switch (selectedNode.dataMapperTypeDescNode.kind) {
                case 'RecordTypeDesc': {
                    (selectedNode.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach(field => {
                        completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.OUTPUT);
                    })
                }
            }
        }

        const positionVisitor = new NewDataMapperPositionVisitor(15, 15);

        inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
            traversNode(variableInfo.node, new NewDataMapperInitVisitor(VisitingType.INPUT));

            if (variableInfo.node.dataMapperTypeDescNode) {
                switch (variableInfo.node.dataMapperTypeDescNode.kind) {
                    case 'RecordTypeDesc': {
                        (variableInfo.node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach(field => {
                            completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.INPUT);
                        })
                    }
                }
            }

            traversNode(variableInfo.node, positionVisitor);
            const { dataMapperViewState } = variableInfo.node;
            components.push(getDataMapperComponent(dataMapperViewState.type, { model: variableInfo.node, isMain: true }))
        });

        // selected node visit
        positionVisitor.setHeight(15);
        positionVisitor.setOffset(500);
        traversNode(selectedNode, positionVisitor);

        // datapoint visitor
        const dataPointVisitor = new DataPointVisitor(positionVisitor.getMaxOffset());
        inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
            traversNode(variableInfo.node, dataPointVisitor);
        });

        traversNode(selectedNode, dataPointVisitor);
        dataPointVisitor.sourcePointMap.forEach((dataPoint: SourcePointViewState) => {
            dataPoints.push(<DataPoint dataPointViewState={dataPoint} onClick={() => { }} />);
        });

        dataPointVisitor.targetPointMap.forEach((dataPoint: TargetPointViewState) => {
            dataPoints.push(<DataPoint dataPointViewState={dataPoint} onClick={() => { }} />);
        });

        traversNode(selectedNode, new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap));
        components.push(getDataMapperComponent(selectedNode.dataMapperViewState.type, { model: selectedNode, isMain: true }))

        debugger;
    }

    return (
        <>
            {components}
            {dataPoints}
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

export function addTypeDescInfo(node: LocalVarDecl, recordMap: Map<string, STNode>) {
    if (node.initializer) {
        const varTypeSymbol = node.initializer.typeData.typeSymbol;

        switch (varTypeSymbol.typeKind) {
            case PrimitiveBalType.String:
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Boolean:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Json:
                break;
            default:
                if (varTypeSymbol.moduleID) {
                    const moduleId = varTypeSymbol.moduleID;
                    const qualifiedKey = `${moduleId.orgName}/${moduleId.moduleName}:${moduleId.version}:${varTypeSymbol.name}`;
                    // const recordMap: Map<string, STNode> = stSymbolInfo.recordTypeDescriptions;

                    if (recordMap.has(qualifiedKey)) {
                        node.dataMapperTypeDescNode = recordMap.get(qualifiedKey);
                    } else {
                        // todo: fetch record/object ST
                    }
                }
        }
    }
}
