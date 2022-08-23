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
import React, { useEffect, useState } from "react";

import { Button, IconButton } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { default as AddIcon } from  "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { ListConstructor, MappingConstructor, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { TypeWithValue } from "../../../Mappings/TypeWithValue";
import { DataMapperPortWidget, RecordFieldPortModel, SpecificFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getNewSource } from "../../../utils/dm-utils";

import { TypeWithValueItemWidget } from "./TypeWithValueItemWidget";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #DEE0E7",
            display: "flex",
            minHeight: "24px",
            boxShadow: '0 2px 40px 0 rgba(102,103,133,0.15)',
        },
        treeLabelOutPort: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto",
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "5px",
            width: 'fit-content',
        },
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerRegular",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            marginRight: "24px"
        },
        valueLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
            backgroundColor: "#FFFFFF",
        },
        group: {
            marginLeft: "0px",
            paddingLeft: "0px",
            paddingBottom: "5px"
        },
        content: {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        },
        addIcon: {
            color: "#5567D5",
            padding: "5px",
            textTransform: "none"
        }
    }),
);

export interface TypeWithValueArrayItemWidgetProps {
    parentId: string;
    field: TypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => SpecificFieldPortModel | RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    treeDepth?: number;
}

export function TypeWithValueArrayItemWidget(props: TypeWithValueArrayItemWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.type.name);
    const fieldId = `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");
    const hasValue = field.hasValue();
    const typeName = field.type.memberType.typeName;
    const fields = field.childrenTypes;

    const [expanded, setExpanded] = useState<boolean>(true);
    const [listConstructor, setListConstructor] = useState<ListConstructor>(null);

    const indentation = !!fields ? 0 : ((treeDepth + 1) * 16) + 8;

    useEffect(() => {
        if (hasValue) {
            if (STKindChecker.isListConstructor(field.value.valueExpr)) {
                setListConstructor(field.value.valueExpr);
            }
        }
    }, [mappingConstruct]);

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel} style={{marginLeft: indentation}}>
                {`${fieldName}[]`}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        // TODO Enable expand collapse functionality
        // setExpanded(!expanded)
    };

    const handleArrayInitialization = () => {
        const [newSource, targetMappingConstruct] = getNewSource(field, mappingConstruct, '[]');
        const fieldsAvailable = !!targetMappingConstruct.fields.length;
        updateSource(newSource, targetMappingConstruct.openBrace.position, fieldsAvailable);
    };

    const handleAddArrayElement = () => {
        const targetPosition = listConstructor.openBracket.position;
        const fieldsAvailable = !!listConstructor.expressions.length;
        updateSource('{}', targetPosition, fieldsAvailable);
    };

    const updateSource = (newSource: string, targetPosition: NodePosition, fieldsAvailable: boolean) => {
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": `\n${fieldsAvailable ? `${newSource},` : newSource}`,
                },
                endColumn: targetPosition.endColumn,
                endLine: targetPosition.endLine,
                startColumn: targetPosition.endColumn,
                startLine: targetPosition.endLine
            }
        ];
        context.applyModifications(modifications);
    };

    return (
        <>
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

                <span>{label}</span>
                {!hasValue && (
                    <IconButton
                        aria-label="add"
                        className={classes.addIcon}
                        onClick={handleArrayInitialization}
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
            {hasValue && listConstructor && (
                <div className={classes.treeLabel}>
                    <span>[</span>
                </div>
            )}
            {fields && (
                <>
                    {
                        listConstructor?.expressions.map((expr) => {
                            if (!STKindChecker.isCommaToken(expr)) {
                                return (
                                    <>
                                        <div className={classes.treeLabel}>
                                            <span>{`{`}</span>
                                        </div>
                                        {
                                            fields.map((subField) => {
                                                if (subField.type.typeName === 'array') {
                                                    return (
                                                        <>
                                                            <TypeWithValueArrayItemWidget
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
                                                } else {
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
                                                }
                                            })
                                        }
                                        <div className={classes.treeLabel}>
                                            <span>{`}`}</span>
                                        </div>
                                    </>
                                );
                            }
                        })
                    }
                </>
            )}
            {hasValue && listConstructor && (
                <>
                    <div className={classes.treeLabel}>
                        <Button
                            aria-label="add"
                            className={classes.addIcon}
                            onClick={handleAddArrayElement}
                            startIcon={<AddIcon/>}
                        >
                            Add Element
                        </Button>
                    </div>
                    <div className={classes.treeLabel}>
                        <span>]</span>
                    </div>
                </>
            )}
        </>
    );
}
