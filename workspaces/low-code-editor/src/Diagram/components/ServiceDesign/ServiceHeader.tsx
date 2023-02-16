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

import CloseIcon from '@material-ui/icons/Close';
import HomeIcon from '@material-ui/icons/Home';
import { ListenerDeclaration, NodePosition, ServiceDeclaration, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { ConfigOverlayFormStatus, LabelEditIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Context } from "../../../Contexts/Diagram";

import { useStyles } from "./style";

export interface ServiceHeaderProps {
    model: ServiceDeclaration;
    onClose?: () => void;
    onConfigOpen?: () => void;
    handleDiagramEdit: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ServiceHeader(props: ServiceHeaderProps) {
    const { model, onClose, handleDiagramEdit } = props;
    const classes = useStyles();

    let servicePath = "";

    model.absoluteResourcePath.forEach(item => {
        servicePath += item.value;
    });


    let listeningOnText = "";
    let serviceType = "";

    if (STKindChecker.isExplicitNewExpression(model.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                model.expressions[0].typeDescriptor
            )
        ) {
            serviceType = model.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
            listeningOnText = model.expressions[0].source;
        }
        // } else if (STKindChecker.isSimpleNameReference(model.expressions[0]) && stSymbolInfo) {
        //     const listenerNode: ListenerDeclaration = stSymbolInfo.listeners.get(
        //         model.expressions[0].name.value
        //     ) as ListenerDeclaration;
        //     if (listenerNode && STKindChecker.isQualifiedNameReference(listenerNode.typeDescriptor)) {
        //         serviceType = listenerNode.typeDescriptor.modulePrefix.value.toUpperCase();
        //         listeningOnText = model.expressions[0].source;
        //     }
    }

    const onEdit = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const lastMemberPosition: NodePosition = {
            endColumn: model.position.endColumn,
            endLine: model.position.endLine - 1,
            startColumn: model.position.startColumn,
            startLine: model.position.startLine - 1
        }
        handleDiagramEdit(model, lastMemberPosition, { formType: "ServiceDeclaration", isLoading: false });
    }

    return (
        <div className={classes.headerContainer}>
            <div className={classes.homeButton} onClick={onClose} >
                <HomeIcon />
            </div>
            <div className={classes.breadCrumb}>
                <div className={classes.title}> Service Design </div>
                {/* <div className={"header-segment"}>{serviceType}</div> */}
                <div className={"header-segment-path"}>{servicePath}</div>
                <div className={"header-segment-listener"}>
                    {listeningOnText.length > 0 ? `listening on ${listeningOnText}` : ""}
                </div>
            </div>
            <div
                onClick={onEdit}
                className={classes.editButton}
                id="edit-button"
            >
                <div>
                    <LabelEditIcon />
                </div>
            </div>

            <div className={classes.closeButton} onClick={onClose} >
                <CloseIcon />
            </div>
        </div >
    );
}
