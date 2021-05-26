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
    LocalVarDecl,
    RecordTypeDesc,
    STKindChecker,
    STNode,
    traversNode
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { STModification } from '../../../Definitions';
import { updatePropertyStatement } from '../../utils/modification-util';
import { GenerationType } from '../ConfigForms/ProcessConfigForms/ProcessOverlayForm/AddDataMappingConfig/OutputTypeSelector';
import { wizardStyles } from '../ConfigForms/style';
import "../DataMapper/components/InputTypes/style.scss";
import { PrimaryButton } from '../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../Portals/ConfigForm/Elements/Button/SecondaryButton';
import ExpressionEditor from '../Portals/ConfigForm/Elements/ExpressionEditor';
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../Portals/ConfigForm/types';
import { DiagramOverlay, DiagramOverlayContainer } from '../Portals/Overlay';

import { OutputConfigureButton } from './components/buttons/OutputConfigureButton';
import { SaveButton } from './components/buttons/SaveButton';
import { AddVariableButton } from './components/buttons/SelectNewVariable';
import { OutputTypeConfigForm } from './components/forms/OutputTypeConfigForm';
import { VariablePicker } from './components/forms/VariablePicker';
import "./components/InputTypes/style.scss";
import { completeMissingTypeDesc, getDataMapperComponent } from "./util";
import { DataMapperInitVisitor, VisitingType } from './util/data-mapper-init-visitor';
import { DataMapperMappingVisitor } from './util/data-mapper-mapping-visitor';
import { DataMapperPositionVisitor, PADDING_OFFSET } from './util/data-mapper-position-visitor';
import { DataPointVisitor } from "./util/data-point-visitor";
import { DataMapperSizingVisitor } from './util/datamapper-sizing-visitor';
import { DataMapperViewState, SourcePointViewState, TargetPointViewState } from './viewstate';

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
        state, dataMapperStart
    } = useContext(DiagramContext);

    const {
        appInfo,
        stSymbolInfo,
        onMutate: dispatchMutations,
        dataMapperConfig, // todo: revert
        currentApp,
        onFitToScreen
    } = state
    const overlayClasses = wizardStyles();

    useEffect(() => {
        onFitToScreen(appInfo?.currentApp?.id);
    }, []);

    // const dataMapperConfig: any = sampleConfigJsonInline; // todo: remove
    // const dataMapperConfig: any = sampleConfig; // todo: remove
    // const dataMapperConfig: any = sampleConfigJsonOutput; // todo: remove
    // const dataMapperConfig: any = sampleConfigAssignmentRecordOutput; // todo: remove
    const { width } = props;
    const [appRecordSTMap, setAppRecordSTMap] = useState<Map<string, STNode>>(new Map());
    const [isDataPointSelected, setIsDataPointSelected] = useState(false);
    const [selectedDataPoint, setSelectedDataPoint] = useState(undefined);
    const [expressionConfig, setExpressionConfig] = useState(undefined);
    const [eventListenerMap] = useState<any>({});
    const [isExpressionValid, setIsExpressionValid] = useState(true);
    const [expressionEditorText, setExpressionEditorText] = useState(undefined);
    const [showAddVariableForm, setShowAddVariableForm] = useState(false);
    const [showConfigureOutputForm, setShowConfigureOutputForm] = useState(false);
    const drawingLineRef = useRef(null);

    const onSave = (modifications: STModification[]) => {
        dispatchMutations(modifications);
    }

    const toggleSelectVariable = () => {
        setShowAddVariableForm(!showAddVariableForm);
        setShowConfigureOutputForm(false);
    }

    const toggleOutputConfigure = () => {
        setShowConfigureOutputForm(!showConfigureOutputForm);
        setShowAddVariableForm(false);
    }

    const onDataPointClick = (dataPointVS: SourcePointViewState | TargetPointViewState) => {
        // current element is wrapped by a <g/> element
        const parentSVG = (drawingLineRef.current as SVGGraphicsElement).parentElement.parentElement.parentElement;

        if (parentSVG instanceof SVGSVGElement) {
            const ctm = (parentSVG as SVGSVGElement).getScreenCTM();
            const point = (parentSVG as SVGSVGElement).createSVGPoint();

            const onMouseMove = (evt: MouseEvent) => {
                point.x = evt.pageX;
                point.y = evt.pageY;
                const mappedPoint = point.matrixTransform(ctm.inverse());
                drawingLineRef.current.setAttribute('x2', mappedPoint.x - 5);
                drawingLineRef.current.setAttribute('y2', mappedPoint.y);
            }

            const escapeListener = (evt: any) => {
                if (evt.key === 'Escape') {
                    window.removeEventListener("mousemove", eventListenerMap.mousemove);
                    drawingLineRef.current.setAttribute('x1', -5);
                    drawingLineRef.current.setAttribute('x2', -5);
                    drawingLineRef.current.setAttribute('y1', -5);
                    drawingLineRef.current.setAttribute('y2', -5);
                    drawingLineRef.current.setAttribute('style', 'display: none;')
                    setSelectedDataPoint(undefined);
                    setIsDataPointSelected(false);
                    window.removeEventListener("keyup", eventListenerMap.keyup);
                }
            }

            if (isDataPointSelected && dataPointVS instanceof TargetPointViewState) {
                setIsDataPointSelected(false);
                setSelectedDataPoint(undefined);
                window.removeEventListener("mousemove", eventListenerMap.mousemove);
                eventListenerMap.mousemove = undefined;
                drawingLineRef.current.setAttribute('x1', -5);
                drawingLineRef.current.setAttribute('x2', -5);
                drawingLineRef.current.setAttribute('y1', -5);
                drawingLineRef.current.setAttribute('y2', -5);
                drawingLineRef.current.setAttribute('style', 'display: none;')
                onSave([updatePropertyStatement(selectedDataPoint.text, dataPointVS.position)])
            } else if (!isDataPointSelected && dataPointVS instanceof SourcePointViewState) {
                eventListenerMap.mousemove = onMouseMove;
                eventListenerMap.keyup = escapeListener
                drawingLineRef.current.setAttribute('x1', dataPointVS.bBox.x + 100);
                drawingLineRef.current.setAttribute('x2', dataPointVS.bBox.x + 92);
                drawingLineRef.current.setAttribute('y1', dataPointVS.bBox.y);
                drawingLineRef.current.setAttribute('y2', dataPointVS.bBox.y);
                drawingLineRef.current.setAttribute('style', '')
                setIsDataPointSelected(true);
                setSelectedDataPoint(dataPointVS);
                window.addEventListener('mousemove', eventListenerMap.mousemove);
                window.addEventListener('keyup', eventListenerMap.keyup);
            } else if (!isDataPointSelected && dataPointVS instanceof TargetPointViewState) {
                const validateFunction = (name: string, validity: boolean) => {
                    setIsExpressionValid(validity);
                }

                const onChange = (value: string) => {
                    setExpressionEditorText(value);
                }

                // todo: handle logic to show expression editor
                setExpressionConfig({
                    positionX: dataPointVS.bBox.x,
                    positionY: dataPointVS.bBox.y,
                    config: {
                        model: {
                            name: 'expression',
                            displayName: 'expression',
                            type: dataPointVS.type === 'union' ? dataPointVS.unionType : dataPointVS.type
                        },
                        customProps: {
                            validate: validateFunction,
                            tooltipTitle: '',
                            tooltipActionText: '',
                            tooltipActionLink: '',
                            interactive: true,
                            statementType: dataPointVS.type === 'union' ? dataPointVS.unionType : dataPointVS.type,
                            editPosition: { line: dataMapperConfig.outputType.startLine, column: undefined }
                        },
                        onChange,
                        defaultValue: dataPointVS.value,
                    }
                });
                setSelectedDataPoint(dataPointVS);
            }
        }
    }

    const expressionEditorOnCancel = () => {
        setExpressionConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
    }

    const expressionEditorOnSave = () => {
        onSave([updatePropertyStatement(expressionEditorText, selectedDataPoint.position)]);
        setExpressionConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
    }


    const inputComponents: JSX.Element[] = [];
    const outputComponent: JSX.Element[] = [];

    let selectedNode;

    let maxFieldWidth: number = 200;
    let inputHeight: number = 100;
    let outputHeight: number = 100;

    if (dataMapperConfig) {
        const inputVariables: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;
        const positionVisitor = new DataMapperPositionVisitor(15, 15);
        const dataMapperInputSizingVisitor = new DataMapperSizingVisitor();

        if (dataMapperConfig.inputTypes.length > 0) {
            inputHeight = 0; // reset height from default value

            inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
                const varSTNode: LocalVarDecl = variableInfo.node as LocalVarDecl;
                addTypeDescInfo(varSTNode, stSymbolInfo.recordTypeDescriptions);
                traversNode(variableInfo.node, new DataMapperInitVisitor(VisitingType.INPUT));

                if (variableInfo.node.dataMapperTypeDescNode) {
                    switch (variableInfo.node.dataMapperTypeDescNode.kind) {
                        case 'RecordTypeDesc': {
                            (variableInfo.node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
                                completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.INPUT);
                            })
                        }
                    }
                }
            });

            inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
                const varSTNode: LocalVarDecl = variableInfo.node as LocalVarDecl;
                traversNode(varSTNode, dataMapperInputSizingVisitor);
            });

            inputVariables.forEach((variableInfo: DataMapperInputTypeInfo, i: number) => {
                inputHeight += (variableInfo.node.dataMapperViewState as DataMapperViewState).bBox.h;
                if (i < inputVariables.length - 1) {
                    inputHeight += 40 // todo: convert to constant
                }
            });

            inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
                traversNode(variableInfo.node, positionVisitor);
            });
            maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();

            dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
                viewstate.bBox.w = maxFieldWidth;
            });
        }

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
        }



        if (selectedNode) {
            /*
             * flow:
             * Run init visitors and set defaults for everything
             * Run sizing visitor and calculate height and width for input and output seperately
             * Run position visitor and set the positions
             *
             */
            outputHeight = 0; // reset height from default value
            // start: Initialization
            addTypeDescInfo(selectedNode, stSymbolInfo.recordTypeDescriptions);
            traversNode(selectedNode, new DataMapperInitVisitor(VisitingType.OUTPUT));

            if (selectedNode.dataMapperTypeDescNode) {
                switch (selectedNode.dataMapperTypeDescNode.kind) {
                    case 'RecordTypeDesc': {
                        (selectedNode.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
                            completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.OUTPUT);
                        })
                    }
                }
            }
            // end: Initialization

            // start: sizing visitor
            const dataMapperOutputSizingVisitor = new DataMapperSizingVisitor();
            traversNode(selectedNode, dataMapperOutputSizingVisitor);

            if (dataMapperInputSizingVisitor.getMaxWidth() < dataMapperOutputSizingVisitor.getMaxWidth()) {
                maxFieldWidth = dataMapperOutputSizingVisitor.getMaxWidth();
            } else if (dataMapperInputSizingVisitor.getMaxWidth() > dataMapperOutputSizingVisitor.getMaxWidth()) {
                maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
            } else {
                maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
            }

            dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
                viewstate.bBox.w = maxFieldWidth;
            });

            dataMapperOutputSizingVisitor.getViewStateMap().forEach(viewstate => {
                viewstate.bBox.w = maxFieldWidth;
            });

            outputHeight = ((selectedNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
            // end: sizing visitor

            // selected node visit
            positionVisitor.setHeight(15);
            positionVisitor.setOffset(maxFieldWidth + 400);
            traversNode(selectedNode, positionVisitor);

            outputComponent.push(getDataMapperComponent(selectedNode.dataMapperViewState.type, { model: selectedNode, isMain: true, onDataPointClick, offSetCorrection: 10 }))
        }

        // datapoint poisitions
        const dataPointVisitor = new DataPointVisitor(maxFieldWidth, maxFieldWidth + 400 - 25);

        if (inputVariables.length > 0) {
            inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
                traversNode(variableInfo.node, dataPointVisitor);
            });
        }

        if (selectedNode) {
            traversNode(selectedNode, dataPointVisitor);
            traversNode(selectedNode, new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap));
        }

        inputVariables.forEach((variableInfo: DataMapperInputTypeInfo) => {
            const { dataMapperViewState } = variableInfo.node;
            inputComponents.push(getDataMapperComponent(dataMapperViewState.type, { model: variableInfo.node, isMain: true, onDataPointClick, offSetCorrection: 10 }))
        });
    }
    return (
        <>
            <g id="outputComponent">
                <rect className="main-wrapper" width={maxFieldWidth + 50 + 25} height={outputHeight + 65} rx="6" fill="green" x={maxFieldWidth + 400 + 40} y="60" />
                <text className="main-title-text" x={maxFieldWidth + 400 + 60} y="85"> Output</text>
                <SaveButton x={(maxFieldWidth * 2) + 400 + 75 - 32} y={65} onClick={() => { dataMapperStart(undefined); }} />
                <OutputConfigureButton x={(maxFieldWidth * 2) + 400 - 64} y={65} onClick={toggleOutputConfigure} />
                {outputComponent}
            </g>
            <g id="inputComponents">
                <rect className="main-wrapper" width={maxFieldWidth + 50} height={inputHeight + 65} rx="6" x="80" y="60" />
                <text x="105" y="85" className="main-title-text"> Input</text>
                <AddVariableButton x={maxFieldWidth + 50} y={65} onClick={toggleSelectVariable} />
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
                            position={{ x: expressionConfig.positionX - (PADDING_OFFSET * 2.4), y: expressionConfig.positionY - (PADDING_OFFSET / 2) }}
                        >
                            <div className='expression-wrapper'>
                                <ExpressionEditor {...expressionConfig.config} />
                                <div className={overlayClasses.buttonWrapper}>
                                    <SecondaryButton text="Cancel" fullWidth={false} onClick={expressionEditorOnCancel} />
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
                    showAddVariableForm && (
                        <DiagramOverlay
                            position={{ x: maxFieldWidth + 50 + 64, y: 65 }}

                        >
                            <VariablePicker dataMapperConfig={dataMapperConfig} toggleVariablePicker={toggleSelectVariable} />
                        </DiagramOverlay>
                    )
                }
                {
                    showConfigureOutputForm && (
                        <DiagramOverlay
                            position={{ x: (maxFieldWidth * 2) + 400 - 64, y: 65 }}

                        >
                            <OutputTypeConfigForm dataMapperConfig={dataMapperConfig} toggleVariablePicker={toggleOutputConfigure} />
                        </DiagramOverlay>
                    )
                }
            </DiagramOverlayContainer >
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
