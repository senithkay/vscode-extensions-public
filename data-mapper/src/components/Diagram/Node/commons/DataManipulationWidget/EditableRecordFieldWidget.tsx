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

import { IconButton } from "@material-ui/core";
import { default as AddIcon } from  "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { MappingConstructor, NodePosition } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel, SpecificFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getDefaultLiteralValue, getNewSource, isConnectedViaLink } from "../../../utils/dm-utils";

import { ArrayTypedEditableRecordFieldWidget } from "./ArrayTypedEditableRecordFieldWidget";
import { useStyles } from "./styles";

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
        ? `${parentId}.${fieldIndex}.${fieldName}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");
    const hasValue = field.hasValue() && !!field.value.valueExpr.source;
    const isArray = field.type.typeName === 'array';
    const isRecord = field.type.typeName === 'record';
    const typeName = isArray ? field.type.memberType.typeName : field.type.typeName;
    const fields = isRecord && field.childrenTypes;
    const value: string = getDefaultLiteralValue(field.type.typeName, field?.value?.valueExpr);
    const indentation = !!fields ? 0 : ((treeDepth + 1) * 16) + 8;

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(field?.value);
        }
        return false;
    }, [field]);

    const [expanded, setExpanded] = useState<boolean>(true);
    const [editable, setEditable] = useState<boolean>(false);
    const [str, setStr] = useState(hasValue ? field.value.source : "");

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel} style={{marginLeft: indentation}}>
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
        const [newSource, targetMappingConstruct, lineNumber] = getNewSource(field, mappingConstruct, "");

        const fieldName = `${targetMappingConstruct.fields.length > 0 ? `${newSource},` : newSource}`

        const coloumnNumber = field.type.name?.length;
        const specificFieldPosition: NodePosition   = {
            startLine: (targetMappingConstruct.openBrace.position as NodePosition).startLine,
            startColumn:  (targetMappingConstruct.openBrace.position as NodePosition).startColumn + 1,
            endLine:  (targetMappingConstruct.openBrace.position as NodePosition).endLine,
            endColumn:  (targetMappingConstruct.openBrace.position as NodePosition).endColumn + 1
        }

        const valuePosition: NodePosition   = {
            startLine: (targetMappingConstruct.openBrace.position as NodePosition).startLine + lineNumber, 
            startColumn: (targetMappingConstruct.openBrace.position as NodePosition).endColumn + coloumnNumber + 2,
            endLine:  (targetMappingConstruct.openBrace.position as NodePosition).endLine + lineNumber,
            endColumn:  (targetMappingConstruct.openBrace.position as NodePosition).endColumn + coloumnNumber +2
        }
        props.context.enableStamentEditor({specificFieldPosition, fieldName, value: "EXPRESSION" , valuePosition, label: field.type.name});



    };

    const handleExpand = () => {
        // TODO Enable expand collapse functionality
        // setExpanded(!expanded)
    };

    return (
        <>
            {!isArray && (
                <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn && (!hasValue || connectedViaLink) &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                    {fields &&
                        (expanded ? (
                                <ExpandMoreIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                            ) :
                            (
                                <ChevronRightIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                            ))
                    }

                    <span> {label}</span>
                    {!hasValue && !isRecord && (
                        <IconButton
                            aria-label="add"
                            className={classes.addIcon}
                            onClick={handleEditable}
                        >
                            <AddIcon />
                        </IconButton>
                    )}
                    <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut}/>
                    }
                </span>
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
                        treeDepth={treeDepth + 1}
                    />
                </>
            )}
            {fields &&
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
