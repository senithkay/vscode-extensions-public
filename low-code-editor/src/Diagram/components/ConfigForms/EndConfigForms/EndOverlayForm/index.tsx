/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import { ActionStatement, RemoteMethodCallAction, ReturnStatement, SimpleNameReference } from "@ballerina/syntax-tree";

import { WizardType } from "../../../../../ConfigurationSpec/types";
import { ConfigOverlayFormStatus } from "../../../../../Definitions";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { EndConfig, RespondConfig } from "../../../Portals/ConfigForm/types";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../../Portals/Overlay";

import { AddRespondForm } from "./AddRespondForm";
import { AddReturnForm } from "./AddReturnForm";

interface EndOverlayFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
    position: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function EndOverlayForm(props: EndOverlayFormProps) {
    const { config, onCancel, onSave, position, configOverlayFormStatus } = props;
    const { isLoading, error, formType } = configOverlayFormStatus;

    if (formType === "Return") {
        config.expression = "";
    } else if (formType === "Respond") {
        config.expression = {
            respondExpression: "",
            variable: "",
            caller: "caller",
            genType: ""
        };
    }

    if (config.wizardType === WizardType.EXISTING && formType === "Respond") {
        const respondModel: ActionStatement = config.model as ActionStatement;
        const remoteCallModel: RemoteMethodCallAction = respondModel?.expression.expression as RemoteMethodCallAction;
        const respondFormConfig: RespondConfig = config.expression as RespondConfig;
        respondFormConfig.respondExpression = remoteCallModel?.arguments[0].source;
    } else if (config.wizardType === WizardType.EXISTING && formType === "Return") {
        const returnStmt = config.model as ReturnStatement;
        const simpleNameRef = returnStmt.expression as SimpleNameReference;
        config.expression = simpleNameRef?.name.value;
    }

    if (isLoading) {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            <TextPreloaderVertical position='relative' />
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );

    } else if (error) {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            {error?.message}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>

            </div>
        );
    } else {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            {formType === "Return" && <AddReturnForm config={config} onSave={onSave} onCancel={onCancel} />}
                            {formType === "Respond" && <AddRespondForm config={config} onSave={onSave} onCancel={onCancel} />}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );
    }
}
