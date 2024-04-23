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
import { Button, Codicon, Icon, Item, Menu, MenuItem, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { TypeKind } from "@wso2-enterprise/mi-core";
import { Block, Node, ObjectLiteralExpression } from "ts-morph";
import classnames from "classnames";

import { useIONodesStyles } from "../../../styles";
import { useDMCollapsedFieldsStore } from '../../../../store/store';
import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from "../../Port";
import { OutputSearchHighlight } from "../commons/Search";
import { ObjectOutputFieldWidget } from "../ObjectOutput/ObjectOutputFieldWidget";
import { ValueConfigMenu, ValueConfigOption } from "../commons/DataManipulationWidget/ValueConfigButton";
import { ValueConfigMenuItem } from "../commons/DataManipulationWidget/ValueConfigButton/ValueConfigMenuItem";
import { getDiagnostics } from "../../utils/diagnostics-utils";
import { getDefaultValue, getEditorLineAndColumn, isConnectedViaLink } from "../../utils/common-utils";
import { DiagnosticTooltip } from "../../Diagnostic/DiagnosticTooltip";
import { TreeBody } from "../commons/Tree/Tree";
import { createSourceForUserInput } from "../../utils/modification-utils";

export interface ArrayOutputFieldWidgetProps {
    parentId: string;
    field: DMTypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    parentObjectLiteralExpr: ObjectLiteralExpression;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: Node) => Promise<void>;
    isReturnTypeDesc?: boolean;
    hasHoveredParent?: boolean;
}

