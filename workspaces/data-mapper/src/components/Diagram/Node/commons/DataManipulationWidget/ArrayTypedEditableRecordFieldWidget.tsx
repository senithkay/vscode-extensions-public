/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
import { useDMSearchStore } from "../../../../../store/store";
import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { DiagnosticTooltip } from "../../../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import {
    createSourceForUserInput,
    getDefaultValue,
    getExprBodyFromTypeCastExpression,
    getFieldName,
    getInnermostExpressionBody,
    getLinebreak,
    getTypeName,
    isConnectedViaLink,
} from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";
import { getSupportedUnionTypes, getUnionTypes } from "../../../utils/union-type-utils";
import { OutputSearchHighlight } from "../Search";
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
    const [isAddingTypeCast, setIsAddingTypeCast] = useState(false);

    const fieldName = getFieldName(field);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName ? `.${fieldName}` : ''}`
        : `${parentId}${fieldName ? `.${fieldName}` : ''}`;
    const portIn = getPort(`${fieldId}.IN`);
    const body = field.hasValue() && getInnermostExpressionBody(field.value);
    const valExpr = body && STKindChecker.isSpecificField(body) ? body.valueExpr : body;
    const diagnostic = (valExpr as STNode)?.typeData?.diagnostics[0] as Diagnostic
    const hasValue = valExpr && !!valExpr.source;
    const innerValExpr = getInnermostExpressionBody(valExpr);
    const isValQueryExpr = valExpr && STKindChecker.isQueryExpression(innerValExpr);
    const isUnionTypedElement = field.type.typeName === PrimitiveBalType.Union && !field.type.resolvedUnionType;
    const typeName = getTypeName(field.type);
    const elements = field.elements;
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const [addElementAnchorEl, addElementSetAnchorEl] = React.useState<null | HTMLButtonElement>(null);
    const addMenuOpen = Boolean(addElementAnchorEl);
    const searchValue = useDMSearchStore.getState().outputSearch;

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(innerValExpr);
        }
        return false;
    }, [field]);

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const listConstructor = hasValue ? (STKindChecker.isListConstructor(innerValExpr) ? innerValExpr : null) : null;

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
        let value = field.value.source;
        let valuePosition = field.value.position as NodePosition;
        let editorLabel = 'Array Element';
        if (field.value && STKindChecker.isSpecificField(field.value)) {
            value = field.value.valueExpr.source;
            valuePosition = field.value.valueExpr.position as NodePosition;
            editorLabel = field.value.fieldName.value as string;
        }
        props.context.enableStatementEditor({
            value,
            valuePosition,
            label: editorLabel
        });
    };

    const onAddElementClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isAnydataType || isUnionType) {
            addElementSetAnchorEl(event.currentTarget)
        } else {
            handleAddArrayElement(field?.type?.memberType?.typeName)
        }
    };

    const getUnionType = () => {
        const typeText: JSX.Element[] = [];
        const unionTypes = getUnionTypes(field.originalType);
        const resolvedTypeName = getTypeName(field.type);
        unionTypes.forEach((type) => {
            if (type.trim() === resolvedTypeName) {
                typeText.push(<span className={classes.boldedTypeLabel}>{type}</span>);
            } else {
                typeText.push(<>{type}</>);
            }
            if (type !== unionTypes[unionTypes.length - 1]) {
                typeText.push(<> | </>);
            }
        });
        return typeText;
    };

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled ? classes.valueLabelDisabled : "")}
                style={{ marginLeft: (hasValue && !connectedViaLink && !isValQueryExpr) ? 0 : indentation + 24 }}
            >
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {fieldName && typeName && ":"}
            </span>
            {typeName !== '[]' ? (
                <span className={classnames(classes.typeLabel, isDisabled ? classes.typeLabelDisabled : "")}>
                    {field.originalType.typeName === PrimitiveBalType.Union ? getUnionType() : typeName || ''}
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

    const arrayElements = useMemo(() => {
        return elements && (
            elements.map((element, index) => {
                if (element.elementNode) {
                    const elementNode = STKindChecker.isTypeCastExpression(element.elementNode)
                        ? getExprBodyFromTypeCastExpression(element.elementNode)
                        : element.elementNode;
                    if (STKindChecker.isMappingConstructor(elementNode)
                        || element.member?.type.typeName === PrimitiveBalType.Record) {
                        return (
                            <>
                                <TreeBody>
                                    <EditableRecordFieldWidget
                                        key={index}
                                        engine={engine}
                                        field={element.member}
                                        getPort={getPort}
                                        parentId={fieldId}
                                        parentMappingConstruct={elementNode as MappingConstructor}
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
                    } else if (STKindChecker.isListConstructor(elementNode)) {
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
                        const value: string = elementNode.value || elementNode.source;
                        if (searchValue && !value.toLowerCase().includes(searchValue.toLowerCase())) {
                            return null;
                        }
                    }
                }
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
            })
        );
    }, [elements]);

    const addElementButton = useMemo(() => {
        return (
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
        );
    }, [isAddingElement]);

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

    const handleAddArrayElement = async (typeNameStr: string) => {
        setIsAddingElement(true)
        try {
            const fieldsAvailable = !!listConstructor.expressions.length;
            let type = typeNameStr;
            if (isUnionType) {
                const unionType = field.type.memberType;
                type  = unionType.members.find(member => typeNameStr === getTypeName(member)).typeName;
            }
            const defaultValue = getDefaultValue(type);
            let targetPosition: NodePosition;
            let newElementSource: string = `${getLinebreak()}${isUnionType ? `<${typeNameStr}>` : ''}${defaultValue}`;
            if (fieldsAvailable) {
                targetPosition = listConstructor.expressions[listConstructor.expressions.length - 1].position as NodePosition;
                newElementSource = `,${newElementSource}`
            } else {
                targetPosition = listConstructor.openBracket.position as NodePosition;
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

    const handleWrapWithTypeCast = async (type: string) => {
        setIsAddingTypeCast(true)
        try {
            let targetPosition: NodePosition;
            const typeCastExpr = STKindChecker.isTypeCastExpression(field.value) && field.value;
            const valueExprPosition: NodePosition = typeCastExpr
                ? getExprBodyFromTypeCastExpression(typeCastExpr).position
                : field.value.position;
            if (typeCastExpr) {
                const typeCastExprPosition: NodePosition = typeCastExpr.position;
                targetPosition = {
                    ...typeCastExprPosition,
                    endLine: valueExprPosition.startLine,
                    endColumn: valueExprPosition.startColumn
                };
            } else {
                targetPosition = {
                    ...valueExprPosition,
                    endLine: valueExprPosition.startLine,
                    endColumn: valueExprPosition.startColumn
                };
            }
            const modification = [getModification(`<${type}>`, targetPosition)];
            await applyModifications(modification);
        } finally {
            setIsAddingTypeCast(false);
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

    const isUnionType = field.type?.memberType?.typeName === PrimitiveBalType.Union;

    const onCloseElementSetAnchor = () => addElementSetAnchorEl(null);

    const possibleTypeOptions = useMemo(() => {
        if (isAnydataType) {
            const anyDataConvertOptions: ValueConfigMenuItem[] = [];
            anyDataConvertOptions.push({ title: `Add a primitive element`, onClick: () => handleAddArrayElement("()") })
            anyDataConvertOptions.push({ title: `Add a record element`, onClick: () => handleAddArrayElement(PrimitiveBalType.Record) })
            anyDataConvertOptions.push({ title: `Add an array element`, onClick: () => handleAddArrayElement(PrimitiveBalType.Array) })
            return anyDataConvertOptions;
        } else if (isUnionType) {
            const unionTypeOptions: ValueConfigMenuItem[] = [];
            const supportedTypes = getSupportedUnionTypes(field.type.memberType);
            supportedTypes.forEach((type) => {
                unionTypeOptions.push({ title: `Add a ${type} element`, onClick: () => handleAddArrayElement(type) })
            })
            return unionTypeOptions;
        }
    }, [])

    const valConfigMenuItems: ValueConfigMenuItem[] = hasValue
        ? [
            { title: ValueConfigOption.EditValue, onClick: handleEditValue },
            { title: ValueConfigOption.DeleteArray, onClick: handleArrayDeletion },
        ]
        : [
            { title: ValueConfigOption.InitializeArray, onClick: handleArrayInitialization }
        ];

    const typeSelectorMenuItems: ValueConfigMenuItem[] = isUnionTypedElement
        && field.type.members.map(member => {
            const memberTypeName = getTypeName(member);
            return {
                title: `Re-initialize as ${memberTypeName}`,
                onClick: () => handleWrapWithTypeCast(memberTypeName)
            }
        });

    if (isUnionTypedElement) {
        valConfigMenuItems.push(...typeSelectorMenuItems);
    }

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
                    {(isLoading || isAddingTypeCast) ? (
                        <CircularProgress size={18} className={classes.loader} />
                    ) : (
                        <>
                            {((hasValue && !connectedViaLink) || !isDisabled) && (
                                <ValueConfigMenu
                                    menuItems={valConfigMenuItems}
                                    isDisabled={!typeName || typeName === "[]"}
                                    portName={portIn?.getName()}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
            {expanded && hasValue && listConstructor && !isUnionTypedElement && (
                <div data-testid={`array-widget-${portIn?.getName()}-values`}>
                    <div className={classes.innerTreeLabel}>
                        <span>[</span>
                        {arrayElements}
                        {addElementButton}
                            {(isAnydataType || isUnionType) && (
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
