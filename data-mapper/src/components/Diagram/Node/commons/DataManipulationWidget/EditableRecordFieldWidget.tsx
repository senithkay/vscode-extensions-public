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
import React, { useMemo } from "react";

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { MappingConstructor, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import {
    getBalRecFieldName,
    getNewSource,
    getTypeName,
    isConnectedViaLink
} from "../../../utils/dm-utils";

import { ArrayTypedEditableRecordFieldWidget } from "./ArrayTypedEditableRecordFieldWidget";
import { useStyles } from "./styles";
import { ValueConfigButton } from "./ValueConfigButton";

export interface EditableRecordFieldWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
}

export function EditableRecordFieldWidget(props: EditableRecordFieldWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, fieldIndex, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.type.name);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");
    const specificField = field.hasValue() && STKindChecker.isSpecificField(field.value) && field.value;
    const hasValue = specificField && !!specificField.valueExpr.source;
    const isArray = field.type.typeName === PrimitiveBalType.Array;
    const isRecord = field.type.typeName === PrimitiveBalType.Record;
    const typeName = getTypeName(field.type);
    const fields = isRecord && field.childrenTypes;
    let indentation = treeDepth * 16;

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(specificField);
        }
        return false;
    }, [field]);

    const value: string = !connectedViaLink  && !isArray && !isRecord && hasValue && specificField.valueExpr.source;
    let expanded = true;
    if (portIn && portIn.collapsed){
        expanded = false;
    }

    if (!portIn || (hasValue && !connectedViaLink && expanded)){
        indentation += 24;
    }

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel} style={{marginLeft: !!fields ? 0 : indentation + 24}}>
                {fieldName}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}
            {value && (
                <span className={classes.value}>
                    {value}
                </span>
            )}

        </span>
    );

    const handleEditable = () => {
        if (!!field.value) {
            if (STKindChecker.isSpecificField(field.value)) {
                props.context.enableStatementEditor({
                    value: field.value.valueExpr.source,
                    valuePosition: field.value.valueExpr.position,
                    label: field.value.fieldName.source
                });
            }
        } else {
            const [newSource, targetMappingConstruct, lineNumber] = getNewSource(field, mappingConstruct, "");

            const fName = `${targetMappingConstruct.fields.length > 0 ? `${newSource},` : newSource}`

            const columnNumber = field.type.name?.length;
            const specificFieldPosition: NodePosition   = {
                startLine: (targetMappingConstruct.openBrace.position as NodePosition).startLine,
                startColumn:  (targetMappingConstruct.openBrace.position as NodePosition).startColumn + 1,
                endLine:  (targetMappingConstruct.openBrace.position as NodePosition).endLine,
                endColumn:  (targetMappingConstruct.openBrace.position as NodePosition).endColumn + 1
            }

            const valuePosition: NodePosition   = {
                startLine: (targetMappingConstruct.openBrace.position as NodePosition).startLine + lineNumber,
                startColumn: (targetMappingConstruct.openBrace.position as NodePosition).endColumn + columnNumber + 2,
                endLine:  (targetMappingConstruct.openBrace.position as NodePosition).endLine + lineNumber,
                endColumn:  (targetMappingConstruct.openBrace.position as NodePosition).endColumn + columnNumber + 2
            }
            props.context.enableStatementEditor({
                specificFieldPosition,
                fieldName: fName,
                value: "EXPRESSION" ,
                valuePosition,
                label: field.type.name
            });
        }
    };

    const handleExpand = () => {
        context.handleCollapse(fieldId, !expanded);
    };

    return (
        <>
            {!isArray && (
                <div className={classes.treeLabel}>
                    <span className={classes.treeLabelInPort}>
                        {portIn && (!hasValue || connectedViaLink || !expanded) &&
                            <DataMapperPortWidget engine={engine} port={portIn}/>
                        }
                    </span>
                    <span className={classes.label}>
                        {fields &&
                            (expanded ? (
                                    <ExpandMoreIcon style={{color: "black", verticalAlign: "middle",  marginLeft: indentation}} onClick={handleExpand}/>
                                ) :
                                (
                                    <ChevronRightIcon style={{color: "black", verticalAlign: "middle",  marginLeft: indentation}} onClick={handleExpand}/>
                                ))
                        }
                        {label}
                    </span>
                    {!isRecord && (
                        <ValueConfigButton
                            onClick={handleEditable}
                        />
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
                        mappingConstruct={mappingConstruct}
                        context={context}
                        fieldIndex={fieldIndex}
                        treeDepth={treeDepth}
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
                                mappingConstruct={mappingConstruct}
                                context={context}
                                treeDepth={treeDepth + 1}
                            />
                        </>
                    );
                })
            }
        </>
    );
}
