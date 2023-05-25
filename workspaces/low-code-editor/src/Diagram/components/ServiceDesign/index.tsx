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

import { Grid, Tooltip, Typography } from "@material-ui/core";
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { ConfigOverlayFormStatus, SettingsIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
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
        props: { fullST },
    } = useContext(Context);

    useEffect(() => {
        const cc: JSX.Element[] = [];
        serviceST?.members.forEach((member, index) => {
            if (STKindChecker.isResourceAccessorDefinition(member)) {
                const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
                cc.push(
                    <div className={'service-member'} data-start-position={startPosition} >
                        <ResourceBody
                            id={index}
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

    const onSave = () => {
        // Record Editor Save
    }

    const renderRecordPanel = (closeRecordEditor: (createdRecord?: string) => void) => {
        const eofToken: NodePosition = (fullST as ModulePart).eofToken.position;
        const lastMemberPosition: NodePosition = {
            startLine: eofToken.endLine,
            startColumn: eofToken.endColumn,
            endLine: eofToken.endLine,
            endColumn: eofToken.endColumn,
        }
        return (
            <RecordEditor
                formType={""}
                targetPosition={lastMemberPosition}
                name={"record"}
                onCancel={closeRecordEditor}
                onSave={onSave}
                isTypeDefinition={true}
                isDataMapper={false}
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

    const emptyView = (
        <Grid
            container={true}
            direction="column"
            justify="center"
            alignItems="center"
            className={classes.gridContainer}
        >
            <Grid item={true}>
                <Typography variant="h3" component="div">
                    Service list is empty
                </Typography>
            </Grid>
            <Grid item={true}>
                <Typography variant="subtitle1" component="div">
                    Add a new resource
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <div className={classes.root}>
            {serviceST && (
                <>
                    <div className={classes.serviceTitle}>
                        <div className={classes.flexRow}>
                            <Typography variant="h4">
                                Service {servicePath}
                            </Typography>
                            <Typography variant="h4" className={classes.listenerText}>
                                {listeningOnText.length > 0 ? ` listening on ${listeningOnText}` : ""}
                            </Typography>
                        </div>
                        <div className={classes.flexRow}>
                            <div className={classes.resourceAdd} onClick={handlePlusClick} >
                                <AddIcon />
                                <div>Resource</div>
                            </div>
                            <Tooltip title="Service Config" placement="top" enterDelay={1000} enterNextDelay={1000}>
                                <div className={classes.serviceConfigure} onClick={handleServiceConfigureFormClick} >
                                    <SettingsIcon onClick={handleServiceConfigureFormClick} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    {children.length > 0 && (
                        <div className={classes.expandAll}>
                            <div className={classes.collapseBtn} onClick={onExpandAllClick}>
                                <Typography variant="body1">{isAllExpanded ? "Collapse All" : "Expand All"}</Typography>
                                {isAllExpanded && <UnfoldLessIcon onClick={onExpandAllClick} />}
                                {!isAllExpanded && <UnfoldMoreIcon onClick={onExpandAllClick} />}
                            </div>
                        </div>
                    )}
                    <div className={classes.serviceList}>
                        <>
                            {children.length > 0 ? children : emptyView}
                        </>
                    </div>

                </>
            )}

        </div>
    )
}
