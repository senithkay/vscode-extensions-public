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
import React, { useEffect, useMemo, useState } from "react";

import { CircularProgress, IconButton } from "@material-ui/core";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { Diagnostic } from "vscode-languageserver-protocol";

import ErrorIcon from "../../../../../assets/icons/Error";
import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { DiagnosticTooltip } from "../../../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import {
    createSourceForUserInput,
    getFieldName,
    getTypeName,
    isConnectedViaLink
} from "../../../utils/dm-utils";

import { ArrayTypedEditableRecordFieldWidget } from "./ArrayTypedEditableRecordFieldWidget";
import { useStyles } from "./styles";
import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";
import { ValueConfigMenuItem } from "./ValueConfigButton/ValueConfigMenuItem";

export interface EditableRecordFieldWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    parentMappingConstruct: STNode;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: STNode) => Promise<void>;
}

export function EditableRecordFieldWidget(props: EditableRecordFieldWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        parentMappingConstruct,
        context,
        fieldIndex,
        treeDepth = 0,
        deleteField
    } = props;
    const {
        stSymbolInfo,
        fieldToBeEdited,
        isStmtEditorCanceled,
        handleFieldToBeEdited,
        enableStatementEditor,
        handleCollapse,
        applyModifications
    } = context;
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(false);

    let fieldName = getFieldName(field);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");
    const specificField = field.hasValue() && STKindChecker.isSpecificField(field.value) && field.value;
    const mappingConstruct = STKindChecker.isMappingConstructor(parentMappingConstruct) && parentMappingConstruct;
    const hasValue = specificField && specificField.valueExpr && !!specificField.valueExpr.source && !Object.keys(portIn.links)?.length;
    const isArray = field.type.typeName === PrimitiveBalType.Array;
    const isRecord = field.type.typeName === PrimitiveBalType.Record;
    const typeName = getTypeName(field.type);
    const fields = isRecord && field.childrenTypes;
    const isWithinArray = fieldIndex !== undefined;
    let indentation = treeDepth * 16;

    useEffect(() => {
        if (fieldToBeEdited === fieldId) {
            if (!isStmtEditorCanceled) {
                handleEditValue();
            } else {
                void handleDeleteValue();
                handleFieldToBeEdited(undefined);
            }
        }
    }, [fieldToBeEdited, isStmtEditorCanceled]);

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(specificField.valueExpr);
        }
        return false;
    }, [field]);

    const value: string = !isArray && !isRecord && hasValue && specificField.valueExpr.source;
    let expanded = true;

    const handleAddValue = async () => {
        setIsLoading(true);
        try {
            await createSourceForUserInput(field, mappingConstruct, 'EXPRESSION', applyModifications);
            // Adding field to the context to identify this newly initialized field in the next rendering
            handleFieldToBeEdited(fieldId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditValue = () => {
        if (field.value && STKindChecker.isSpecificField(field.value)) {
            enableStatementEditor({
                value: field.value.valueExpr.source,
                valuePosition: field.value.valueExpr.position as NodePosition,
                label: field.value.fieldName.value as string
            });
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
        handleCollapse(fieldId, !expanded);
    };

    let isDisabled = portIn.descendantHasValue || (value && !connectedViaLink);
    if (!isDisabled) {
        if (portIn.parentModel && (Object.entries(portIn.parentModel.links).length > 0 || portIn.parentModel.ancestorHasValue)) {
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
        if (hasValue
            && !connectedViaLink
            && (isArray && !STKindChecker.isQueryExpression(specificField.valueExpr) || isRecord)) {
            portIn.setDescendantHasValue();
            isDisabled = true;
        }
    }

    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    if (!portIn) {
        indentation += 24;
    }

    if (!fieldName && isWithinArray) {
        fieldName = field.parentType.type?.name ? `${field.parentType.type?.name}Item` : 'item';
    }

    const diagnostic = (specificField.valueExpr as STNode)?.typeData?.diagnostics[0] as Diagnostic

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    (isDisabled && portIn.ancestorHasValue) ? classes.valueLabelDisabled : "")}
                style={{ marginLeft: fields ? 0 : indentation + 24 }}
            >
                {fieldName}
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {typeName && ":"}
            </span>
            {typeName && (
                <span
                    className={classnames(classes.typeLabel,
                        (isDisabled && portIn.ancestorHasValue) ? classes.typeLabelDisabled : "")}
                >
                    {typeName}
                </span>
            )}
            {value && !connectedViaLink && (
                <>
                    {diagnostic ? (
                        <DiagnosticTooltip
                            placement="right"
                            diagnostic={diagnostic}
                            value={value}
                            onClick={handleEditValue}
                        >
                            <span className={classes.valueWithError} data-testid={`record-widget-field-${portIn?.getName()}`}>
                                {value}
                                <span className={classes.errorIconWrapper}>
                                    <ErrorIcon />
                                </span>
                            </span>
                        </DiagnosticTooltip>
                    ) : (
                        <span
                            className={classes.value}
                            onClick={handleEditValue}
                            data-testid={`record-widget-field-${portIn?.getName()}`}
                        >
                            {value}
                        </span>
                    )}
                </>
            )}
        </span>
    );

    const addOrEditValueMenuItem: ValueConfigMenuItem = hasValue
        ? { title: ValueConfigOption.EditValue, onClick: handleEditValue }
        : { title: ValueConfigOption.AddValue, onClick: handleAddValue };

    const deleteValueMenuItem: ValueConfigMenuItem = {
        title: isWithinArray ? ValueConfigOption.DeleteElement : ValueConfigOption.DeleteValue,
        onClick: handleDeleteValue
    };

    const valConfigMenuItems = [
        !isWithinArray && addOrEditValueMenuItem,
        (hasValue || isWithinArray) && deleteValueMenuItem
    ];

    return (
        <>
            {!isArray && (
                <div
                    className={classnames(classes.treeLabel,
                        (isDisabled && portIn.ancestorHasValue) ? classes.treeLabelDisabled : "")}
                >
                    <span className={classes.treeLabelInPort}>
                        {portIn &&
                            <DataMapperPortWidget engine={engine} port={portIn} disable={isDisabled && expanded} />
                        }
                    </span>
                    <span className={classes.label}>
                        {fields && (
                            <IconButton
                                className={classes.expandIcon}
                                style={{ marginLeft: indentation }}
                                onClick={handleExpand}
                                data-testid={`${portIn.getName()}-expand-icon-element`}
                            >
                                {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </IconButton>
                        )}
                        {label}
                    </span>

                    {(!isDisabled || hasValue) && (
                        <>
                            {(isLoading || fieldId === fieldToBeEdited) ? (
                                <CircularProgress size={18} className={classes.loader} />
                            ) : (
                                <ValueConfigMenu menuItems={valConfigMenuItems} portName={portIn?.getName()}/>
                            )}
                        </>
                    )}
                </div>
            )}
            {isArray && (
                <>
                    <ArrayTypedEditableRecordFieldWidget
                        key={fieldId}
                        engine={engine}
                        field={field}
                        getPort={getPort}
                        parentId={parentId}
                        parentMappingConstruct={mappingConstruct}
                        context={context}
                        fieldIndex={fieldIndex}
                        treeDepth={treeDepth}
                        deleteField={deleteField}
                    />
                </>
            )}
            {fields && expanded &&
                fields.map((subField) => {
                    return (
                        <>
                            <EditableRecordFieldWidget
                                key={fieldId}
                                engine={engine}
                                field={subField}
                                getPort={getPort}
                                parentId={fieldId}
                                parentMappingConstruct={mappingConstruct}
                                context={context}
                                treeDepth={treeDepth + 1}
                                deleteField={deleteField}
                            />
                        </>
                    );
                })
            }
        </>
    );
}
