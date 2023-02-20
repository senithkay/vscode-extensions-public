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
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { ArrowBack } from "@material-ui/icons";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { ConfigOverlayFormStatus, SettingsIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ComponentExpandButton, LinePrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ModulePart,
    NodePosition,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { AddIcon } from "../../../assets/icons";
import { Context } from "../../../Contexts/Diagram";
import { RecordEditor } from "../FormComponents/ConfigForms";

import { ResourceBody } from "./Resource";
import { ServiceHeader } from "./ServiceHeader";
import { useStyles } from "./style";
import "./style.scss";

export interface ServiceDesignProps {
    model: STNode;
    langClientPromise: Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    onClose: () => void;
    handleDiagramEdit: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ServiceDesign(props: ServiceDesignProps) {

    const {
        model,
        handleDiagramEdit
    } = props;

    const [isAllExpanded, setIsAllExpanded] = useState(false);
    const [children, setChildren] = useState<JSX.Element[]>([]);

    const classes = useStyles();

    const serviceST = model as ServiceDeclaration;

    const {
        props: { syntaxTree },
    } = useContext(Context);

    useEffect(() => {
        const cc: JSX.Element[] = [];
        serviceST?.members.forEach((member) => {
            if (STKindChecker.isResourceAccessorDefinition(member)) {
                const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
                cc.push(
                    <div className={'service-member'} data-start-position={startPosition} >
                        <ResourceBody
                            handleDiagramEdit={handleDiagramEdit}
                            model={member as ResourceAccessorDefinition}
                            isExpandedAll={isAllExpanded}
                        />
                    </div>
                );
            }
        });
        setChildren(cc);
    }, [serviceST, isAllExpanded]);



    const onExpandAllClick = () => {
        const ex = !isAllExpanded;
        setIsAllExpanded(ex);
    }

    const handlePlusClick = () => {
        const lastMemberPosition: NodePosition = {
            endColumn: serviceST.closeBraceToken.position.endColumn,
            endLine: serviceST.closeBraceToken.position.endLine,
            startColumn: serviceST.closeBraceToken.position.startColumn,
            startLine: serviceST.closeBraceToken.position.startLine
        }
        handleDiagramEdit(undefined, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false, renderRecordPanel });
    };

    const renderRecordPanel = (closeRecordEditor: (createdRecord?: string) => void) => {
        const servicePosition = (syntaxTree as ModulePart);
        const lastMember: NodePosition = servicePosition.position;
        const lastMemberPosition: NodePosition = {
            endColumn: 0,
            endLine: lastMember.startLine - 1,
            startColumn: 0,
            startLine: lastMember.startLine - 1
        }
        return (
            <RecordEditor
                formType={""}
                targetPosition={lastMemberPosition}
                name={"record"}
                onCancel={closeRecordEditor}
                // tslint:disable-next-line: no-empty
                onSave={() => { }}
                isTypeDefinition={true}
                isDataMapper={true}
                showHeader={true}
            />
        );
    };

    let servicePath = "";
    let listeningOnText = "";
    if (serviceST) {
        serviceST.absoluteResourcePath?.forEach(item => {
            servicePath += item.value;
        });

        if (serviceST.expressions.length > 0 && STKindChecker.isExplicitNewExpression(serviceST.expressions[0])) {
            if (STKindChecker.isQualifiedNameReference(serviceST.expressions[0].typeDescriptor)) {
                // serviceType = serviceST.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
                listeningOnText = serviceST.expressions[0].source;
            }
        }
    }

    const handleServiceConfigureFormClick = () => {
        handleDiagramEdit(model, model?.position, { formType: "ServiceDeclaration", isLoading: false });
    }

    return (
        <div className={classes.root}>
            {serviceST && (
                <>
                    {/*<ServiceHeader onClose={onClose} model={fnSTZ} />*/}
                    <div className={classes.serviceTitle}>
                        <div className={classes.serviceTitleText}>
                            <span className={classes.servicePath}>Service {servicePath}</span>
                            <span className={classes.listenerText}>
                                {listeningOnText.length > 0 ? ` listening on ${listeningOnText}` : ''}
                            </span>
                        </div>
                        <div className={classes.serviceConfigure} onClick={handleServiceConfigureFormClick} >
                            <SettingsIcon />
                            <div>Configure Service</div>
                        </div>
                    </div>
                    <div className={classes.expandAll}>
                        <div className={classes.collapseBtn} onClick={onExpandAllClick}>
                            {isAllExpanded ? 'Collapse All' : 'Expand All'}
                            <ComponentExpandButton
                                isExpanded={isAllExpanded}
                                onClick={onExpandAllClick}
                            />
                        </div>
                    </div>
                    <div className={classes.serviceList}>
                        <>
                            {children}
                        </>
                    </div>

                    <div className={classes.plusButton}>
                        <LinePrimaryButton
                            text={"Add Resource"}
                            onClick={handlePlusClick}
                            dataTestId="add-new-btn"
                            startIcon={<AddIcon />}
                        />
                    </div>
                </>
            )}

        </div>
    )
}
