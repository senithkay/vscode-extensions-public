/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import { css } from '@emotion/css';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';
import classNames from "classnames";

import { CodeActionWidget } from '../CodeAction/CodeAction';
import { DiagnosticWidget } from '../Diagnostic/Diagnostic';
import { DataMapperLinkModel } from "../Link";
import {
    canConvertLinkToQueryExpr,
    generateQueryExpression
} from '../Link/link-utils';
import { RecordFieldPortModel } from '../Port';
import {
    getBalRecFieldName,
    getFilteredUnionOutputTypes,
    getLocalVariableNames
} from '../utils/dm-utils';
import { handleCodeActions } from "../utils/ls-utils";

import { ExpressionLabelModel } from './ExpressionLabelModel';
import { Button, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';

export interface EditableLabelWidgetProps {
    model: ExpressionLabelModel;
}

export const useStyles = () => ({
    container: css({
        width: '100%',
        backgroundColor: "var(--vscode-welcomePage-tileBackground)",
        padding: "2px",
        borderRadius: "6px",
        display: "flex",
        color: "var(--vscode-checkbox-border)",
        alignItems: "center",
        "& > vscode-button > *": {
            margin: "0 2px"
        }
    }),
    containerHidden: css({
        visibility: 'hidden',
    }),
    btnContainer: css({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        "& > *": {
            margin: "0 2px"
        }
    }),
    element: css({
        backgroundColor: 'var(--vscode-input-background)',
        padding: '10px',
        cursor: 'pointer',
        transitionDuration: '0.2s',
        userSelect: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
            filter: 'brightness(0.95)',
        },
    }),
    iconWrapper: css({
        height: '22px',
        width: '22px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
    codeIconButton: css({
        color: 'var(--vscode-checkbox-border)',
    }),
    deleteIconButton: css({
        color: 'var(--vscode-checkbox-border)',
    }),
    separator: css({
        height: 'fit-content',
        width: '1px',
        backgroundColor: 'var(--vscode-editor-lineHighlightBorder)',
    }),
    rightBorder: css({
        borderRightWidth: '2px',
        borderColor: 'var(--vscode-pickerGroup-border)',
    }),
    loadingContainer: css({
        padding: '10px',
    }),
});

export enum LinkState {
    TemporaryLink,
    LinkSelected,
    LinkNotSelected
}

// now we can render all what we want in the label
export function EditableLabelWidget(props: EditableLabelWidgetProps) {
    const [linkStatus, setLinkStatus] = React.useState<LinkState>(LinkState.LinkNotSelected);
    const [canUseQueryExpr, setCanUseQueryExpr] = React.useState(false);
    const [codeActions, setCodeActions] = React.useState([]);
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);
    const classes = useStyles();
    const { link, context, value, field, editorLabel, deleteLink } = props.model;
    const diagnostic = link && link.hasError() ? link.diagnostics[0] : null;

    React.useEffect(() => {
        async function genModel() {
            const actions = (await handleCodeActions(context.filePath, link?.diagnostics, context.langServerRpcClient))
            setCodeActions(actions)
        }

        if (value) {
            void genModel();
        }
    }, [props.model]);

    const onClickDelete = (evt?: React.MouseEvent<HTMLDivElement>) => {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        setDeleteInProgress(true);
        if (deleteLink) {
            deleteLink();
        }
    };

    const onClickEdit = (evt?: React.MouseEvent<HTMLDivElement>) => {
        const currentReference = (link.getSourcePort() as RecordFieldPortModel).fieldFQN;
        context.referenceManager.handleCurrentReferences([currentReference]);
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        context.enableStatementEditor({
            valuePosition: field.position as NodePosition,
            value: field.source,
            label: editorLabel
        });
    };

    const applyQueryExpression = (linkModel: DataMapperLinkModel, targetRecord: Type) => {
        if (linkModel.value
            && (STKindChecker.isFieldAccess(linkModel.value) || STKindChecker.isSimpleNameReference(linkModel.value))) {

                let isOptionalSource = false;
                const sourcePort = linkModel.getSourcePort();

                if (sourcePort instanceof RecordFieldPortModel && sourcePort.field.optional) {
                    isOptionalSource = true;
                }

                const localVariables = getLocalVariableNames(context.functionST);

                const querySrc = generateQueryExpression(linkModel.value.source, targetRecord, isOptionalSource,
                    [...localVariables]);
                const position = linkModel.value.position as NodePosition;
                const modifications = [{
                    type: "INSERT",
                    config: {
                        "STATEMENT": querySrc,
                    },
                    endColumn: position.endColumn,
                    endLine: position.endLine,
                    startColumn: position.startColumn,
                    startLine: position.startLine
                }];
                void context.applyModifications(modifications);
        }
    };

    React.useEffect(() => {
        if (link) {
            link.registerListener({
                selectionChanged(event) {
                    setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
                },
            });
            setCanUseQueryExpr(canConvertLinkToQueryExpr(link));
        } else {
            setLinkStatus(LinkState.TemporaryLink);
        }
    }, [props.model]);

    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    const elements: React.ReactNode[] = [
        (
            <div className={classes.btnContainer}>
                <Button
                    appearance="icon"
                    onClick={onClickEdit}
                    data-testid={`expression-label-edit`}
                    sx={{ userSelect: "none", pointerEvents: "auto" }}
                >
                    <Codicon name="code" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                </Button>
                <div className={classes.separator}/>
                {deleteInProgress ? (
                    loadingScreen
                ) : (
                    <Button
                        appearance="icon"
                        onClick={onClickDelete}
                        data-testid={`expression-label-delete`}
                        sx={{ userSelect: "none", pointerEvents: "auto" }}
                    >
                        <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                    </Button>
                )}
            </div>
        ),
    ];

    const onClickConvertToQuery = () => {
        const targetPort = link.getTargetPort();

        if (targetPort instanceof RecordFieldPortModel) {
            const targetPortField = targetPort.field;
            if (targetPortField.typeName === PrimitiveBalType.Array && targetPortField?.memberType) {
                applyQueryExpression(link, targetPortField.memberType);
            } else if (targetPortField.typeName === PrimitiveBalType.Union){
                const [type] = getFilteredUnionOutputTypes(targetPortField);
                if (type.typeName === PrimitiveBalType.Array && type.memberType) {
                    applyQueryExpression(link, type.memberType);
                }
            }
        }
    };

    const additionalActions = [];
    if (canUseQueryExpr) {
        additionalActions.push({
            title: "Convert to Query",
            onClick: onClickConvertToQuery
        });
    }

    if (codeActions.length > 0 || additionalActions.length > 0) {
        elements.push(<div className={classes.separator}/>);
        elements.push(
            <CodeActionWidget
                codeActions={codeActions}
                context={context}
                additionalActions={additionalActions}
                btnSx={{ margin: "0 2px" }}
            />
        );
    }

    if (diagnostic) {
        elements.push(<div className={classes.separator}/>);
        elements.push(
            <DiagnosticWidget
                diagnostic={diagnostic}
                value={value}
                onClick={onClickEdit}
                isLabelElement={true}
                btnSx={{ margin: "0 2px" }}
            />
        );
    }

    let isSourceCollapsed = false;
    let isTargetCollapsed = false;
    const collapsedFields = props.model?.context?.collapsedFields;

    const source = props.model?.link?.getSourcePort()
    const target = props.model?.link?.getTargetPort()

    if (source instanceof RecordFieldPortModel) {
        if (source?.parentId) {
            const fieldName = getBalRecFieldName(source.field.name);
            isSourceCollapsed = collapsedFields?.includes(`${source.parentId}.${fieldName}`)
        } else {
            isSourceCollapsed = collapsedFields?.includes(source.portName)
        }
    }

    if (target instanceof RecordFieldPortModel) {
        if (target?.parentId) {
            const fieldName = getBalRecFieldName(target.field.name);
            isTargetCollapsed = collapsedFields?.includes(`${target.parentId}.${fieldName}`)
        } else {
            isTargetCollapsed = collapsedFields?.includes(target.portName)
        }
    }

    if (props.model?.valueNode && isSourceCollapsed && isTargetCollapsed) {
        // for direct links, disable link widgets if both sides are collapsed
        return null
    } else if (!props.model?.valueNode && (isSourceCollapsed || isTargetCollapsed)) {
        // for links with intermediary nodes,
        // disable link widget if either source or target port is collapsed
        return null;
    }

    return linkStatus === LinkState.TemporaryLink
        ? (
            <div
                className={classNames(
                    classes.container
                )}
            >
                <div className={classNames(classes.element, classes.loadingContainer)}>
                    {loadingScreen}
                </div>
            </div>
        ) : (
            <div
                data-testid={`expression-label-for-${props.model?.link?.getSourcePort()?.getName()}-to-${props.model?.link?.getTargetPort()?.getName()}`}
                className={classNames(
                    classes.container,
                    linkStatus === LinkState.LinkNotSelected && !deleteInProgress && classes.containerHidden
                )}
            >
                {elements}
            </div>
        );
}
