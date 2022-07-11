import React from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';

// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { RecordField, SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortWidget } from "../../../Port/view/DataMapperPortWidget";
import { DataMapperPortModel } from "../../../Port/model/DataMapperPortModel";
import { getFieldTypeName } from "../../../utils";

// tslint:disable: jsx-no-multiline-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            minWidth: "100px",
            backgroundColor: "#74828F"
        },
        treeLabelOutPort: {
            float: "right"
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "25px"
        },
        typeLabel: {
            marginLeft: "3px",
            backgroundColor: "green",
            padding: "2px 5px 2px 5px"
        }
    }),
);

export interface SpecificFieldWidgetProps {
    parentId: string;
    field: SpecificField;
    engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel;
}

export function SpecificFieldWidget(props: SpecificFieldWidgetProps) {
    const { parentId, field, getPort, engine } = props;
    const classes = useStyles();
    
    const fieldId = `${parentId}.${field.fieldName.value}`;
    const portIn = getPort(fieldId + ".IN");
    const portOut = getPort(fieldId + ".OUT");

    const typeName = STKindChecker.isRecordField(field)
        ? getFieldTypeName(field)
        : "record";

    const label = (
        <div className={classes.treeLabel}>
            <span className={classes.treeLabelInPort}>
                {portIn &&
                    <DataMapperPortWidget engine={engine} port={portIn} />
                }
            </span>
            <span>
                {field.fieldName.value}
            </span>
            {typeName &&
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            }
            <span className={classes.treeLabelOutPort}>
                {portOut &&
                    <DataMapperPortWidget engine={engine} port={portOut} />
                }
            </span>
        </div>
    );
    return (
        <>
            <TreeItem nodeId={fieldId} label={label}>
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
            </TreeItem>
        </>
    );
}