export function ArrayOutputFieldWidget(props: ArrayOutputFieldWidgetProps) {
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
        isReturnTypeDesc,
        hasHoveredParent
    } = props;
    const classes = useIONodesStyles();

    const [isLoading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const [isAddingElement, setIsAddingElement] = useState(false);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();
    
    const {kind: typeName, fieldName} = field.type;
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName ? `.${fieldName}` : ''}`
        : `${parentId}${fieldName ? `.${fieldName}` : ''}`;
    const portIn = getPort(`${fieldId}.IN`);

    const body = field.hasValue() && field.value;
    const valExpr = body && Node.isPropertyAssignment(body) ? body.getInitializer() : body;

    const diagnostic = valExpr && getDiagnostics(valExpr)[0];

    const hasValue = valExpr && !!valExpr.getText();
    const elements = field.elements;
    const searchValue = useDMSearchStore.getState().outputSearch;

    const connectedViaLink = useMemo(() => {
        return hasValue ? isConnectedViaLink(valExpr) : false;
    }, [field]);

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const arrayLitExpr = hasValue && Node.isArrayLiteralExpression(valExpr) ? valExpr : null;

    let indentation = treeDepth * 16;
    if (!portIn) {
        indentation += 24;
    }

    let isDisabled = portIn.descendantHasValue;
    if (!isDisabled) {
        if (arrayLitExpr && expanded && portIn.parentModel) {
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
        let value = field.value;
    
        if (field.value && Node.isPropertyAssignment(field.value)) {
            value = field.value.getInitializer();
        }

        const range = getEditorLineAndColumn(value);
        context.goToSource(range);
    };

    const onAddElementClick = () => {
        handleAddArrayElement(field.type?.memberType.kind);
    };

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled ? classes.valueLabelDisabled : "")}
                style={{ marginLeft: hasValue && !connectedViaLink ? 0 : indentation + 24 }}
            >
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {fieldName && typeName && ":"}
            </span>
            {typeName && (
                <span className={classnames(classes.outputTypeLabel, isDisabled ? classes.typeLabelDisabled : "")}>
                    {typeName}
                </span>
            )}
            {!arrayLitExpr && !connectedViaLink && hasValue && (
                <>
                    {diagnostic ? (
                        <DiagnosticTooltip
                            placement="right"
                            diagnostic={diagnostic}
                            value={valExpr.getText()}
                            onClick={handleEditValue}
                        >
                            <Button
                                appearance="icon"
                                data-testid={`array-widget-field-${portIn?.getName()}`}
                            >
                                {valExpr.getText()}
                                <Icon
                                    name="error-icon"
                                    sx={{ height: "14px", width: "14px" }}
                                    iconSx={{ fontSize: "14px", color: "var(--vscode-errorForeground)" }}
                                />
                            </Button>
                        </DiagnosticTooltip>
                    ) : (
                        <span
                            className={classes.outputNodeValue}
                            onClick={handleEditValue}
                            data-testid={`array-widget-field-${portIn?.getName()}`}
                        >
                            {valExpr.getText()}
                        </span>
                    )}
                </>
            )}
        </span>
    );

    const arrayElements = useMemo(() => {
        return elements && (
            elements.map((element, index) => {
                const { elementNode } = element;
                if (elementNode) {
                    if (Node.isObjectLiteralExpression(elementNode)
                        || element.member?.type.kind === TypeKind.Interface) {
                        return (
                            <>
                                <TreeBody>
                                    <ObjectOutputFieldWidget
                                        key={index}
                                        engine={engine}
                                        field={element.member}
                                        getPort={getPort}
                                        parentId={fieldId}
                                        parentObjectLiteralExpr={elementNode as ObjectLiteralExpression}
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
                    } else if (Node.isArrayLiteralExpression(elementNode)) {
                        return (
                            <ArrayOutputFieldWidget
                                key={fieldId}
                                engine={engine}
                                field={element.member}
                                getPort={getPort}
                                parentId={fieldId}
                                parentObjectLiteralExpr={parentObjectLiteralExpr}
                                context={context}
                                fieldIndex={index}
                                treeDepth={treeDepth + 1}
                                deleteField={deleteField}
                                hasHoveredParent={isHovered || hasHoveredParent}
                            />
                        )
                    } else {
                        const value = elementNode.getText();
                        if (searchValue && !value.toLowerCase().includes(searchValue.toLowerCase())) {
                            return null;
                        }
                    }
                }
                return (
                    // TODO: Return the widget for primitive typed element
                    <></>
                );
            })
        );
    }, [elements]);

    const addElementButton = useMemo(() => {
        return (
            <Button
                className={classes.addArrayElementButton}
                appearance="icon"
                aria-label="add"
                onClick={onAddElementClick}
                disabled={isAddingElement}
                data-testid={`array-widget-${portIn?.getName()}-add-element`}
            >
                {isAddingElement
                    ? <ProgressRing sx={{ height: '16px', width: '16px' }} />
                    : <Codicon name="add" iconSx={{ color: "var(--vscode-inputOption-activeForeground)" }} />
                }
                Add Element
            </Button>
        );
    }, [isAddingElement]);

    const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== fieldId));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, fieldId]);
        }
    };

    const handleArrayInitialization = async () => {
        setLoading(true);
        try {
            const fnBody = context.functionST.getBody() as Block;
            await createSourceForUserInput(field, parentObjectLiteralExpr, '[]', fnBody, context.applyModifications);
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

    const handleAddArrayElement = async (typeKind: TypeKind) => {
        setIsAddingElement(true)
        try {
            const defaultValue = getDefaultValue(typeKind);
            arrayLitExpr.addElement(defaultValue);
            context.applyModifications();
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

    const valConfigMenuItems: ValueConfigMenuItem[] = hasValue
        ? [
            { title: ValueConfigOption.EditValue, onClick: handleEditValue },
            { title: ValueConfigOption.DeleteArray, onClick: handleArrayDeletion },
        ]
        : [
            { title: ValueConfigOption.InitializeArray, onClick: handleArrayInitialization }
        ];

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
                    <span className={classes.inPort}>
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
                            <Button
                                appearance="icon"
                                sx={{ marginLeft: indentation }}
                                onClick={handleExpand}
                                data-testid={`${portIn?.getName()}-expand-icon-array-field`}
                            >
                                {expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
                            </Button>
                        )}
                        {label}
                    </span>
                    {(isLoading) ? (
                        <ProgressRing />
                    ) : (
                        <>
                            {((hasValue && !connectedViaLink) || !isDisabled) && (
                                <ValueConfigMenu
                                    menuItems={valConfigMenuItems}
                                    isDisabled={!typeName}
                                    portName={portIn?.getName()}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
            {expanded && hasValue && arrayLitExpr && (
                <div data-testid={`array-widget-${portIn?.getName()}-values`}>
                    <div className={classes.innerTreeLabel}>
                        <span>[</span>
                        {arrayElements}
                        {addElementButton}
                        <span>]</span>
                    </div>
                </div>
            )}
        </div>
    );
}
