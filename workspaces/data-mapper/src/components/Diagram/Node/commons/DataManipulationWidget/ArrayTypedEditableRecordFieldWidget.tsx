/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useMemo, useState } from "react";

import {
    Button,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem
} from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { AnydataType, PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { MappingConstructor, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { Diagnostic } from "vscode-languageserver-protocol";

import ErrorIcon from "../../../../../assets/icons/Error";
import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { DiagnosticTooltip } from "../../../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import {
    createSourceForUserInput,
    getDefaultValue,
    getExprBodyFromLetExpression,
    getFieldName,
    getLinebreak,
    getTypeName,
    isConnectedViaLink,
} from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";
import { TreeBody } from "../Tree/Tree";

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { PrimitiveTypedEditableElementWidget } from "./PrimitiveTypedEditableElementWidget";
import { useStyles } from "./styles";
import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";
import { ValueConfigMenuItem } from "./ValueConfigButton/ValueConfigMenuItem";

export interface ArrayTypedEditableRecordFieldWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    parentMappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: STNode) => Promise<void>;
    isReturnTypeDesc?: boolean;
    hasHoveredParent?: boolean;
}

export function ArrayTypedEditableRecordFieldWidget(props: ArrayTypedEditableRecordFieldWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        parentMappingConstruct,
        context,
        fieldIndex,
        treeDepth = 0,
        deleteField,
        isReturnTypeDesc,
        hasHoveredParent
    } = props;
    const { applyModifications, handleCollapse } = context;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [isAddingElement, setIsAddingElement] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const fieldName = getFieldName(field);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName ? `.${fieldName}` : ''}`
        : `${parentId}${fieldName ? `.${fieldName}` : ''}`;
    const portIn = getPort(`${fieldId}.IN`);
    const body = field.hasValue() && STKindChecker.isLetExpression(field.value)
        ? getExprBodyFromLetExpression(field.value)
        : field.value;
    const valExpr = body && STKindChecker.isSpecificField(body) ? body.valueExpr : body;
    const hasValue = valExpr && !!valExpr.source;
    const isValQueryExpr = valExpr && STKindChecker.isQueryExpression(valExpr);
    const typeName = getTypeName(field.type);
    const elements = field.elements;
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const diagnostic = (valExpr as STNode)?.typeData?.diagnostics[0] as Diagnostic
    const [addElementAnchorEl, addElementSetAnchorEl] = React.useState<null | HTMLButtonElement>(null);
    const addMenuOpen = Boolean(addElementAnchorEl);

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(valExpr);
        }
        return false;
    }, [field]);

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const listConstructor = hasValue ? (STKindChecker.isListConstructor(valExpr) ? valExpr : null) : null;

    let indentation = treeDepth * 16;
    if (!portIn) {
        indentation += 24;
    }

    let isDisabled = portIn.descendantHasValue;
    if (!isDisabled) {
        if (listConstructor && expanded && portIn.parentModel) {
            portIn.setDescendantHasValue();
            isDisabled = true;
        }
        if (portIn.parentModel && (Object.entries(portIn.parentModel.links).length > 0 || portIn.parentModel.ancestorHasValue)) {
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
    }

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const handleEditValue = () => {
        if (field.value && STKindChecker.isSpecificField(field.value)) {
            props.context.enableStatementEditor({
                value: field.value.valueExpr.source,
                valuePosition: field.value.valueExpr.position as NodePosition,
                label: field.value.fieldName.value as string
            });
        }
    };

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled ? classes.valueLabelDisabled : "")}
                style={{ marginLeft: (hasValue && !connectedViaLink && !isValQueryExpr) ? 0 : indentation + 24 }}
            >
                {fieldName}
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {fieldName && typeName && ":"}
            </span>
            {typeName !== '[]' ? (
                <span
                    className={classnames(
                        classes.typeLabel, isDisabled ? classes.typeLabelDisabled : "")}
                >
                    {typeName}
                </span>
            ) : (
                <DiagnosticTooltip
                    placement="right"
                    diagnostic={{
                        message: "Type information is missing",
                        range: null
                    }}
                >
                    <span className={classes.valueWithError}>
                        {typeName}
                        <span className={classes.errorIconWrapper}>
                            <ErrorIcon />
                        </span>
                    </span>
                </DiagnosticTooltip>
            )}
            {!listConstructor && !connectedViaLink && hasValue && (
                <>
                    {diagnostic ? (
                        <DiagnosticTooltip
                            placement="right"
                            diagnostic={diagnostic}
                            value={valExpr?.source}
                            onClick={handleEditValue}
                        >
                            <span
                                className={classes.valueWithError}
                                data-testid={`array-widget-field-${portIn?.getName()}`}
                            >
                                {valExpr?.source}
                                <span className={classes.errorIconWrapper}>
                                    <ErrorIcon />
                                </span>
                            </span>
                        </DiagnosticTooltip>
                    ) : (
                        <span
                            className={classes.value}
                            onClick={handleEditValue}
                            data-testid={`array-widget-field-${portIn?.getName()}`}
                        >
                            {valExpr?.source}
                        </span>
                    )}
                </>
            )}
        </span>
    );

    const arrayElements = elements && (
        elements.map((element, index) => {
            if (element.elementNode && (STKindChecker.isMappingConstructor(element.elementNode)
                || element.member?.type.typeName === PrimitiveBalType.Record)) {
                return (
                    <>
                        <TreeBody>
                            <EditableRecordFieldWidget
                                key={index}
                                engine={engine}
                                field={element.member}
                                getPort={getPort}
                                parentId={fieldId}
                                parentMappingConstruct={element.elementNode as MappingConstructor}
                                context={context}
                                fieldIndex={index}
                                treeDepth={treeDepth + 1}
                                deleteField={deleteField}
                                hasHoveredParent={isHovered || hasHoveredParent}
                            />
                        </TreeBody>
                        <br />
                    </>
                );
            } else if (element.elementNode && STKindChecker.isListConstructor(element.elementNode)) {
                return (
                    <ArrayTypedEditableRecordFieldWidget
                        key={fieldId}
                        engine={engine}
                        field={element.member}
                        getPort={getPort}
                        parentId={fieldId}
                        parentMappingConstruct={parentMappingConstruct}
                        context={context}
                        fieldIndex={index}
                        treeDepth={treeDepth + 1}
                        deleteField={deleteField}
                        hasHoveredParent={isHovered || hasHoveredParent}
                    />
                )
            } else {
                return (
                    <>
                        <TreeBody>
                            <PrimitiveTypedEditableElementWidget
                                parentId={fieldId}
                                field={element.member}
                                engine={engine}
                                getPort={getPort}
                                context={context}
                                fieldIndex={index}
                                deleteField={deleteField}
                                isArrayElement={true}
                                hasHoveredParent={isHovered || hasHoveredParent}
                            />
                        </TreeBody>
                        <br />
                    </>
                );
            }
        })
    );

    const handleExpand = () => {
        handleCollapse(fieldId, !expanded);
    };

    const handleArrayInitialization = async () => {
        setLoading(true);
        try {
            await createSourceForUserInput(field, parentMappingConstruct, '[]', applyModifications);
        } finally {
            setLoading(false);
        }
    };

    const handleArrayDeletion = async () => {
        setLoading(true);
        try {
            await deleteField(field.value);
        } finally {
            setLoading(false);
        }
    };

    const handleAddValue = async () => {
        setLoading(true);
        try {
            await createSourceForUserInput(field, parentMappingConstruct, 'EXPRESSION', applyModifications);
            // Adding field to the context to identify this newly initialized field in the next rendering
            props.context.handleFieldToBeEdited(fieldId);
        } finally {
            setLoading(false);
        }
    };

    const handleAddArrayElement = async (typeNameStr: string) => {
        setIsAddingElement(true)
        try {
            const fieldsAvailable = !!listConstructor.expressions.length;
            const defaultValue = getDefaultValue(typeNameStr);
            let targetPosition: NodePosition;
            let newElementSource: string;
            if (fieldsAvailable) {
                targetPosition = listConstructor.expressions[listConstructor.expressions.length - 1].position as NodePosition;
                newElementSource = `,${getLinebreak()}${defaultValue}`
            } else {
                targetPosition = listConstructor.openBracket.position as NodePosition;
                newElementSource = `${getLinebreak()}${defaultValue}`
            }
            const modification = [getModification(newElementSource, {
                ...targetPosition,
                startLine: targetPosition.endLine,
                startColumn: targetPosition.endColumn
            })];
            await applyModifications(modification);
        } finally {
            setIsAddingElement(false);
        }
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    const isAnydataType = field.type?.memberType?.typeName === AnydataType
        || field.type?.memberType?.originalTypeName === AnydataType
        || field.type?.originalTypeName === AnydataType;

    const onAddElementClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isAnydataType) {
            addElementSetAnchorEl(event.currentTarget)
        } else {
            handleAddArrayElement(field?.type?.memberType?.typeName)
        }
    }

    const onCloseElementSetAnchor = () => addElementSetAnchorEl(null);

    const possibleTypeOptions = useMemo(() => {
        if (isAnydataType) {
            const anyDataConvertOptions: ValueConfigMenuItem[] = [];
            anyDataConvertOptions.push({ title: `Add a primitive element`, onClick: () => handleAddArrayElement("()") })
            anyDataConvertOptions.push({ title: `Add a record element`, onClick: () => handleAddArrayElement(PrimitiveBalType.Record) })
            return anyDataConvertOptions;
        }
    }, [])

    return (
        <div
            className={classnames(classes.treeLabel, classes.treeLabelArray,
                isDisabled ? classes.treeLabelDisabled : "",
                hasHoveredParent ? classes.treeLabelParentHovered : ""
            )}
        >
            {!isReturnTypeDesc && (
                <div
                    id={"recordfield-" + fieldId}
                    className={classnames(classes.ArrayFieldRow,
                        isDisabled ? classes.ArrayFieldRowDisabled : "",
                        (portState !== PortState.Unselected) ? classes.treeLabelPortSelected : "",
                        hasHoveredParent ? classes.treeLabelParentHovered : ""
                    )}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <span className={classes.treeLabelInPort}>
                        {portIn && (
                            <DataMapperPortWidget
                                engine={engine}
                                port={portIn}
                                disable={isDisabled && expanded}
                                handlePortState={handlePortState}
                                dataTestId={`array-type-editable-record-field-${portIn.getName()}`}
                            />
                        )}
                    </span>
                    <span className={classes.label}>
                        {(hasValue && !connectedViaLink) && (
                            <IconButton
                                id={"button-wrapper-" + fieldId}
                                className={classnames(classes.expandIcon, isDisabled ? classes.expandIconDisabled : "")}
                                style={{ marginLeft: indentation }}
                                onClick={handleExpand}
                                data-testid={`${portIn?.getName()}-expand-icon-array-field`}
                            >
                                {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </IconButton>
                        )}
                        {label}
                    </span>
                    {isLoading ? (
                        <CircularProgress size={18} className={classes.loader} />
                    ) : (
                        <>
                            {((hasValue && !connectedViaLink) || !isDisabled) && (
                                <ValueConfigMenu
                                    menuItems={
                                        hasValue
                                            ? [
                                                { title: ValueConfigOption.EditValue, onClick: handleEditValue },
                                                { title: ValueConfigOption.DeleteArray, onClick: handleArrayDeletion },
                                            ]
                                            : [
                                                { title: ValueConfigOption.InitializeArray, onClick: handleArrayInitialization },
                                                { title: ValueConfigOption.AddValue, onClick: handleAddValue },
                                            ]
                                    }
                                    isDisabled={!typeName || typeName === "[]"}
                                    portName={portIn?.getName()}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
            {expanded && hasValue && listConstructor && (
                <div data-testid={`array-widget-${portIn?.getName()}-values`}>
                    <div className={classes.innerTreeLabel}>
                        <span>[</span>
                        {arrayElements}
                        <Button
                            id={"add-array-element"}
                            aria-label="add"
                            className={classes.addIcon}
                            onClick={onAddElementClick}
                            startIcon={isAddingElement ? <CircularProgress size={16} /> : <AddIcon />}
                            disabled={isAddingElement}
                            data-testid={`array-widget-${portIn?.getName()}-add-element`}
                        >
                            Add Element
                        </Button>
                        {isAnydataType && (
                            <Menu
                                anchorEl={addElementAnchorEl}
                                open={addMenuOpen}
                                onClose={onCloseElementSetAnchor}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                className={classes.valueConfigMenu}
                            >
                                {possibleTypeOptions?.map((item) => (
                                    <>
                                        <MenuItem key={item.title} onClick={item.onClick}>
                                            {item.title}
                                        </MenuItem>
                                    </>
                                ))}
                            </Menu>
                        )}
                        <span>]</span>
                    </div>
                </div>
            )}
        </div>
    );
}
