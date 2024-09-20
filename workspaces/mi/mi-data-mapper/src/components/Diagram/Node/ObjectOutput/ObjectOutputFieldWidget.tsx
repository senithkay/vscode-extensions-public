/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { Button, Codicon, Icon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { Block, InterfaceDeclaration, Node, PropertySignature } from "ts-morph";
import classnames from "classnames";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from "../../Port";
import { OutputSearchHighlight } from "../commons/Search";
import { ValueConfigMenu, ValueConfigOption } from "../commons/ValueConfigButton";
import { ValueConfigMenuItem } from "../commons/ValueConfigButton/ValueConfigMenuItem";
import { useIONodesStyles } from "../../../styles";
import { useDMCollapsedFieldsStore, useDMExpressionBarStore, useDMViewsStore } from '../../../../store/store';
import { getDefaultValue, getEditorLineAndColumn, getTypeName, isConnectedViaLink } from "../../utils/common-utils";
import { createSourceForUserInput, setFieldOptional } from "../../utils/modification-utils";
import { ArrayOutputFieldWidget } from "../ArrayOutput/ArrayOuptutFieldWidget";
import { filterDiagnosticsForNode } from "../../utils/diagnostics-utils";
import { DiagnosticTooltip } from "../../Diagnostic/DiagnosticTooltip";
import FieldActionWrapper from "../commons/FieldActionWrapper";

export interface ObjectOutputFieldWidgetProps {
    parentId: string;
    field: DMTypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    parentObjectLiteralExpr: Node;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: Node) => Promise<void>;
    hasHoveredParent?: boolean;
}

