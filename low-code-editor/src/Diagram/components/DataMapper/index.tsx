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
import React, { useContext, useEffect, useRef, useState } from 'react';

import {
    CaptureBindingPattern,
    LocalVarDecl,
    STKindChecker,
    STNode,
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { GenerationType } from '../ConfigForms/ProcessConfigForms/ProcessOverlayForm/AddDataMappingConfig/OutputTypeSelector';
import "../DataMapper/components/InputTypes/style.scss";
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../Portals/ConfigForm/types';

import { DataMapperWrapper } from './components/DataMapperWrapper';
import './components/InputTypes/style.scss';
import { Provider as DataMapperViewProvider } from './context/DataMapperViewContext';
import { dataMapperSizingAndPositioning, getDataMapperComponent } from './util';
import { DataMapperState } from './util/types';

// import sampleConfig from './sample-config.json';
// import sampleConfig from './sample-config.json';
// import sampleConfigJsonOutput from './sample-config-json.json';
// import sampleConfigAssignmentRecordOutput from './sample-assignment-record.json';
// import sampleConfigJsonInline from './sample-config-json-inline.json';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state, dataMapperStart, updateDataMapperConfig
    } = useContext(DiagramContext);

    const {
        appInfo,
        stSymbolInfo,
        onMutate: dispatchMutations,
        dataMapperConfig,
        currentApp,
        onFitToScreen
    } = state;

    useEffect(() => {
        onFitToScreen(appInfo?.currentApp?.id);
    }, []);

    // const dataMapperConfig: any = sampleConfigJsonInline; // todo: remove
    // const dataMapperConfig: any = sampleConfig; // todo: remove
    // const dataMapperConfig: any = sampleConfigJsonOutput; // todo: remove
    // const dataMapperConfig: any = sampleConfigAssignmentRecordOutput; // todo: remove
    const { width } = props;
    const [showAddVariableForm, setShowAddVariableForm] = useState(false);

    let outputSTNode; //

    let maxFieldWidth: number = 200;
    const inputSTNodes: STNode[] = [];

    if (dataMapperConfig) {
        const inputVariableInfo: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;

        inputVariableInfo.forEach(varInfo => {
            stSymbolInfo.variables.get(varInfo.type).forEach((node: STNode) => {
                let varName: string;
                if (STKindChecker.isLocalVarDecl(node)) {
                    varName = (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
                } else if (STKindChecker.isRequiredParam(node)) {
                    varName = node.paramName.value;
                }

                if (varName === varInfo.name) {
                    inputSTNodes.push(node);
                }
            });
        });

        let outputType: string = '';

        if (dataMapperConfig.outputType?.type) {
            switch (dataMapperConfig.outputType.type) {
                case 'record':
                    const typeInfo = dataMapperConfig.outputType.typeInfo;
                    outputType = typeInfo.moduleName !== currentApp.name ?
                        `${typeInfo.moduleName}:${typeInfo.name}`
                        : typeInfo.name;
                    break;
                case 'json':
                    outputType = 'json';
                    break;
                default:
                    outputType = dataMapperConfig.outputType.type;
            }
        }

        const outputTypeConfig = dataMapperConfig.outputType as DataMapperOutputTypeInfo;

        if (outputTypeConfig) {
            if (outputTypeConfig.generationType === GenerationType.NEW) {
                const outputTypeVariables = stSymbolInfo.variables.size > 0 ? stSymbolInfo.variables.get(outputType) : undefined;
                outputSTNode = outputTypeVariables ?
                    outputTypeVariables
                        .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
                    : undefined;
            } else {
                const outputTypeVariables = stSymbolInfo.variables.size > 0 ?
                    stSymbolInfo.assignmentStatement.get(outputTypeConfig.variableName)
                    : undefined;
                outputSTNode = outputTypeVariables ?
                    outputTypeVariables
                        .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
                    : undefined;
            }
        }

        const sizingAndPositioningResult = dataMapperSizingAndPositioning(
            inputSTNodes, outputSTNode, stSymbolInfo, showAddVariableForm, dataMapperConfig, updateDataMapperConfig);

        maxFieldWidth = sizingAndPositioningResult.maxFieldWidth;
    }


    const initialState: DataMapperState = {
        inputSTNodes,
        outputSTNode,
        stSymbolInfo,
        showAddVariableForm: false,
        showConfigureOutputForm: false,
        isExistingOutputSelected: false,
        isJsonRecordTypeSelected: false,
        dataMapperConfig,
        maxFieldWidth,
        updateDataMapperConfig,
        dataMapperStart,
        dispatchMutations
    }

    return (
        <>
            <DataMapperViewProvider initialState={initialState} >
                <DataMapperWrapper {...initialState} />
            </DataMapperViewProvider>
            {/* {!outputSTNode && <g><text x="45" y="30" onClick={handleSwitchBackToDiagram}>←  Back to the Diagram</text></g>}
            <g id="outputComponent">
                <rect className="main-wrapper" width={maxFieldWidth + 50 + 25} height={outputHeight} rx="6" fill="green" x={maxFieldWidth + 400 + 40} y="60" />
                <text className="main-title-text" x={maxFieldWidth + 400 + 60} y="85"> Output</text>
                {!outputSTNode && <OutputConfigureButton x={(maxFieldWidth * 2) + 400} y={70} onClick={toggleOutputConfigure} />}
                {outputSTNode && <SaveButton x={(maxFieldWidth * 2) + 400 + 32} y={saveYPosition} onClick={handleSwitchBackToDiagram} />}
                {outputComponent}
            </g>
            <g id="inputComponents">
                <rect className="main-wrapper" width={maxFieldWidth + 50} height={inputHeight} rx="6" x="80" y="60" />
                <text x="105" y="85" className="main-title-text"> Input</text>
                <AddVariableButton x={maxFieldWidth} y={70} onClick={toggleSelectVariable} />
                {inputComponents}
            </g>
            <g>
                <line
                    ref={drawingLineRef}
                    x1={-5}
                    x2={-5}
                    y1={-5}
                    y2={-5}
                    className="connect-line"
                    markerEnd="url(#arrowhead)"
                    id="Arrow-head"
                />
            </g>
            <DiagramOverlayContainer>
                {
                    expressionConfig && (
                        <DiagramOverlay
                            position={{
                                x: expressionConfig.positionX - (PADDING_OFFSET * 2.4),
                                y: expressionConfig.positionY - (PADDING_OFFSET / 2)
                            }}
                        >
                            <div className='expression-wrapper'>
                                <ExpressionEditor {...expressionConfig.config} />
                                <div className={overlayClasses.buttonWrapper}>
                                    <SecondaryButton
                                        text="Cancel"
                                        fullWidth={false}
                                        onClick={expressionEditorOnCancel}
                                    />
                                    <PrimaryButton
                                        disabled={isExpressionValid}
                                        dataTestId={"datamapper-save-btn"}
                                        text={"Save"}
                                        fullWidth={false}
                                        onClick={expressionEditorOnSave}
                                    />
                                </div>
                            </div>
                        </DiagramOverlay>
                    )
                }
                {
                    // todo: revert
                    showAddVariableForm && (
                        <DiagramOverlay
                            position={{ x: 105, y: 90 }}
                        >
                            <VariablePicker
                                fieldWidth={maxFieldWidth}
                                dataMapperConfig={dataMapperConfig}
                                toggleVariablePicker={toggleSelectVariable}
                            />
                        </DiagramOverlay>
                    )
                }
                {
                    showConfigureOutputForm && (
                        <DiagramOverlay
                            position={{ x: maxFieldWidth + 400 + 60, y: 90 }}

                        >
                            <OutputTypeConfigForm
                                fieldWidth={maxFieldWidth}
                                dataMapperConfig={dataMapperConfig}
                                toggleVariablePicker={toggleOutputConfigure}
                                onExistingVarOptionSelected={setIsExistingOutputSelected}
                                onJsonRecordTypeSelected={setIsJsonRecordTypeSelected}
                            />
                        </DiagramOverlay>
                    )
                }
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
