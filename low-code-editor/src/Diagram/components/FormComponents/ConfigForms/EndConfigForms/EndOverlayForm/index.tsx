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
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import { ConfigOverlayFormStatus, EndConfig, RespondConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ActionStatement, ExpressionFunctionBody, RemoteMethodCallAction, ReturnStatement, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";

import { AddRespondForm } from "./AddRespondForm";
import { AddReturnForm } from "./AddReturnForm";
interface EndOverlayFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function EndOverlayForm(props: EndOverlayFormProps) {
    const { config, onCancel, onSave, onWizardClose, configOverlayFormStatus } = props;
    const { isLoading, error, formType, formArgs } = configOverlayFormStatus;
    const isExpressionFunctionBody: boolean = config.model ?
    STKindChecker.isExpressionFunctionBody(config.model) : false;
    const targetPosition = formArgs.targetPosition;
    const {
        props: { syntaxTree },
        api: {
            panNZoom: {
                pan,
                fitToScreen
            }
        }
    } = useContext(Context);

    if (formType === "Return") {
        config.expression = "";
    } else if (formType === "Respond") {
        let callerName = "";
        const caller = STKindChecker.isModulePart(syntaxTree) && syntaxTree.members
                        .filter((service => STKindChecker.isServiceDeclaration(service)
                            && service.position.startLine < targetPosition.startLine
                            && service.position.endLine > targetPosition.startLine
                            && service.members
                        .forEach(resource => {
                            if (resource.position.startLine < targetPosition.startLine
                                && resource.position.endLine >= targetPosition.startLine) {
                                    callerName = STKindChecker.isResourceAccessorDefinition(resource)
                                                 && STKindChecker.isRequiredParam(resource.functionSignature.parameters[0])
                                                 && resource.functionSignature.parameters[0].paramName.value;
                            }
                        })));

        config.expression = {
            respondExpression: "",
            variable: "",
            caller: callerName,
            genType: ""
        };
    }

    if (config.model && formType === "Respond") {
        const respondModel: ActionStatement = config.model as ActionStatement;
        // TODO handle other cases
        if (STKindChecker.isCheckAction(respondModel.expression)) {
            if (STKindChecker.isRemoteMethodCallAction(respondModel.expression.expression)) {
                const remoteCallModel = respondModel?.expression.expression;
                const respondFormConfig: RespondConfig = config.expression as RespondConfig;
                respondFormConfig.respondExpression = remoteCallModel?.arguments[0].source;
            }
        }
    } else if (config.model && formType === "Return") {
        if (isExpressionFunctionBody) {
            const expressionEditor: ExpressionFunctionBody = config?.model as ExpressionFunctionBody;
            config.expression = expressionEditor.expression?.source;
        } else {
            const returnStmt = config.model as ReturnStatement;
            const returnExpression = returnStmt.expression;
            config.expression = returnExpression?.source;
        }
    }

    if (isLoading) {
        return (
            <div>
                <TextPreloaderVertical position='relative' />
            </div>
        );

    } else if (error) {
        return (
            <div>
                {error?.message}
            </div>
        );
    } else {
        return (
            <div>
                {
                    formType === "Return" && (
                        <AddReturnForm
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
                {
                    formType === "Respond" && (
                        <AddRespondForm
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
            </div>
        );
    }
}
