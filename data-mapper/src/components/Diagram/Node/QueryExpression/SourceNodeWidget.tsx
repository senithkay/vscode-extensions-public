import { Theme, createStyles, makeStyles } from "@material-ui/core";
import TreeView from "@material-ui/lab/TreeView";
import { RecordField, RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import React from "react";
import TreeItem from "@material-ui/lab/TreeItem";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sourceTree: {
            width: '100%',
            maxWidth: 200,
            backgroundColor: "#FEF6EB",
            padding: "5px",
            color: theme.palette.text.primary
        }
    }),
);

export interface SourceNodeFieldWidgetProps {
    field: RecordField;
    parentId: string;
}

export function SourceNodeFieldWidget(props: SourceNodeFieldWidgetProps) {
    const { field, parentId } = props;
    const nodeId = parentId + "." + field.fieldName.value;
    return <>
      <TreeItem nodeId={nodeId} label={field.fieldName.value}>
        {STKindChecker.isRecordField(field) && STKindChecker.isRecordTypeDesc(field.typeName) &&
            field.typeName.fields.map((field) => {
                if (STKindChecker.isRecordField(field)) {
                    return <SourceNodeFieldWidget
                        field={field}
                        parentId={nodeId}
                    />;
                } else {
                    // TODO handle fields with default values and included records
                    return <></>;
                }
            })
        }
        </TreeItem>
    </>
}

export interface SourceNodeWidgetProps {
    typeDesc: RecordTypeDesc;
}

export function SourceNodeWidget(props: SourceNodeWidgetProps) {
    const { typeDesc } = props;
    const classes = useStyles();
    const getNodeIds = (field: RecordField, parentId: string) => {
        const currentNodeId = parentId + "." + field.fieldName.value;
        const nodeIds = [currentNodeId];
        if (STKindChecker.isRecordTypeDesc(field.typeName)) {
            field.typeName.fields.forEach((subField) => {
                if (STKindChecker.isRecordField(subField)) {
                    nodeIds.push(...getNodeIds(subField, currentNodeId));
                }
            });
        }
        return nodeIds;
    }

    const allNodeIds:string[] = [];

    if (STKindChecker.isRecordTypeDesc(typeDesc)) {
        typeDesc.fields.forEach((field) => {
            if (STKindChecker.isRecordField(field)) {
                allNodeIds.push(...getNodeIds(field, "."));
            }
        });
    }
    return <div className={classes.sourceTree}>
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultExpanded={allNodeIds}
        >
                {
					STKindChecker.isRecordTypeDesc(typeDesc) && (
						typeDesc.fields.map((field) => {
							if (STKindChecker.isRecordField(field)) {
								return <SourceNodeFieldWidget
                                    parentId="."
                                    field={field}
								/>;
							} else {
								// TODO handle fields with default values and included records
								return <></>;
							}
						})
					)
				}
        </TreeView>
    </div>
}