import React, { useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { FormFieldPortModel, SpecificFieldPortModel } from "../../../Port";
import { DataMapperPortWidget } from "../../../Port/view/DataMapperPortWidget";
import { getFieldTypeName } from "../../../utils/dm-utils";

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
            marginRight: "24px"
        },
        valueLable: {
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
        content : {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        }
    }),
);

export interface SpecificFieldWidgetProps {
    parentId: string;
    field: SpecificField;
    engine: DiagramEngine;
    getPort: (portId: string) => SpecificFieldPortModel | FormFieldPortModel;
    treeDepth?: number;
}

export function SpecificFieldWidget(props: SpecificFieldWidgetProps) {
    const { parentId, field, getPort, engine, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldId = `${parentId}.${field.fieldName.value}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");

    const  expandable = STKindChecker.isMappingConstructor(field.valueExpr) && field.valueExpr.fields.length > 0;
    const [expanded , setExpanded] = useState<Boolean>(true)

    const typeName = STKindChecker.isRecordField(field)
        ? getFieldTypeName(field)
        : "record";

    const indentation  = expandable ?  0 : ((treeDepth + 1) * 16) + 8;

    const label = (
        <span style={{ marginRight: "auto"}} >
            <span className={classes.valueLable} style={{marginLeft: indentation}}>
                {field.fieldName.value}
                {typeName && ":"}
            </span>
            {typeName &&
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            }

        </span>
    );

    const handleExpand = () => {
        // TODO Enable expand collapse functionality
        // setExpanded(!expanded)
    }

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn} />
                    }
                </span>
                {expandable &&
                    (expanded ? (
                        <ExpandMoreIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                    ) :
                    (
                        <ChevronRightIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                    ))
                }
                <span> {label}</span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    }
                </span>
            </div>
            {STKindChecker.isSpecificField(field) && STKindChecker.isMappingConstructor(field.valueExpr) &&
                field.valueExpr.fields.map((field) => {
                    if (STKindChecker.isSpecificField(field)) {
                        return <SpecificFieldWidget
                            engine={engine}
                            field={field}
                            getPort={getPort}
                            parentId={fieldId}
                        />;
                    } else {
                        // TODO handle fields with default values and included records
                        return <></>;
                    }
                })
            }
        </>
    );
}
