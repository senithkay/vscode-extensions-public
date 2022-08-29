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
import React, { useState } from "react";

import { IconButton } from "@material-ui/core";
import { default as AddIcon } from  "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { MappingConstructor } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { TypeWithValue } from "../../../Mappings/TypeWithValue";
import { DataMapperPortWidget, RecordFieldPortModel, SpecificFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getDefaultLiteralValue, getFieldIndex, getNewSource } from "../../../utils/dm-utils";

import { useStyles } from "./styles";
import { TypeWithValueArrayItemWidget } from "./TypeWithValueArrayItemWidget";

export interface TypeWithValueItemWidgetProps {
    parentId: string;
    field: TypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => SpecificFieldPortModel | RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
}

export function TypeWithValueItemWidget(props: TypeWithValueItemWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, fieldIndex = 0, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.type.name);
    const fieldId = `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.${fieldIndex}.IN`);
    const portOut = getPort(`${fieldId}.${fieldIndex}.OUT`);
    const hasValue = field.hasValue();
    const isArray = field.type.typeName === 'array';
    const isRecord = field.type.typeName === 'record';
    const typeName = isArray ? field.type.memberType.typeName : field.type.typeName;
    const fields = isRecord && field.childrenTypes;
    const value: string = getDefaultLiteralValue(field.type.typeName, field?.value?.valueExpr);
    const indentation = !!fields ? 0 : ((treeDepth + 1) * 16) + 8;

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
        setEditable(true);
    };

    const handleExpand = () => {
        // TODO Enable expand collapse functionality
        // setExpanded(!expanded)
    };

    const onChange = (newVal: string) => {
        setStr(newVal);
    };

    const onKeyUp = (key: string) => {
        if (key === "Escape") {
            setEditable(false);
        }
        if (key === "Enter") {
            const [newSource, targetMappingConstruct] = getNewSource(field, mappingConstruct, str);
            updateSource(newSource, targetMappingConstruct);
        }
    };

    const updateSource = (newSource: string, targetMappingConstruct: MappingConstructor) => {
        const targetPos = targetMappingConstruct.openBrace.position;
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": `\n${targetMappingConstruct.fields.length > 0 ? `${newSource},` : newSource}`,
                },
                endColumn: targetPos.endColumn,
                endLine: targetPos.endLine,
                startColumn: targetPos.endColumn,
                startLine: targetPos.endLine
            }
        ];
        context.applyModifications(modifications);
    };

    return (
        <>
            {!isArray && (
                <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
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
                    {!hasValue && (
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
                    <TypeWithValueArrayItemWidget
                        key={fieldId}
                        engine={engine}
                        field={field}
                        getPort={getPort}
                        parentId={parentId}
                        mappingConstruct={mappingConstruct}
                        context={context}
                        treeDepth={treeDepth + 1}
                    />
                </>
            )}
            {fields &&
                fields.map((subField) => {
                    return (
                        <>
                            <TypeWithValueItemWidget
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
            {editable && !isArray && (
                <input
                    size={str.length}
                    spellCheck={false}
                    style={{
                        padding: "5px",
                        fontFamily: "monospace",
                        zIndex: 1000,
                        border: "1px solid #5567D5"
                    }}
                    autoFocus={true}
                    value={str}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyUp={(event) => onKeyUp(event.key)}
                    onBlur={() => setEditable(false)}
                />
            )}
        </>
    );
}
