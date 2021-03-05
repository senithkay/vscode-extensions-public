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
// tslint:disable: jsx-wrap-multiline
// tslint:disable: ordered-imports
import React, { useContext } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../../Contexts/Diagram";

import { WizardType } from "../../../../ConfigurationSpec/types";
import { STModification } from "../../../../Definitions";
import { getAllVariables } from "../../../utils/mixins";
import {
    createPropertyStatement,
    createReturnStatement,
    updatePropertyStatement,
    updateReturnStatement
} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { EndConfig, RespondConfig } from "../../Portals/ConfigForm/types";
import { DiagramOverlayPosition } from "../../Portals/Overlay";
import { genVariableName } from "../../Portals/utils";

import { EndOverlayForm } from "./EndOverlayForm";
export interface AddEndFormProps {
    type: string;
    targetPosition: DraftInsertPosition;
    scopeSymbols?: string[];
    onCancel: () => void;
    onSave: () => void;
    model?: STNode;
    wizardType?: WizardType;
    position: DiagramOverlayPosition;
}

export function EndConfigForm(props: any) {
    const { state } = useContext(DiagramContext);
    const { onMutate: dispatchMutations, trackAddStatement, stSymbolInfo, configOverlayFormStatus } = state;


    const { onCancel, onSave, wizardType, position } = props as AddEndFormProps;
    const { formArgs, formType } = configOverlayFormStatus;

    const endConfig: EndConfig = {
        type: formType,
        expression: '',
        scopeSymbols: [],
        model: formArgs?.model,
        wizardType
    };

    const onCancelClick = () => {
        onCancel();
    };

    const onSaveClick = () => {
        if (formArgs?.targetPosition) {
            const modifications: STModification[] = [];
            if (wizardType === WizardType.EXISTING) {
                switch (endConfig.type) {
                    case 'Return':
                        const updateReturnStmt: STModification = updateReturnStatement(
                            endConfig.expression as string, formArgs?.targetPosition);
                        modifications.push(updateReturnStmt);
                        break;
                    case 'Respond':
                        const respondConfig: RespondConfig = endConfig.expression as RespondConfig;
                        let respondExpression = "check $caller->respond($expression);";
                        respondExpression = respondExpression
                            .replace("$caller", respondConfig.caller)
                            .replace("$expression", respondConfig.respondExpression);
                        const updateRespond: STModification = updatePropertyStatement(
                            respondExpression, formArgs?.targetPosition
                        );
                        modifications.push(updateRespond);
                        break;
                }
                dispatchMutations(modifications);
            } else {
                if (endConfig.type === "Return") {
                    trackAddStatement(endConfig.type);
                    const addReturnStatement: STModification = createReturnStatement(
                        endConfig.expression as string, formArgs?.targetPosition);
                    modifications.push(addReturnStatement);
                } else if (endConfig.type === "Respond") {
                    const respondConfig: RespondConfig = endConfig.expression as RespondConfig;
                    const responseCodeConfig = (endConfig?.expression as RespondConfig)?.responseCode;
                    if (responseCodeConfig) {
                        const responseName = genVariableName("resp", getAllVariables(stSymbolInfo));
                        const responseDeclaration = "http:Response " + responseName + " = new;";
                        const responseDeclarationModification: STModification = createPropertyStatement(
                            responseDeclaration, formArgs?.targetPosition
                        );
                        modifications.push(responseDeclarationModification);

                        const responseGenStatement = responseName + ".statusCode = " + responseCodeConfig + ";";
                        const responseGenStatementModification: STModification = createPropertyStatement(
                            responseGenStatement, formArgs?.targetPosition
                        );
                        modifications.push(responseGenStatementModification);

                        if (respondConfig.respondExpression !== "") {
                            let responsePayoadStatement = responseName + ".setTextPayload($expression);";
                            responsePayoadStatement = responsePayoadStatement
                                .replace("$expression", respondConfig.respondExpression);
                            const responsePayoadStatementModification: STModification = createPropertyStatement(
                                responsePayoadStatement, formArgs?.targetPosition
                            );
                            modifications.push(responsePayoadStatementModification);
                        }

                        let respondStatusCodeExpression = "check $caller->respond($expression);";
                        respondStatusCodeExpression = respondStatusCodeExpression
                            .replace("$caller", respondConfig.caller)
                            .replace("$expression", responseName);
                        const addRespondWithCode: STModification = createPropertyStatement(
                            respondStatusCodeExpression, formArgs?.targetPosition
                        );
                        modifications.push(addRespondWithCode);

                    } else {
                        trackAddStatement(endConfig.type);
                        let respondExpression = "check $caller->respond($expression);";
                        respondExpression = respondExpression
                            .replace("$caller", respondConfig.caller)
                            .replace("$expression", respondConfig.respondExpression);
                        const addRespond: STModification = createPropertyStatement(
                            respondExpression, formArgs?.targetPosition
                        );
                        modifications.push(addRespond);
                    }
                }
            }
            dispatchMutations(modifications);
            onSave();
        }
    };

    return (
        <EndOverlayForm
            configOverlayFormStatus={configOverlayFormStatus}
            position={position}
            config={endConfig}
            onCancel={onCancelClick}
            onSave={onSaveClick}
        />
    );
}
