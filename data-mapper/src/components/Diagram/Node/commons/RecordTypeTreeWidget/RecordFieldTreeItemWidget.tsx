import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { RecordField, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortWidget } from "../../../Port/view/DataMapperPortWidget";
import { DataMapperPortModel } from "../../../Port/model/DataMapperPortModel";
import { getFieldTypeName } from "../../../utils";
import { integer } from "vscode-languageserver-types";

// tslint:disable: jsx-no-multiline-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium, Gilmer Medium",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBCEDB",
            display:"flex",
            // justifyContent: "space-between"

        },
        treeLabelOutPort: {
            float: "right",
            marginRight: "5px",
            width: 'fit-content',
           
            fontFamily: "monospace",
            color: '#0095FF',
            display: "inline-block",
            position: "absolute",
            right:"0px"
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "5px",
            position: 'relative',
            width: 'fit-content',
            fontFamily: "monospace",
            color: '#0095FF',
        },
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerRegular, Gilmer Regular",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
        },
        valueLable: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium, Gilmer Medium",
            fontSize: "13px",
            // minWidth: "100px",
            backgroundColor: "#FFFFFF",
        },
        
            group:{
                marginLeft: "0px",
                paddingLeft: "0px",
                // borderLeft: "1px dashed black",
            },
        content : {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        }
        
    }),
);

export interface RecordFieldTreeItemWidgetProps {
    parentId: string;
    field: RecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel;
    treeDepth?: integer;
}

export function RecordFieldTreeItemWidget(props: RecordFieldTreeItemWidgetProps) {
    const { parentId, field, getPort, engine, treeDepth =0 } = props;
    const classes = useStyles();
    
    const fieldId = `${parentId}.${field.fieldName.value}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");

    const  expandable = (STKindChecker.isRecordField(field) && STKindChecker.isRecordTypeDesc(field.typeName) && field.typeName.fields.length > 0) 
    const [expanded , setExpanded] = useState<Boolean>(true)

    const typeName = STKindChecker.isRecordField(field)
        ? getFieldTypeName(field)
        : "record";

    const value=" ".repeat(treeDepth) + field.fieldName.value + ":";
    const indentation  = (treeDepth + (expandable ? 0 : 1) ) * 25

    const label = (
        <span style={{ marginRight: "auto"}} >
            
           
            <span className={classes.valueLable} style={{marginLeft: indentation}}>
                { field.fieldName.value + ":"}
            </span>
            {typeName &&
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            }
            
        </span>
    );

    const handleExpand = () => {
        setExpanded(!expanded)
    }

    return (

        <div style={{paddingBottom: "5px"}}>
            <div className={classes.treeLabel}>
            <span className={classes.treeLabelInPort}>
                {portIn &&
                    <DataMapperPortWidget engine={engine} port={portIn} />
                }
            </span>

            {expandable &&
            
                (expanded ? (
                    <ChevronRightIcon style={{color:"black"}} onClick={handleExpand}/>
                ):
                (
                    <ExpandMoreIcon style={{color:"black"}} onClick={handleExpand}/>
                ))
            }
            <span className={classes.treeLabelOutPort}>
                {portOut &&
                    <DataMapperPortWidget engine={engine} port={portOut} />
                }
            </span>
            <span> {label}</span>
            

            </div>
             
            {/* <TreeItem nodeId={fieldId} label={label} classes={{group: classes.group, content: classes.content}} > */}
               
                {STKindChecker.isRecordField(field) && STKindChecker.isRecordTypeDesc(field.typeName) && expanded &&
                //  <div className={classes.treeLabel} >
                    field.typeName.fields.map((field) => {
                        if (STKindChecker.isRecordField(field)) {
                            return <RecordFieldTreeItemWidget
                                engine={engine}
                                field={field}
                                getPort={getPort}
                                parentId={fieldId}
                                treeDepth={treeDepth + 1}
                            />;
                        } else {
                            // TODO handle fields with default values and included records
                            return <></>;
                        }
                    })
                    
                }
               
            {/* </TreeItem> */}
        </div>
    );
}
