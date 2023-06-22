/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js  jsx-wrap-multiline
import React, { useContext, useState } from "react"

import { ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { useSelectedStatus } from "../../../hooks";
import { findActualEndPositionOfIfElseStatement, getServiceTypeFromModel, getSTComponent } from "../../../Utils";
import { TopLevelPlus } from "../../PlusButtons/TopLevelPlus";

import { EmptyHeader } from "./EmptyHeader";
import { ServiceHeader } from "./ServiceHeader";
import "./style.scss";

export const DEFAULT_SERVICE_WIDTH: number = 500;
export const SERVICE_MARGIN_LEFT: number = 24.5;
export const SERVICE_PLUS_OFFSET: number = 7.5;
export interface ServiceProps {
    model: ServiceDeclaration;
}

export function Service(props: ServiceProps) {
    const { model } = props;
    const diagramContext = useContext(Context);
    const { isReadOnly, stSymbolInfo } = diagramContext.props;
    const showTryitView = diagramContext?.api?.webView?.showTryitView;
    const run = diagramContext?.api?.project?.run;
    const [isExpanded, setIsExpanded] = useSelectedStatus(model);
    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    const serviceType = getServiceTypeFromModel(model, stSymbolInfo);
    const isTriggerType = serviceType !== "http";
    const children: JSX.Element[] = [];

    model.members.forEach((member) => {
        const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
        children.push(
            <div className={'service-member'}  data-start-position={startPosition} >
                {getSTComponent(member)}
            </div>
        );
    });

    const onClickTryIt = async () => {
        let servicePath = "";

        model.absoluteResourcePath.forEach((pathSegment) => {
            servicePath += pathSegment.value;
        });
        showTryitView(servicePath, model.position);
    };

    const onClickRun = async () => {
        run([]);
    };

    function renderButtons() {
        const tryItBtn = (
            <button className="action-button" onClick={onClickTryIt}>
                Try it
            </button>
        );

        if (model.isRunnable) {
            const runBtn = (
                <button className="action-button" onClick={onClickRun}>
                    Run
                </button>
            );
            if (!isTriggerType) {
                return [runBtn, tryItBtn];
            }
            return [runBtn];
        } else {
            return tryItBtn;
        }
    }

    function isHttpService() {
        if (STKindChecker.isServiceDeclaration(model) && model.expressions?.length > 0) {
            const expression = model.expressions[0];
            if (
                expression &&
                STKindChecker.isExplicitNewExpression(expression) &&
                STKindChecker.isQualifiedNameReference(expression.typeDescriptor) &&
                STKindChecker.isIdentifierToken(expression.typeDescriptor.modulePrefix) &&
                expression.typeDescriptor.modulePrefix.value === "http"
            ) {
                return true;
            } else if (
                expression &&
                STKindChecker.isSimpleNameReference(expression) &&
                expression.typeData?.typeSymbol?.moduleID?.moduleName === "http"
            ) {
                return true;
            }
        }
        return false;
    }

    function isTrigger() {
        if (STKindChecker.isServiceDeclaration(model) && model.expressions?.length > 0) {
            const expression = model.expressions[0];
            if (
                expression &&
                STKindChecker.isSimpleNameReference(expression) &&
                expression.typeData?.typeSymbol?.moduleID?.moduleName?.includes("trigger")
            ) {
                return true;
            }
        }
        return false;
    }

    return (
        <>
            {(isHttpService() || isTrigger()) && (
                <div className={"service"}>
                    <ServiceHeader model={model} isExpanded={isExpanded} onExpandClick={onExpandClick} onClickTryIt={onClickTryIt} onClickRun={onClickRun} />
                    <div className={"content-container"}>
                        {isExpanded && (
                            <>
                                {children}
                                {!isReadOnly && (
                                    <TopLevelPlus
                                        kind={model.kind}
                                        targetPosition={model.closeBraceToken.position}
                                        isTriggerType={isTriggerType}
                                        isDocumentEmpty={model.members.length === 0}
                                        showCategorized={true}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {!(isHttpService() || isTrigger()) && (
                <div className={"class-component"}>
                    <EmptyHeader model={model} onExpandClick={onExpandClick} isExpanded={isExpanded} />
                </div>
            )}
        </>
    );
}
