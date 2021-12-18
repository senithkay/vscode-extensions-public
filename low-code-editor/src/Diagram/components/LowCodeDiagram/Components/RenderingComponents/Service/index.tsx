/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js  jsx-wrap-multiline
import React, { useState } from "react"

import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { useSelectedStatus } from "../../../../../hooks";
import { getSTComponent } from "../../../../../utils";
import expandTracker from "../../../../../utils/expand-tracker";
import { getServiceTypeFromModel } from "../../../../FormComponents/ConfigForms/ServiceConfigForm/util";
import { getNodeSignature } from "../../../Utils";
import { TopLevelPlus } from "../../PlusButtons/TopLevelPlus";

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
    const { props: { stSymbolInfo } } = useDiagramContext();

    const [isExpanded, setIsExpanded] = useSelectedStatus(model);
    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

    const serviceType = getServiceTypeFromModel(model, stSymbolInfo);
    const isTriggerType = serviceType !== "http";
    const children: JSX.Element[] = []

    model.members.forEach(member => {
        children.push(
            <div className={'service-member'}>
                <TopLevelPlus
                    kind={model.kind}
                    targetPosition={member.position}
                    isTriggerType={isTriggerType}
                    showCategorized={true}
                />
                {getSTComponent(member)}
            </div>
        );
    });

    const {
        api: {
            webView: {
                showSwaggerView
            },
            project: {
                run
            }
        }
    } = useDiagramContext();

    const onClickTryIt = async () => {
        let servicePath = "";

        model.absoluteResourcePath.forEach((pathSegment) => {
            servicePath += pathSegment.value;
        });
        showSwaggerView(servicePath);
    };

    const onClickRun = async () => {
        run([]);
    }

    function renderButtons() {
        const tryItBtn = <p className={"action-text"} onClick={onClickTryIt}>Try it</p>

        if (model.isRunnable) {
            const runBtn = <p className={"action-text"} onClick={onClickRun}>Run</p>
            if (!isTriggerType) {
                return [runBtn, tryItBtn];
            }
            return [runBtn];
        } else {
            return tryItBtn;
        }
    }

    return (
        <>
            <div className={'service'} >
                <div className={"action-container"}>
                    {renderButtons()}
                </div>
                <ServiceHeader model={model} isExpanded={isExpanded} onExpandClick={onExpandClick} />
                <div className={'content-container'}>
                    {isExpanded && (
                        <>
                            {children}
                            <TopLevelPlus
                                kind={model.kind}
                                targetPosition={model.closeBraceToken.position}
                                isTriggerType={isTriggerType}
                                isDocumentEmpty={model.members.length === 0}
                                showCategorized={true}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

