/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import { css } from '@emotion/css';
import classNames from "classnames";

import { InputOutputPortModel } from '../Port';

import { ExpressionLabelModel } from './ExpressionLabelModel';
import { Button, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';
import { getEditorLineAndColumn } from '../utils/common-utils';

export interface EditableLabelWidgetProps {
    model: ExpressionLabelModel;
}

export const useStyles = () => ({
    container: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
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
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);
    const classes = useStyles();
    const { field, link, context, deleteLink } = props.model;

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
        const range = getEditorLineAndColumn(field);
        context.goToSource(range);
    };

    React.useEffect(() => {
        if (link) {
            link.registerListener({
                selectionChanged(event) {
                    setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
                },
            });
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

    let isSourceCollapsed = false;
    let isTargetCollapsed = false;
    const collapsedFields = [""];
    // const collapsedFields = props.model?.context?.collapsedFields;

    const source = props.model?.link?.getSourcePort()
    const target = props.model?.link?.getTargetPort()

    if (source instanceof InputOutputPortModel) {
        if (source?.parentId) {
            const fieldName = source.field.fieldName;
            isSourceCollapsed = collapsedFields?.includes(`${source.parentId}.${fieldName}`)
        } else {
            isSourceCollapsed = collapsedFields?.includes(source.portName)
        }
    }

    if (target instanceof InputOutputPortModel) {
        if (target?.parentId) {
            const fieldName = target.field.fieldName;
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
