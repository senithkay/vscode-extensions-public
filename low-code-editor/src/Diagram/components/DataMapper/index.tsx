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
    LocalVarDecl,
    RecordTypeDesc,
    STKindChecker,
    STNode,
    traversNode
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { STModification } from '../../../Definitions';
import { GenerationType } from '../ConfigForms/ProcessConfigForms/ProcessOverlayForm/AddDataMappingConfig/OutputTypeSelector';
import "../DataMapper/components/InputTypes/style.scss";
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../Portals/ConfigForm/types';

// import sampleConfig from './sample-config.json';
import { completeMissingTypeDesc, getDataMapperComponent } from "./util";
import { DataMapperInitVisitor as NewDataMapperInitVisitor, VisitingType } from './util/data-mapper-init-visitor';
import { DataMapperMappingVisitor } from './util/data-mapper-mapping-visitor';
import { DataMapperPositionVisitor as NewDataMapperPositionVisitor } from './util/data-mapper-position-visitor';
import { DataPointVisitor } from "./util/data-point-visitor";
// import sampleConfigJsonOutput from './sample-config-json.json';
// import sampleConfigAssignmentRecordOutput from './sample-assignment-record.json';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state
    } = useContext(DiagramContext);

    const {
        stSymbolInfo,
        onMutate: dispatchMutations,
        dataMapperConfig, // todo: revert
        currentApp
    } = state

    // const dataMapperConfig: any = sampleConfig; // todo: remove
    // const dataMapperConfig: any = sampleConfigJsonOutput; // todo: remove
    // const dataMapperConfig: any = sampleConfigAssignmentRecordOutput; // todo: remove
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());

    const onSave = (modifications: STModification[]) => {
        dispatchMutations(modifications);
    }

    let outputType: string = '';

    if (dataMapperConfig.outputType?.type && dataMapperConfig.outputType.type === 'record') {
        const typeInfo = dataMapperConfig.outputType.typeInfo;
        outputType = typeInfo.moduleName !== currentApp.name ?
            `${typeInfo.moduleName}:${typeInfo.name}`
            : typeInfo.name
    } else {
        outputType = dataMapperConfig.outputType.type;
    }

    const outputTypeConfig = dataMapperConfig.outputType as DataMapperOutputTypeInfo;

    let selectedNode;

    if (outputTypeConfig.generationType === GenerationType.NEW) {
        const outputTypeVariables = stSymbolInfo.variables.size > 0 ? stSymbolInfo.variables.get(outputType) : undefined;
        selectedNode = outputTypeVariables ?
            outputTypeVariables
                .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
            : undefined;
    } else {
        const outputTypeVariables = stSymbolInfo.variables.size > 0 ?
            stSymbolInfo.assignmentStatement.get(outputTypeConfig.variableName)
            : undefined;
        selectedNode = outputTypeVariables ?
            outputTypeVariables
                .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
            : undefined;
    }

    const inputComponents: JSX.Element[] = [];
    const outputComponent: JSX.Element[] = [];

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
                    (selectedNode.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
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
                        (variableInfo.node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
                            completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.INPUT);
                        })
                    }
                }
            }

            traversNode(variableInfo.node, positionVisitor);
            const { dataMapperViewState } = variableInfo.node;
            inputComponents.push(getDataMapperComponent(dataMapperViewState.type, { model: variableInfo.node, isMain: true }))
        });

        // selected node visit
        positionVisitor.setHeight(15);
        positionVisitor.setOffset(600);
        traversNode(selectedNode, positionVisitor);

        // datapoint visitor
        const dataPointVisitor = new DataPointVisitor(positionVisitor.getMaxOffset());
        inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
            traversNode(variableInfo.node, dataPointVisitor);
        });

        traversNode(selectedNode, dataPointVisitor);
        traversNode(selectedNode, new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap));

        outputComponent.push(getDataMapperComponent(selectedNode.dataMapperViewState.type, { model: selectedNode, isMain: true }))
    }

    return (
        <>
            <g id="outputComponent">
                <rect className="main-wrapper" width="280" height="300" rx="6" fill="green" x="640" y="60" />
                <text className="main-title-text" x="660" y="85"> Output</text>

                {outputComponent}
            </g>
            <g id="inputComponents">
                <rect className="main-wrapper" width="280" height="300" rx="6" x="80" y="60" />
                <text x="105" y="85" className="main-title-text"> Input</text>
                {inputComponents}
            </g>
            {/* {dataPoints} */}
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
            </DiagramOverlayContainer > */}
        </>
    )

}

export function addTypeDescInfo(node: STNode, recordMap: Map<string, STNode>) {
    let varTypeSymbol;

    if (STKindChecker.isLocalVarDecl(node) && node.initializer) {
        varTypeSymbol = node.initializer.typeData.typeSymbol;
    } else if (STKindChecker.isAssignmentStatement(node)) {
        if (STKindChecker.isSimpleNameReference(node.varRef)) {
            varTypeSymbol = node.varRef.typeData.typeSymbol;
        }
    }

    if (varTypeSymbol) {
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
                        node.dataMapperTypeDescNode = JSON.parse(JSON.stringify(recordMap.get(qualifiedKey)));
                    } else {
                        // todo: fetch record/object ST
                    }
                }
        }
    }
}
