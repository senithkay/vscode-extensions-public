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
import React from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getTypeName } from "../../../utils/dm-utils";

// tslint:disable: jsx-no-multiline-js
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
            marginRight: "24px",
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
        label:{
            width: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "inline-block",
            textOverflow: "ellipsis",
            "&:hover": {
                overflow: "visible"
            }
        }
        

    }),
);

export interface RecordFieldTreeItemWidgetProps {
    parentId: string;
    field: Type;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    treeDepth?: number;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;

}

export function RecordFieldTreeItemWidget(props: RecordFieldTreeItemWidgetProps) {
    const { parentId, field, getPort, engine, handleCollapse, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.name);
    const fieldId = `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.IN`);
    const portOut = getPort(`${fieldId}.OUT`);
    let fields: Type[];

    if (field.typeName === 'record') {
        fields = field.fields;
    }

    let expanded = true;
    if ((portIn && portIn.collapsed) || (portOut && portOut.collapsed)) {
        expanded = false;
    }

    const typeName = getTypeName(field);

    const indentation = !!fields ? 0 : ((treeDepth + 1) * 16) + 8;

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

        </span>
    );

    const handleExpand = () => {
        handleCollapse(fieldId, !expanded);        
    }

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                <span className={classes.label}>
                    {fields &&
                        (expanded ? (
                                <ExpandMoreIcon style={{color: "black", verticalAlign: "middle", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                            ) :
                            (
                                <ChevronRightIcon style={{color: "black", verticalAlign: "middle", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                            ))
                    }
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut}/>
                    }
                </span>
            </div>
            {fields && expanded &&
                fields.map((subField) => {
                    return (
                        <RecordFieldTreeItemWidget
                            key={fieldId}
                            engine={engine}
                            field={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            handleCollapse={handleCollapse}
                            treeDepth={treeDepth + 1}
                        />
                    );
                })
            }
        </>
    );
}
