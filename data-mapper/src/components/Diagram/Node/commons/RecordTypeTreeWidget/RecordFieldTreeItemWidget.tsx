import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { RecordField, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortWidget } from "../../../Port/view/DataMapperPortWidget";
import { DataMapperPortModel } from "../../../Port/model/DataMapperPortModel";
import { getFieldTypeName } from "../../../utils";
import { RecordTypeDescriptorStore } from "../../../utils/record-type-descriptor-store";

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
            display:"flex",
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
        group:{
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

export interface RecordFieldTreeItemWidgetProps {
    parentId: string;
    field: RecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel;
    treeDepth?: number;
}

export function RecordFieldTreeItemWidget(props: RecordFieldTreeItemWidgetProps) {
    const { parentId, field, getPort, engine, treeDepth = 0 } = props;
    const classes = useStyles();
    
    const fieldId = `${parentId}.${field.fieldName.value}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");
    let fields: STNode[];

    if (STKindChecker.isRecordField(field) && STKindChecker.isRecordTypeDesc(field.typeName)){
        fields = field.typeName.fields
    }
    else if (STKindChecker.isSimpleNameReference(field.typeName)) {
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
		const typeDef = recordTypeDescriptors.gettypeDescriptor(field.typeName.name.value)
        if (!!typeDef && STKindChecker.isRecordTypeDesc(typeDef.typeDescriptor)){
            fields = typeDef.typeDescriptor.fields
        }
    }

    const [expanded , setExpanded] = useState<Boolean>(true)

    const typeName = STKindChecker.isRecordField(field)
        ? getFieldTypeName(field)
        : "record";

    const indentation  = !!fields ?  0 : ((treeDepth + 1) * 16) + 8;

    const label = (
        <span style={{ marginRight: "auto"}} >
            <span className={classes.valueLable} style={{marginLeft: indentation}}>
                { field.fieldName.value}
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
        //TODO Enable expand collapse functionality
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
                {fields &&
                    (expanded ? (
                        <ExpandMoreIcon style={{color:"black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                    ):
                    (
                        <ChevronRightIcon style={{color:"black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                    ))
                }
                            
                <span> {label}</span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    }
                </span>    
            </div>
                {fields &&
                    fields.map((field) => {
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
        </>
    );
}
