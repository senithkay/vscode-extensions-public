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
import React, { useContext, useRef, useState } from 'react';

import Typography from '@material-ui/core/Typography';
import {
    PrimaryButton,
    PrimitiveBalType,
    SecondaryButton,
    STModification
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { CaptureBindingPattern, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { updatePropertyStatement } from '../../../../../../../utils/modification-util';
import { wizardStyles } from '../../../../../../FormComponents/ConfigForms/style';
import { LowCodeExpressionEditor } from "../../../../../../FormComponents/FormFieldComponents/LowCodeExpressionEditor";
import { DataMapperInputTypeInfo } from '../../../../../../FormComponents/Types';
import { DiagramOverlay, DiagramOverlayContainer } from '../../../../../../Portals/Overlay';
import { Canvas } from '../../../../../Canvas';
import { Context as DataMapperViewContext } from '../../context/DataMapperViewContext';
import { getDataMapperComponent, INPUT_OUTPUT_GAP } from '../../util';
import { PADDING_OFFSET } from '../../util/data-mapper-position-visitor';
import { DataMapperViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from '../../viewstate';
import { OutputConfigureButton } from '../buttons/OutputConfigureButton';
import { AddVariableButton } from '../buttons/SelectNewVariable';
import { OutputTypeConfigForm } from '../forms/OutputTypeConfigForm';
import { VariablePicker } from '../forms/VariablePicker';

export function MapperView() {
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
            constantList,
            squashConstants,
            isInitializationInProgress, // todo: handle animation during initialization
            draftArrows
        },
        updateState,
        dataMapperViewRedraw,
        toggleAddVariableForm,
        toggleOutputConfigureForm,
        addDraftArrow
    } = useContext(DataMapperViewContext);
    const drawingLineRef = useRef(null);
    const overlayClasses = wizardStyles();

    const [isDataPointSelected, setIsDataPointSelected] = useState(false);
    const [selectedSourceDataPoint, setSelectedSourceDataPoint] = useState(undefined);
    const [selectedTargetDataPoint, setSelectedTargetDataPoint] = useState(undefined);
    const [showTypeConviertConfirmationDialog, setShowTypeConfirmationDialog] = useState(false);
    const [expressionConfig, setExpressionConfig] = useState(undefined);
    const [defaultInputConfig, setDefaultInputConfig] = useState(undefined);
    const [eventListenerMap] = useState<any>({});
    const [isExpressionValid, setIsExpressionValid] = useState(true);
    const [expressionEditorText, setExpressionEditorText] = useState(undefined);
    const [hasTypeMismatch, setHasTypeMismatch] = useState(false);

    const handleAddVariableClick = () => {
        toggleAddVariableForm();
        dataMapperViewRedraw(outputSTNode);
    }

    const handleOutputConfigureBtnClick = () => {
        toggleOutputConfigureForm();
        dataMapperViewRedraw(outputSTNode);
    };

    const handleSwitchBackToDiagram = () => {
        dataMapperStart(undefined);
    }

    const onSave = (modifications: STModification[]) => {
        dispatchMutations(modifications);
    }

    const handleTypeConversionConfirmation = () => {
        let statement = '';
        let showDefaultValueForm = false

        if (selectedSourceDataPoint.isOptionalType && !selectedTargetDataPoint.isOptionalType) {
            switch (selectedTargetDataPoint.type) {
                case PrimitiveBalType.String:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            statement = `${selectedSourceDataPoint.text}.toString()`;
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${selectedSourceDataPoint.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Int:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Float:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Decimal:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Int:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Boolean:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                default:
                // unmappable
            }
        } else if (selectedTargetDataPoint.isOptionalType && selectedSourceDataPoint.isOptionalType) {
            switch (selectedTargetDataPoint.type) {
                case PrimitiveBalType.String:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            statement = `${selectedSourceDataPoint.text}.toString()`
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Int:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Float:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Decimal:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Boolean:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.String:
                            showDefaultValueForm = true;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                default:
                // unmappable
            }
        } else {
            switch (selectedTargetDataPoint.type) {
                case PrimitiveBalType.String:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            statement = `${selectedSourceDataPoint.text}.toString()`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Int:
                case PrimitiveBalType.Decimal:
                case PrimitiveBalType.Float:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            statement = `<${selectedTargetDataPoint.type}> ${selectedSourceDataPoint.text}`;
                            break;
                        case PrimitiveBalType.String:
                            statement = `check ${selectedTargetDataPoint.type}:fromString(${selectedSourceDataPoint.text})`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Boolean:
                    switch (selectedSourceDataPoint.type) {
                        case PrimitiveBalType.String:
                            statement = `check ${selectedTargetDataPoint.type}:fromString(${selectedSourceDataPoint.text})`;
                            break;
                        default:
                        // unmappable
                    }
                default:
                // unmappable
            }
        }

        if (showDefaultValueForm) {
            const validateFunction = (name: string, validity: boolean) => {
                setIsExpressionValid(validity);
            }

            const onChange = (value: string) => {
                setExpressionEditorText(value);
            }

            setDefaultInputConfig({
                positionX: selectedTargetDataPoint.bBox.x,
                positionY: selectedTargetDataPoint.bBox.y,
                config: {
                    model: {
                        name: 'expression',
                        displayName: 'expression',
                        type:
                            selectedSourceDataPoint.type === 'union' ?
                                selectedSourceDataPoint.unionType
                                : selectedSourceDataPoint.type
                    },
                    customProps: {
                        validate: validateFunction,
                        tooltipTitle: '',
                        tooltipActionText: '',
                        tooltipActionLink: '',
                        interactive: true,
                        statementType: selectedSourceDataPoint.type === 'union' ?
                            selectedSourceDataPoint.unionType
                            : selectedSourceDataPoint.type,
                        editPosition: { line: dataMapperConfig.outputType.startLine, column: undefined }
                    },
                    onChange,
                    defaultValue: '',
                }
            });

        }

        if (statement.length > 0) {
            onSave([
                updatePropertyStatement(statement, selectedTargetDataPoint.position)
            ]);

            setSelectedSourceDataPoint(undefined);
            setSelectedTargetDataPoint(undefined);
        }

        setShowTypeConfirmationDialog(false);
        setShowTypeConfirmationDialog(false);
    };

    const handleTypeConversionCancel = () => {
        setShowTypeConfirmationDialog(false);
        setSelectedSourceDataPoint(undefined);
        setSelectedTargetDataPoint(undefined);
        updateState({ draftArrows: [] })
    };

    const expressionEditorOnCancel = () => {
        setExpressionConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
    }


    const expressionEditorOnSave = () => {
        onSave([updatePropertyStatement(expressionEditorText, selectedSourceDataPoint.position)]);
        setExpressionConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
    }

    const defaultInputConfigOnSave = () => {
        if (hasTypeMismatch) {
            let statement = '';
            if ((selectedTargetDataPoint.type === PrimitiveBalType.Int
                || selectedTargetDataPoint.type === PrimitiveBalType.Float
                || selectedTargetDataPoint.type === PrimitiveBalType.Decimal
                || selectedTargetDataPoint.type === PrimitiveBalType.Boolean)
                && selectedSourceDataPoint.type === PrimitiveBalType.String) {
                statement += `check ${selectedTargetDataPoint.type}:fromString((${selectedSourceDataPoint.text} ?: ${expressionEditorText}))`;
            } else if ((selectedSourceDataPoint.type === PrimitiveBalType.Int
                || selectedSourceDataPoint.type === PrimitiveBalType.Float
                || selectedSourceDataPoint.type === PrimitiveBalType.Decimal)
                && selectedTargetDataPoint.type === PrimitiveBalType.String) {
                statement += `(${selectedSourceDataPoint.text} ?: ${expressionEditorText}).toString()`;
            }

            onSave([updatePropertyStatement(statement, selectedTargetDataPoint.position)]);
            setHasTypeMismatch(false);
        } else {
            const statement = `${selectedSourceDataPoint.text} ?: ${expressionEditorText}`;
            onSave([updatePropertyStatement(statement, selectedTargetDataPoint.position)]);
        }

        setDefaultInputConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
        setSelectedSourceDataPoint(undefined);
        setSelectedTargetDataPoint(undefined);
    }

    const defaultInputConfigOnCancel = () => {
        setDefaultInputConfig(undefined);
        setExpressionEditorText(undefined);
        setIsExpressionValid(false);
        setSelectedSourceDataPoint(undefined);
        setSelectedTargetDataPoint(undefined);
        updateState({ draftArrows: [] })
    }

    const removeInputType = (model: STNode) => {
        let varName = '';
        if (STKindChecker.isLocalVarDecl(model)) {
            varName = (model.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
        } else if (STKindChecker.isAssignmentStatement(model)) {
            if (STKindChecker.isSimpleNameReference(model.varRef)) {
                varName = model.varRef.name.value
            }
        } else if (STKindChecker.isRequiredParam(model)) {
            varName = model.paramName.value;
        } else if (model.kind === 'ResourcePathSegmentParam') {
            varName = (model as any).paramName.value;
        }

        if (varName.length > 0) {
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
                    setSelectedSourceDataPoint(undefined);
                    setIsDataPointSelected(false);
                    window.removeEventListener("keyup", eventListenerMap.keyup);
                }
            }

            if (isDataPointSelected && dataPointVS instanceof TargetPointViewState) {
                setIsDataPointSelected(false);
                // setSelectedDataPoint(undefined);
                window.removeEventListener("mousemove", eventListenerMap.mousemove);
                eventListenerMap.mousemove = undefined;
                drawingLineRef.current.setAttribute('x1', -5);
                drawingLineRef.current.setAttribute('x2', -5);
                drawingLineRef.current.setAttribute('y1', -5);
                drawingLineRef.current.setAttribute('y2', -5);
                drawingLineRef.current.setAttribute('style', 'display: none;')
                updateMappingStatement(selectedSourceDataPoint, dataPointVS);
            } else if (!isDataPointSelected && dataPointVS instanceof SourcePointViewState) {
                eventListenerMap.mousemove = onMouseMove;
                eventListenerMap.keyup = escapeListener
                drawingLineRef.current.setAttribute('x1', dataPointVS.bBox.x + 100);
                drawingLineRef.current.setAttribute('x2', dataPointVS.bBox.x + 92);
                drawingLineRef.current.setAttribute('y1', dataPointVS.bBox.y);
                drawingLineRef.current.setAttribute('y2', dataPointVS.bBox.y);
                drawingLineRef.current.setAttribute('style', '')
                setIsDataPointSelected(true);
                setSelectedSourceDataPoint(dataPointVS);
                window.addEventListener('mousemove', eventListenerMap.mousemove);
                window.addEventListener('keyup', eventListenerMap.keyup);
            } else if (!isDataPointSelected && dataPointVS instanceof TargetPointViewState) {
                const validateFunction = (name: string, validity: boolean) => {
                    setIsExpressionValid(validity);
                }

                const onChange = (value: string) => {
                    setExpressionEditorText(value);
                }

                let type = '';
                switch (dataPointVS.type) {
                    case PrimitiveBalType.Union:
                        type = dataPointVS.unionType;
                        break;
                    case PrimitiveBalType.Array:
                        // type = convertMemberViewStateToString(dataPointVS);
                        break;
                    default:
                        type = dataPointVS.type;
                }

                setExpressionConfig({
                    positionX: dataPointVS.bBox.x,
                    positionY: dataPointVS.bBox.y,
                    config: {
                        model: {
                            name: 'expression',
                            displayName: 'expression',
                            type: dataPointVS.type === 'union' ? dataPointVS.unionType
                                : dataPointVS.isOptionalType ?
                                    `${dataPointVS.type}?` : dataPointVS.type
                        },
                        customProps: {
                            validate: validateFunction,
                            tooltipTitle: '',
                            tooltipActionText: '',
                            tooltipActionLink: '',
                            interactive: true,
                            statementType: dataPointVS.type === 'union' ? dataPointVS.unionType
                                : dataPointVS.isOptionalType ?
                                    `${dataPointVS.type}?` : dataPointVS.type,
                            editPosition: { line: dataMapperConfig.outputType.startLine, column: undefined }
                        },
                        onChange,
                        defaultValue: dataPointVS.value
                    }
                });
                setSelectedSourceDataPoint(dataPointVS);
            }
        }
    }

    const updateMappingStatement = (
        sourcePointViewState: SourcePointViewState, targetPointViewState: TargetPointViewState) => {
        let statement = '';

        addDraftArrow({
            x1: sourcePointViewState.bBox.x,
            x2: targetPointViewState.bBox.x,
            y1: sourcePointViewState.bBox.y,
            y2: targetPointViewState.bBox.y
        });

        let showDefaultConfirmation = false;

        if (!targetPointViewState.isOptionalType && sourcePointViewState.isOptionalType) {
            switch (targetPointViewState.type) {
                case PrimitiveBalType.String:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.String:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Int:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Int:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Float:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Float:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Decimal:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Decimal:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Int:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Json:
                    showDefaultConfirmation = true;
                    break;
                case PrimitiveBalType.Boolean:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Boolean:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                default:
                // unmappable
            }
        } else if (targetPointViewState.isOptionalType && sourcePointViewState.isOptionalType) {
            switch (targetPointViewState.type) {
                case PrimitiveBalType.String:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.String:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Int:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Int:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Float:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Float:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Decimal:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Decimal:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                case PrimitiveBalType.Json:
                    showDefaultConfirmation = true;
                    break;
                case PrimitiveBalType.Boolean:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Boolean:
                            showDefaultConfirmation = true;
                            break;
                        case PrimitiveBalType.String:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappable
                    }
                    break;
                default:
                // unmappable
            }
        } else {
            switch (targetPointViewState.type) {
                case PrimitiveBalType.String:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.String:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.Boolean:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappableÎ
                    }
                    break;
                case PrimitiveBalType.Int:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Int:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappableÎ
                    }
                    break;
                case PrimitiveBalType.Float:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Float:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Decimal:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappableÎ
                    }
                    break;
                case PrimitiveBalType.Decimal:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Decimal:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        default:
                        // unmappableÎ
                    }
                    break;
                case PrimitiveBalType.Json:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Decimal:
                        case PrimitiveBalType.String:
                        case PrimitiveBalType.Int:
                        case PrimitiveBalType.Float:
                        case PrimitiveBalType.Boolean:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.Json:
                            statement = `check ${sourcePointViewState.text}`;
                            break;
                        case PrimitiveBalType.Array:
                            statement = `check ${sourcePointViewState.text}`;
                        default:
                        // unmappableÎ
                    }
                    break;
                case PrimitiveBalType.Boolean:
                    switch (sourcePointViewState.type) {
                        case PrimitiveBalType.Boolean:
                            statement = sourcePointViewState.text;
                            break;
                        case PrimitiveBalType.String:
                            setSelectedTargetDataPoint(targetPointViewState);
                            setHasTypeMismatch(true);
                            setShowTypeConfirmationDialog(true);
                            break;
                        default:
                        // unmappable
                    }
                    break;
                default:
                    statement = sourcePointViewState.text;
            }
        }

        if (showDefaultConfirmation) {
            const validateFunction = (name: string, validity: boolean) => {
                setIsExpressionValid(validity);
            }

            const onChange = (value: string) => {
                setExpressionEditorText(value);
            }

            setSelectedTargetDataPoint(targetPointViewState);
            setDefaultInputConfig({
                positionX: targetPointViewState.bBox.x,
                positionY: targetPointViewState.bBox.y,
                config: {
                    model: {
                        name: 'expression',
                        displayName: 'expression',
                        type:
                            sourcePointViewState.type === 'union' ?
                                sourcePointViewState.unionType
                                : sourcePointViewState.type,
                    },
                    customProps: {
                        validate: validateFunction,
                        tooltipTitle: '',
                        tooltipActionText: '',
                        tooltipActionLink: '',
                        interactive: true,
                        statementType: sourcePointViewState.type === 'union' ? sourcePointViewState.unionType
                            : sourcePointViewState.type,
                        editPosition: { line: dataMapperConfig.outputType.startLine, column: undefined }
                    },
                    onChange,
                    defaultValue: '',
                }
            });
        }

        if (statement.length > 0) {
            onSave([
                updatePropertyStatement(statement, targetPointViewState.position)
            ]);
        }
    }

    const inputComponents: JSX.Element[] = [];
    const outputComponent: JSX.Element[] = [];

    let inputHeight: number = 0;
    let outputHeight: number = 0;

    inputSTNodes.forEach((node: STNode, i: number) => {
        if (node.dataMapperViewState) {
            inputHeight += (node.dataMapperViewState as DataMapperViewState).bBox.h;
            if (i < inputSTNodes.length - 1) {
                inputHeight += 40; // todo: convert to constant
            }
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

    // gap between constant types and variables
    if ((constantList.size > 0 || constantList.length > 0) && inputSTNodes.length > 0) {
        inputHeight += 40;
    }

    // space for add variable button
    if ((inputSTNodes.length > 0 || constantMap.size > 0 || constantList.length > 0)) {
        inputHeight += 40;
    }

    if (outputSTNode && outputSTNode.dataMapperViewState) {
        outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
    }

    if (inputSTNodes.length > 0 || constantMap.size > 0 || constantList.length > 0) {
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
        inputHeight += 117; // remove the space left for button if form is open
    }

    if (showConfigureOutputForm && !isExistingOutputSelected) {
        if (isJsonRecordTypeSelected) {
            outputHeight += 332 + 64 + 80;
        } else {
            outputHeight += 265 + 64;
        }

        outputHeight += 35 // compensation incase of some error is displayed through a text field
    }

    if (showConfigureOutputForm && isExistingOutputSelected) {
        outputHeight += 172 + 64;
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
        if (outputSTNode.dataMapperViewState) {
            const onAddFieldButtonClick = () => {
                dataMapperViewRedraw(outputSTNode);
            }

            outputComponent.push(
                getDataMapperComponent(
                    outputSTNode.dataMapperViewState.type,
                    {
                        model: outputSTNode,
                        isMain: true,
                        onDataPointClick,
                        offSetCorrection: 10,
                        onAddFieldButtonClick,
                        isTarget: true
                    }
                )
            );
        }
    }
    let maxHeight = (inputHeight >= outputHeight ? inputHeight : outputHeight) + 65;
    const maxWidth = maxFieldWidth * 2 + 100 + INPUT_OUTPUT_GAP

    if (maxHeight < window.innerHeight) {
        // correction if the diagram is smaller than the window height
        // required for the diagram scrolling
        maxHeight = maxHeight + (window.innerHeight - maxHeight);
    }

    const addVariableButtonPosition: { x: number, y: number } = {
        x: inputSTNodes.length > 0 || constantList.length > 0 || constantMap.size > 0 ?
            maxFieldWidth / 2 + 40 + 10 : maxFieldWidth, // leftOffset + padding = 40
        y: inputSTNodes.length > 0 || constantList.length > 0 || constantMap.size > 0 ?
            inputHeight + 15 : 70
    }

    const draftArrowsElements: JSX.Element[] = [];
    if (draftArrows) {
        draftArrows.forEach((arrowPositions: any) => {
            draftArrowsElements.push((
                <line
                    x1={arrowPositions.x1 + 100}
                    x2={arrowPositions.x2 - 140}
                    y1={arrowPositions.y1}
                    y2={arrowPositions.y2}
                    className="connect-line"
                    markerEnd="url(#arrowhead)"
                    id="Arrow-head"
                />
            ))
        });
    }
    return (
        <Canvas h={maxHeight} w={maxWidth}>
            <g id='datamapper-diagram-switch' onClick={handleSwitchBackToDiagram}>
                <text data-testid="datamapper-diagram-switch" x="45" y="30">← Back to the Diagram</text>
            </g>
            <g id="outputComponent">
                <rect
                    className="main-wrapper"
                    width={maxFieldWidth + 50 + 25}
                    height={outputHeight}
                    rx="6"
                    fill="green"
                    x={maxFieldWidth + INPUT_OUTPUT_GAP + 40}
                    y="60"
                />
                <text className="main-title-text" x={maxFieldWidth + INPUT_OUTPUT_GAP + 60} y="85"> Output</text>
                {!showConfigureOutputForm && (
                    <OutputConfigureButton
                        x={(maxFieldWidth * 2) + INPUT_OUTPUT_GAP}
                        y={70}
                        onClick={handleOutputConfigureBtnClick}
                    />
                )}
                {/* {outputSTNode && <SaveButton x={(maxFieldWidth * 2) + 400 + 32} y={saveYPosition} onClick={handleSwitchBackToDiagram} />} */}
                {outputComponent}
            </g>
            <g id="inputComponents">
                <rect className="main-wrapper" width={maxFieldWidth + 50} height={inputHeight} rx="6" x="80" y="60" />
                <text x="105" y="85" className="main-title-text"> Input</text>
                {!showAddVariableForm &&
                    <AddVariableButton {...addVariableButtonPosition} onClick={handleAddVariableClick} />}
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
                {draftArrowsElements}
            </g>
            <DiagramOverlayContainer>
                {showConfigureOutputForm && (
                    <DiagramOverlay
                        position={{ x: maxFieldWidth + INPUT_OUTPUT_GAP + 60, y: 90 }}
                        stylePosition="absolute"
                    >
                        <OutputTypeConfigForm />
                    </DiagramOverlay>
                )
                }
                {
                    // todo: revert
                    showAddVariableForm && (
                        <DiagramOverlay
                            position={{
                                x: 105,
                                y: inputSTNodes.length > 0 || constantList.length > 0 || constantMap.size > 0 ?
                                    inputHeight - 117 : 90
                            }}
                            stylePosition="absolute"
                        >
                            <VariablePicker />
                        </DiagramOverlay>
                    )
                }
                {
                    expressionConfig && (
                        <DiagramOverlay
                            position={{
                                x: expressionConfig.positionX - (PADDING_OFFSET * 2.4),
                                y: expressionConfig.positionY - (PADDING_OFFSET / 2)
                            }}
                            stylePosition="absolute"
                        >
                            <div className='expression-wrapper'>
                                <LowCodeExpressionEditor {...expressionConfig.config} />
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
                    defaultInputConfig && (
                        <DiagramOverlay
                            position={{
                                x: defaultInputConfig.positionX - (PADDING_OFFSET * 2.4),
                                y: defaultInputConfig.positionY - (PADDING_OFFSET / 2)
                            }}
                            stylePosition="absolute"
                        >
                            <div className='expression-wrapper'>
                                <Typography variant="h5">
                                    {`Mapping an Optional type, please provide a default value of type
                                     ${defaultInputConfig.config.model.type}`}
                                </Typography>
                                <LowCodeExpressionEditor {...defaultInputConfig.config} />
                                <div className={overlayClasses.buttonWrapper}>
                                    <SecondaryButton
                                        text="Cancel"
                                        fullWidth={false}
                                        onClick={defaultInputConfigOnCancel}
                                    />
                                    <PrimaryButton
                                        disabled={isExpressionValid}
                                        dataTestId={"datamapper-save-btn"}
                                        text={"Save"}
                                        fullWidth={false}
                                        onClick={defaultInputConfigOnSave}
                                    />
                                </div>
                            </div>
                        </DiagramOverlay>
                    )
                }
                {
                    showTypeConviertConfirmationDialog && (
                        <DiagramOverlay
                            position={{
                                x: selectedTargetDataPoint.bBox.x - (PADDING_OFFSET * 2.4),
                                y: selectedTargetDataPoint.bBox.y - (PADDING_OFFSET / 2)
                            }}
                            stylePosition="absolute"
                        >
                            <div className='expression-wrapper'>
                                <Typography variant="h5">
                                    {`Mismatch type in mapping, expected ${selectedTargetDataPoint.type}
                                     found ${selectedSourceDataPoint.type},
                                    convert to ${selectedTargetDataPoint.type}?`}
                                </Typography>
                                <div className={overlayClasses.buttonWrapper}>
                                    <SecondaryButton
                                        text="Cancel"
                                        fullWidth={false}
                                        onClick={handleTypeConversionCancel}
                                    />
                                    <PrimaryButton
                                        disabled={false}
                                        dataTestId={"datamapper-save-btn"}
                                        text={"Proceed"}
                                        fullWidth={false}
                                        onClick={handleTypeConversionConfirmation}
                                    />
                                </div>
                            </div>
                        </DiagramOverlay>
                    )
                }
            </DiagramOverlayContainer>
        </Canvas>
    )
}
