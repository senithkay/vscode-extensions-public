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

import { WizardType } from "../../../../ConfigurationSpec/types";
import { Context } from "../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus } from "../../../../Definitions";
import { STModification } from "../../../../Definitions/lang-client-extended";
import {
    createForeachStatement,
    createIfStatement, updateForEachCondition,
    updateIfStatementCondition
} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { ConditionConfig, ForeachConfig } from "../../Portals/ConfigForm/types";
import { DiagramOverlayPosition } from "../../Portals/Overlay";

import { ConditionsOverlayForm } from "./ConditionsOverlayForm";

export interface ConditionConfigFormProps {
    type: string;
    targetPosition?: DraftInsertPosition;
    wizardType: WizardType;
    config?: ConditionConfig;
    scopeSymbols?: string[];
    onCancel: () => void;
    onSave: () => void;
    position?: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ConditionConfigForm(props: ConditionConfigFormProps) {
    const { state } = useContext(Context);
    const {
        isReadOnly,
        configPanelStatus,
        syntaxTree,
        onMutate: dispatchMutations,
        trackAddStatement
    } = state;
    const { type, wizardType, onCancel, onSave, position, configOverlayFormStatus } = props;
    let conditionConfig: ConditionConfig;
    const { isLoading, isOpen, error, formArgs, formType } = configOverlayFormStatus;

    switch (formType) {
        case "If":
            conditionConfig = {
                type: formType,
                conditionExpression: formArgs?.config && formArgs?.config.conditionExpression ? formArgs?.config.conditionExpression : '',
                scopeSymbols: [],
            };
            break;
        case "ForEach":
            conditionConfig = {
                type: formType,
                conditionExpression:
                    wizardType === WizardType.NEW ?
                        { variable: '', collection: '' }
                        : formArgs?.config.conditionExpression,
                scopeSymbols: [],
            };
            break;
        default:
            conditionConfig = {
                type: formType,
                conditionExpression: "",
                scopeSymbols: [],
            };
            break;
    }

    const onSaveClick = () => {
        if (formArgs?.targetPosition) {
            const modifications: STModification[] = [];
            if (type === "If") {
                const ifConfig: ConditionConfig = conditionConfig as ConditionConfig;
                const conditionExpression: string = ifConfig.conditionExpression as string;
                if (wizardType === WizardType.NEW) {
                    trackAddStatement(type);
                    modifications.push(createIfStatement(conditionExpression, formArgs?.targetPosition));
                } else {
                    modifications.push(updateIfStatementCondition(conditionExpression, formArgs?.config.conditionPosition));
                }
            } else if (type === "ForEach") {
                const conditionExpression: ForeachConfig = conditionConfig.conditionExpression as
                    ForeachConfig;
                if (wizardType === WizardType.NEW) {
                    trackAddStatement(type);
                    modifications.push(createForeachStatement(conditionExpression.collection, conditionExpression.variable, formArgs?.targetPosition));
                } else {
                    modifications.push(updateForEachCondition(conditionExpression.collection, conditionExpression.variable, formArgs?.config.conditionPosition))
                }
                // modifications.push();
            }
            dispatchMutations(modifications);
            onSave();
        }
    };

    return (
        <ConditionsOverlayForm
            condition={conditionConfig}
            onCancel={onCancel}
            onSave={onSaveClick}
            isNewConditionForm={wizardType === WizardType.NEW}
            position={position}
            configOverlayFormStatus={configOverlayFormStatus}
        />
    )
}