export function ObjectOutputFieldWidget(props: ObjectOutputFieldWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        parentObjectLiteralExpr,
        context,
        fieldIndex,
        treeDepth = 0,
        deleteField,
        hasHoveredParent
    } = props;
    const classes = useIONodesStyles();

    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    const { exprBarFocusedPort, setExprBarFocusedPort } = useDMExpressionBarStore(state => ({
        exprBarFocusedPort: state.focusedPort,
        setExprBarFocusedPort: state.setFocusedPort
    }));
    const viewsStore = useDMViewsStore();

    let fieldName = field.type.fieldName || '';
    let indentation = treeDepth * 16;
    let expanded = true;

    const typeName = getTypeName(field.type);
    const typeKind = field.type.kind;
    const isArray = typeKind === TypeKind.Array;
    const isInterface = typeKind === TypeKind.Interface;

    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}${fieldName && `.${fieldName}`}`;
    const portIn = getPort(fieldId + ".IN");
    const isExprBarFocused = exprBarFocusedPort?.getName() === portIn?.getName();

    const propertyAssignment = field.hasValue()
        && !field.value.wasForgotten()
        && Node.isPropertyAssignment(field.value)
        && field.value;
    const objectLiteralExpr = parentObjectLiteralExpr
        && !parentObjectLiteralExpr.wasForgotten()
        && Node.isObjectLiteralExpression(parentObjectLiteralExpr)
        && parentObjectLiteralExpr;
    const initializer = propertyAssignment
        && !propertyAssignment.wasForgotten()
        && propertyAssignment.getInitializer();
    const hasValue = initializer
        && !!initializer.getText()
        && initializer.getText() !== getDefaultValue(field.type.kind)
        && initializer.getText() !== "null";
    const hasDefaultValue = initializer && initializer.getText() === getDefaultValue(field.type.kind);

    const fields = isInterface && field.childrenTypes;
    const isWithinArray = fieldIndex !== undefined;
    const diagnostic = propertyAssignment && filterDiagnosticsForNode(context.diagnostics, propertyAssignment)[0];

    const connectedViaLink = useMemo(() => {
        return hasValue && isConnectedViaLink(initializer);
    }, [field]);

    const handleAddValue = async () => {
        setIsLoading(true);
        try {
            const defaultValue = getDefaultValue(field.type.kind);
            const fnBody = context.functionST.getBody() as Block;
            await createSourceForUserInput(field, objectLiteralExpr, defaultValue, fnBody, context.applyModifications);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditValue = () => {
        if (portIn)
            setExprBarFocusedPort(portIn);
    };

    const handleSetFieldOptional = async () => {
        setIsLoading(true);
        viewsStore.setViews(context.views);
        try {
            await setFieldOptional(field, !field.type.optional, context.functionST.getSourceFile(), context.applyModifications)
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteValue = async () => {
        setIsLoading(true);
        try {
            await deleteField(field.value);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpand = () => {
        const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== fieldId));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, fieldId]);
        }
    };

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    let isDisabled = portIn?.descendantHasValue;

    if (!isDisabled) {
        if (portIn?.parentModel
            && (Object.entries(portIn?.parentModel.links).length > 0 || portIn?.parentModel.ancestorHasValue)
        ) {
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
    }

    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    if (!portIn) {
        indentation += 24;
    }

    if (isWithinArray) {
        const elementName = fieldName || field.parentType.type?.fieldName;
        fieldName = elementName ? `${elementName}Item` : 'item';
    }

    const label = !isArray && (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled && !hasHoveredParent ? classes.labelDisabled : ""
                )}
                style={{ marginLeft: fields ? 0 : indentation + 24 }}
            >
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {typeName && ":"}
            </span>
            {typeName && (
                <span
                    className={classnames(classes.outputTypeLabel,
                        isDisabled && !hasHoveredParent ? classes.labelDisabled : ""
                    )}
                >
                    {typeName || ''}
                </span>
            )}
            {(hasValue || hasDefaultValue) && !connectedViaLink && !portIn.descendantHasValue && (
                <span className={classes.outputNodeValueBase}>
                    {diagnostic ? (
                        <DiagnosticTooltip
                            diagnostic={diagnostic}
                            value={initializer.getText()}
                            onClick={handleEditValue}
                        >
                            <Button
                                appearance="icon"
                                data-testid={`object-output-field-${portIn?.getName()}`}
                            >
                                {initializer.getText()}
                                <Icon
                                    name="error-icon"
                                    sx={{ height: "14px", width: "14px", marginLeft: "4px" }}
                                    iconSx={{ fontSize: "14px", color: "var(--vscode-errorForeground)" }}
                                />
                            </Button>
                        </DiagnosticTooltip>
                    ) : (
                        <span
                            className={classes.outputNodeValue}
                            onClick={handleEditValue}
                            data-testid={`object-output-field-${portIn?.getName()}`}
                        >
                            {initializer.getText()}
                        </span>
                    )}
                </span>
            )}
        </span>
    );

    const addOrEditValueMenuItem: ValueConfigMenuItem = hasValue || hasDefaultValue
        ? { title: ValueConfigOption.EditValue, onClick: handleEditValue }
        : { title: ValueConfigOption.InitializeWithValue, onClick: handleAddValue };

    const deleteValueMenuItem: ValueConfigMenuItem = {
        title: isWithinArray ? ValueConfigOption.DeleteElement : ValueConfigOption.DeleteValue,
        onClick: handleDeleteValue
    };

    const handleSetFieldOptionalMenuItem: ValueConfigMenuItem = {
        title: field.type.optional ? ValueConfigOption.MakeFieldRequired : ValueConfigOption.MakeFieldOptional,
        onClick: handleSetFieldOptional
    };

    const valConfigMenuItems = [
        !isWithinArray && addOrEditValueMenuItem,
        (hasValue || hasDefaultValue || isWithinArray) && deleteValueMenuItem,
        !isWithinArray && handleSetFieldOptionalMenuItem
    ];

    return (
        <>
            {!isArray && (
                <div
                    id={"recordfield-" + fieldId}
                    className={classnames(classes.treeLabel,
                        isDisabled && !hasHoveredParent && !isHovered ? classes.treeLabelDisabled : "",
                        isDisabled && isHovered ? classes.treeLabelDisableHover : "",
                        portState !== PortState.Unselected ? classes.treeLabelPortSelected : "",
                        hasHoveredParent ? classes.treeLabelParentHovered : "",
                        isExprBarFocused ? classes.treeLabelPortExprFocused : ""
                    )}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <span className={classes.inPort}>
                        {portIn && (
                            <DataMapperPortWidget
                                engine={engine}
                                port={portIn}
                                disable={isDisabled && expanded}
                                handlePortState={handlePortState}
                            />
                        )}
                    </span>
                    <span className={classes.label}>
                        {fields && (
                            <FieldActionWrapper>
                                <Button
                                    appearance="icon"
                                    tooltip="Expand/Collapse"
                                    sx={{ marginLeft: indentation }}
                                    onClick={handleExpand}
                                    data-testid={`${portIn?.getName()}-expand-icon-element`}
                                >
                                    {expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                                </Button>
                            </FieldActionWrapper>
                        )}
                        {label}
                    </span>
                    {(!isDisabled || hasValue) && (
                        <>
                            {(isLoading) ? (
                                <ProgressRing sx={{ height: '16px', width: '16px' }} />
                            ) : (
                                <FieldActionWrapper>
                                    <ValueConfigMenu menuItems={valConfigMenuItems} portName={portIn?.getName()} />
                                </FieldActionWrapper>
                            )}
                        </>
                    )}
                </div>
            )}
            {isArray && (
                <ArrayOutputFieldWidget
                    key={fieldId}
                    engine={engine}
                    field={field}
                    getPort={getPort}
                    parentId={parentId}
                    parentObjectLiteralExpr={objectLiteralExpr}
                    context={context}
                    fieldIndex={fieldIndex}
                    treeDepth={treeDepth}
                    deleteField={deleteField}
                    hasHoveredParent={isHovered || hasHoveredParent}
                />
            )}
            {fields && expanded &&
                fields.map((subField, index) => {
                    return (
                        <ObjectOutputFieldWidget
                            key={index}
                            engine={engine}
                            field={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            parentObjectLiteralExpr={objectLiteralExpr}
                            context={context}
                            treeDepth={treeDepth + 1}
                            deleteField={deleteField}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    );
                })
            }
        </>
    );
}
