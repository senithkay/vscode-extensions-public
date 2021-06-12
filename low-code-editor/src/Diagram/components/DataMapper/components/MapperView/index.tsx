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

import { CaptureBindingPattern, STKindChecker, STNode } from '@ballerina/syntax-tree';

import { STModification } from '../../../../../Definitions';
import { updatePropertyStatement } from '../../../../utils/modification-util';
import { wizardStyles } from '../../../ConfigForms/style';
import { PrimaryButton } from '../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import ExpressionEditor from '../../../Portals/ConfigForm/Elements/ExpressionEditor';
import { DataMapperInputTypeInfo } from '../../../Portals/ConfigForm/types';
import { DiagramOverlay, DiagramOverlayContainer } from '../../../Portals/Overlay';
import { Context as DataMapperViewContext } from '../../context/DataMapperViewContext';
import { getDataMapperComponent } from '../../util';
import { PADDING_OFFSET } from '../../util/data-mapper-position-visitor';
import { MouseEventHub } from '../../util/mouse-event-hub';
import { DataMapperViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from '../../viewstate';
import { OutputConfigureButton } from '../buttons/OutputConfigureButton';
import { SaveButton } from '../buttons/SaveButton';
import { AddVariableButton } from '../buttons/SelectNewVariable';
import { OutputTypeConfigForm } from '../forms/OutputTypeConfigForm';
import { VariablePicker } from '../forms/VariablePicker';
import { Canvas } from '../../../Canvas';


interface MapperViewProps {

}

export function MapperView(props: MapperViewProps) {
    const {
        state: {
            inputSTNodes,
            outputSTNode,
            constantMap,
            maxFieldWidth,
            showAddVariableForm,
            showConfigureOutputForm,
            isExistingOutputSelected,
            isJsonRecordTypeSelected,
            dataMapperStart,
            dispatchMutations,
            dataMapperConfig,
            updateDataMapperConfig,
            mouseMoveEventHub,
            constantList,
            squashConstants
        },
        updateState,
        dataMapperViewRedraw,
        toggleAddVariableForm,
        toggleOutputConfigureForm,
    } = useContext(DataMapperViewContext);
    const drawingLineRef = useRef(null);
    const overlayClasses = wizardStyles();

    const [isDataPointSelected, setIsDataPointSelected] = useState(false);
    const [selectedDataPoint, setSelectedDataPoint] = useState(undefined);
    const [expressionConfig, setExpressionConfig] = useState(undefined);
    const [eventListenerMap] = useState<any>({});
    const [isExpressionValid, setIsExpressionValid] = useState(true);
    const [expressionEditorText, setExpressionEditorText] = useState(undefined);

    const handleAddVariableClick = () => {
        toggleAddVariableForm();
        dataMapperViewRedraw(outputSTNode);
    }

    const handleSwitchBackToDiagram = () => {
        dataMapperStart(undefined);
    }

    const onSave = (modifications: STModification[]) => {
        dispatchMutations(modifications);
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

    const removeInputType = (model: STNode) => {
        if (STKindChecker.isLocalVarDecl(model)) {
            const varName = (model.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            const index = dataMapperConfig.inputTypes
                .map((inputType: DataMapperInputTypeInfo) => inputType.name)
                .indexOf(varName);

            dataMapperConfig.inputTypes.splice(index, 1);
            updateDataMapperConfig(dataMapperConfig);
        }
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

    // ToDo: Revisit
    // useEffect(() => {
    //     const parentSVG = (drawingLineRef.current as SVGGraphicsElement).parentElement.parentElement.parentElement;

    //     if (parentSVG instanceof SVGSVGElement) {
    //         const ctm = (parentSVG as SVGSVGElement).getScreenCTM();
    //         const point = (parentSVG as SVGSVGElement).createSVGPoint();

    //         const updatePositionMouseMove = (evt: MouseEvent) => {
    //             point.x = evt.pageX;
    //             point.y = evt.pageY;
    //             const mappedPoint = point.matrixTransform(ctm.inverse());
    //             // mouseMoveEventHub.updateCursorPosition({ x: mappedPoint.x, y: mappedPoint.y })
    //             getEventHub().updateCursorPosition({ x: mappedPoint.x, y: mappedPoint.y });
    //         }

    //         eventListenerMap.positionListener = updatePositionMouseMove;
    //         window.addEventListener('mousemove', eventListenerMap.positionListener);
    //     }

    //     return () => {
    //         window.removeEventListener('mousemove', eventListenerMap.positionListener);
    //         eventListenerMap.positionListener = undefined;
    //     }
    // }, []);

    const inputComponents: JSX.Element[] = [];
    const outputComponent: JSX.Element[] = [];

    let inputHeight: number = 0;
    let outputHeight: number = 0;

    inputSTNodes.forEach((node: STNode, i: number) => {
        inputHeight += (node.dataMapperViewState as DataMapperViewState).bBox.h;
        if (i < inputSTNodes.length - 1 || inputSTNodes.length > 0) {
            inputHeight += 40; // todo: convert to constant
        }
    });

    let constantCount: number = 0;

    if (squashConstants) {
        constantMap.forEach((constantVS: FieldViewState) => {
            inputHeight += constantVS.bBox.h;

            if (constantCount < constantMap.size - 1) {
                inputHeight += 40 // todo: convert to constant
            }

            constantCount++;
        });
    } else {
        constantList.forEach((constantVS: FieldViewState) => {
            inputHeight += constantVS.bBox.h;

            if (constantCount < constantList.length - 1) {
                inputHeight += 40 // todo: convert to constant
            }

            constantCount++;
        });
    }

    if (outputSTNode) {
        outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
    }

    if (inputSTNodes.length > 0 || constantMap.size > 0) {
        inputHeight += 65;
    } else {
        inputHeight += 40;
    }

    if (outputSTNode) {
        outputHeight += 65 // + 55; //  + save button height
    } else {
        outputHeight += 40;
    }

    if (showAddVariableForm) {
        inputHeight += 117
    }

    if (showConfigureOutputForm && !isExistingOutputSelected) {
        if (isJsonRecordTypeSelected) {
            outputHeight += 332;
        } else {
            outputHeight += 265;
        }
    }

    if (showConfigureOutputForm && isExistingOutputSelected) {
        outputHeight += 172;
    }

    // save button x position
    let saveYPosition = outputHeight;
    if (outputSTNode) {
        const dataMapperViewState: DataMapperViewState = (outputSTNode as STNode).dataMapperViewState;
        if (dataMapperViewState) {
            saveYPosition = dataMapperViewState.bBox.h + 100 + 15;
        }
    }

    if (squashConstants) {
        constantMap.forEach((constantVS: FieldViewState) => {
            inputComponents.push(
                getDataMapperComponent(
                    constantVS.type,
                    { viewState: constantVS, offSetCorrection: 10 }
                )
            );
        });
    } else {
        constantList.forEach((constantVS: FieldViewState) => {
            inputComponents.push(
                getDataMapperComponent(
                    constantVS.type,
                    { viewState: constantVS, offSetCorrection: 10 }
                )
            );
        });
    }

    inputSTNodes.forEach((node: STNode) => {
        const { dataMapperViewState } = node;
        if (dataMapperViewState) {
            inputComponents.push(
                getDataMapperComponent(
                    dataMapperViewState.type,
                    { model: node, isMain: true, onDataPointClick, offSetCorrection: 10, removeInputType }
                )
            );
        }
    });

    if (outputSTNode) {
        const onAddFieldButtonClick = () => {
            dataMapperViewRedraw(outputSTNode);
        }

        outputComponent.push(
            getDataMapperComponent(
                outputSTNode.dataMapperViewState.type,
                { model: outputSTNode, isMain: true, onDataPointClick, offSetCorrection: 10, onAddFieldButtonClick, isTarget: true }
            )
        );
    }

    let maxHeight = (inputHeight >= outputHeight ? inputHeight : outputHeight) + 65;
    const maxWidth = maxFieldWidth * 2 + 100 + 400

    if (maxHeight < window.innerHeight) {
        // correction if the diagram is smaller than the window height
        // required for the diagram scrolling
        maxHeight = maxHeight + (window.innerHeight - maxHeight);
    }

    return (
        <Canvas h={maxHeight} w={maxWidth} >
            <g id='datamapper-diagram-switch'>
                <text x="45" y="30" onClick={handleSwitchBackToDiagram}>←  Back to the Diagram</text>
            </g>
            <g id="outputComponent">
                <rect className="main-wrapper" width={maxFieldWidth + 50 + 25} height={outputHeight} rx="6" fill="green" x={maxFieldWidth + 400 + 40} y="60" />
                <text className="main-title-text" x={maxFieldWidth + 400 + 60} y="85"> Output</text>
                <OutputConfigureButton x={(maxFieldWidth * 2) + 400} y={70} onClick={toggleOutputConfigureForm} />
                {/* {outputSTNode && <SaveButton x={(maxFieldWidth * 2) + 400 + 32} y={saveYPosition} onClick={handleSwitchBackToDiagram} />} */}
                {outputComponent}
            </g>
            <g id="inputComponents">
                <rect className="main-wrapper" width={maxFieldWidth + 50} height={inputHeight} rx="6" x="80" y="60" />
                <text x="105" y="85" className="main-title-text"> Input</text>
                <AddVariableButton x={maxFieldWidth} y={70} onClick={handleAddVariableClick} />
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
            {
                expressionConfig && (
                    <DiagramOverlayContainer>
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

                    </DiagramOverlayContainer >
                )
            }
            {
                // todo: revert
                showAddVariableForm && (
                    <DiagramOverlayContainer>
                        <DiagramOverlay
                            position={{ x: 105, y: 90 }}
                        >
                            <VariablePicker />
                        </DiagramOverlay>
                    </DiagramOverlayContainer>
                )
            }
            {
                showConfigureOutputForm && (
                    <DiagramOverlayContainer>
                        <DiagramOverlay
                            position={{ x: maxFieldWidth + 400 + 60, y: 90 }}

                        >
                            <OutputTypeConfigForm />
                        </DiagramOverlay>
                    </DiagramOverlayContainer>
                )
            }
        </Canvas>
    )
}
