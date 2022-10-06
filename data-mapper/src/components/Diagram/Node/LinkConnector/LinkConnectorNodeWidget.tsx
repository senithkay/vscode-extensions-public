import * as React from 'react';

import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import TooltipBase from '@material-ui/core/Tooltip';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExpressionIcon from '@material-ui/icons/ExplicitOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import {STKindChecker} from "@wso2-enterprise/syntax-tree";
import clsx from 'clsx';

import { DiagnosticWidget } from '../../Diagnostic/Diagnostic';
import { DataMapperPortWidget } from '../../Port';
import { getFieldLabel } from '../../utils/dm-utils';

import { LinkConnectorNode } from './LinkConnectorNode';

export const tooltipBaseStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

const styles = makeStyles((theme: Theme) => createStyles({
    root: {
        width: '100%',
        backgroundColor: theme.palette.common.white,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: theme.palette.grey[400],
        boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
        borderRadius: "10px",
		alignItems: "center",
		overflow: "hidden",
    },
    element: {
        backgroundColor: theme.palette.common.white,
        padding: "10px",
        cursor: "pointer",
        transitionDuration: "0.2s",
        userSelect: "none",
        pointerEvents: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&:hover": {
            filter: "brightness(0.95)",
        },
    },
    iconWrapper: {
        height: "22px",
        width: "22px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    fromClause: {
        padding: "5px",
        fontFamily: "monospace"
    },
    mappingPane: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    icons: {
        padding: '8px',
        '&:hover': {
            backgroundColor: '#F0F1FB',
        }
    },
    expandIcon: {
        height: '15px',
        width: '15px',
        marginTop: '-7px'
    },
    buttonWrapper: {
        border: '1px solid #e6e7ec',
        borderRadius: '8px',
        position: "absolute",
        right: "35px"
    },
    separator: {
        height: "22px",
        width: "1px",
        backgroundColor: theme.palette.grey[200],
    },
    editIcon: {
        color: theme.palette.grey[300],
        padding: "10px",
        height: "42px",
        width: "42px"
    },
    deleteIcon: {
        color: theme.palette.error.main
    }
}),);

export interface LinkConnectorNodeWidgetProps {
    node: LinkConnectorNode;
    engine: DiagramEngine;
}

export function LinkConnectorNodeWidget(props: LinkConnectorNodeWidgetProps) {
    const node = props.node;
    const classes = styles();
    const engine = props.engine;
    const hasError = node.hasError();
    const diagnostic = hasError ? node.diagnostics[0] : null;

    const onClickEdit = () => {
        const valueNode = props.node.valueNode;
        if (STKindChecker.isSpecificField(valueNode)) {
            props.node.context.enableStatementEditor({
                valuePosition: valueNode.valueExpr.position,
                value: valueNode.valueExpr.source,
                label: (props.node.isPrimitiveTypeArrayElement ? getFieldLabel(props.node.targetPort.parentId)
                    : props.node.editorLabel)
            });
        }
    };

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);


    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <DataMapperPortWidget engine={engine} port={node.inPort} />
                <TooltipComponent interactive={false} arrow={true} title={"Multi-Input Expression"}>
                    <span className={classes.editIcon} >
                        <ExpressionIcon  />
                    </span>
                </TooltipComponent>
                <div className={classes.element} onClick={onClickEdit}>
                    <div className={classes.iconWrapper}>
                        <CodeOutlinedIcon className={clsx(classes.icons, classes.editIcon)}/>
                    </div>
                </div>
                <div className={classes.element} onClick={() => node.deleteLink()}>
                    <div className={classes.iconWrapper}>
                        <DeleteIcon className={clsx(classes.deleteIcon)}/>
                    </div>
                </div>
                { diagnostic &&(
                    <div className={classes.element}>
                        <DiagnosticWidget 
                            diagnostic={diagnostic} 
                            value={ props.node.valueNode.source}
                            onClick={onClickEdit}
                        />
                    </div>
                )}
                <DataMapperPortWidget engine={engine} port={node.outPort} />
            </div>
        </div>
    );
}

