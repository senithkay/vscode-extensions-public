/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from "react";

import { NodePosition, ServiceDeclaration, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { useStyles } from "../../ServiceDesign/style";

import { GraphqlOperation } from "./GraphqlOperation";

interface GraphqlServicePanelProps {
    model: ServiceDeclaration;
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode) => void;
}

export function GraphqlServicePanel(props: GraphqlServicePanelProps) {
    const { model, functionPanel } = props;

    const classes = useStyles();

    const [children, setChildren] = useState<JSX.Element[]>([]);

    let servicePath = "";
    let listeningOnText = "";
    if (model) {
        model.absoluteResourcePath?.forEach(item => {
            servicePath += item.value;
        });

        if (model.expressions.length > 0 && STKindChecker.isExplicitNewExpression(model.expressions[0])) {
            if (STKindChecker.isQualifiedNameReference(model.expressions[0].typeDescriptor)) {
                listeningOnText = model.expressions[0].source;
            }
        }
    }

    useEffect(() => {
        const cc: JSX.Element[] = [];
        model?.members.forEach((member) => {
            const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
            cc.push(
                <div className={'service-member'} data-start-position={startPosition}>
                    {(STKindChecker.isResourceAccessorDefinition(member) ||
                        (STKindChecker.isObjectMethodDefinition(member) && member.functionName?.value !== "init")) &&
                    <GraphqlOperation model={member} functionPanel={functionPanel}/>
                    }
                </div>
            );
        });
        setChildren(cc);
    }, [model]);

    return (
        <div className={classes.root}>
            {model && (
                <>
                    <div className={classes.serviceTitle}>
                        <span className={classes.servicePath}>Service {servicePath}</span>
                        <span className={classes.listenerText}>
                            {listeningOnText.length > 0 ? ` listening on ${listeningOnText}` : ''}
                        </span>
                    </div>
                    <div className={classes.serviceList}>
                        <>
                            {children}
                        </>
                    </div>
                </>
            )}
        </div>
    );
}
