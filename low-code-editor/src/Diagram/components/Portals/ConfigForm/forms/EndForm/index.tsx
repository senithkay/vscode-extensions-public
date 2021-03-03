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
import React, { useContext } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram"
import { STModification } from "../../../../../../Definitions/lang-client-extended";
import { createCheckedRespond, createReturnStatement, updateCheckedRespond, updateReturnStatement } from "../../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../../view-state/draft";
import { EndConfig, RespondConfig } from "../../types";

import { Wizard } from "./Wizard";

export interface AddEndFormProps {
    type: string;
    targetPosition: DraftInsertPosition;
    scopeSymbols?: string[];
    onCancel: () => void;
    model?: STNode;
    wizardType?: WizardType;
}

export function EndConfigForm(props: any) {
    const { isReadOnly, onMutate: dispatchMutations } = useContext(DiagramContext).state;
    const { type, targetPosition, onCancel, scopeSymbols, model, wizardType } = props as AddEndFormProps;

    const endConfig: EndConfig = {
        type,
        expression: '',
        scopeSymbols,
        model,
        wizardType
    };

    const onCancelClick = () => {
        onCancel();
    };

    const onSaveClick = () => {
        if (targetPosition) {
            const modifications: STModification[] = [];
            if (wizardType === WizardType.EXISTING) {
                switch (endConfig.type) {
                    case 'Return':
                        const updateReturnStmt: STModification = updateReturnStatement(
                            endConfig.expression as string, model.position);
                        modifications.push(updateReturnStmt);
                        break;
                    case 'Respond':
                        const respondConfig: RespondConfig = endConfig.expression as RespondConfig;
                        const updateRespond: STModification = updateCheckedRespond(respondConfig.caller,
                            respondConfig.respondExpression, model.position);
                        modifications.push(updateRespond);
                        break;
                }
            } else {
                if (endConfig.type === "Return") {
                    const addReturnStatement: STModification = createReturnStatement(
                        endConfig.expression as string, targetPosition);
                    modifications.push(addReturnStatement);
                } else if (endConfig.type === "Respond") {
                    const respondConfig: RespondConfig = endConfig.expression as RespondConfig;
                    const addRespond: STModification = createCheckedRespond(respondConfig.caller,
                        respondConfig.respondExpression, targetPosition);
                    modifications.push(addRespond);
                }
            }
            dispatchMutations(modifications);
        }
    };

    return (
        <Wizard config={endConfig} onCancel={onCancelClick} onSave={onSaveClick} />
    );
}
