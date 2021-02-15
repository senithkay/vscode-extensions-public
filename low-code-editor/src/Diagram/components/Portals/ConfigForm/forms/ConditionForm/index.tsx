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

import { WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../Definitions/lang-client-extended";
import {
    createForeachStatement,
    createIfStatement, updateForEachCondition,
    updateIfStatementCondition
} from "../../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../../view-state/draft";
import { ConditionConfig, ForeachConfig } from "../../types";

import { Wizard } from "./Wizard";

export interface ConditionFormProps {
    type: string;
    targetPosition: DraftInsertPosition;
    wizardType: WizardType;
    config?: ConditionConfig;
    scopeSymbols?: string[];
    onCancel: () => void;
}

export function ConditionFormC(props: ConditionFormProps) {
    const { isReadOnly, onMutate: dispatchMutations } = useContext(DiagramContext).state;
    const { type, targetPosition, wizardType, config, onCancel, scopeSymbols } = props;
    let conditionConfig: ConditionConfig;

    switch (type) {
        case "If":
            conditionConfig = {
                type,
                conditionExpression: config && config.conditionExpression ? config.conditionExpression : '',
                scopeSymbols,
            };
            break;
        case "ForEach":
            conditionConfig = {
                type,
                conditionExpression:
                    wizardType === WizardType.NEW ?
                        { variable: '', collection: '' }
                        : config.conditionExpression,
                scopeSymbols,
            };
            break;
        default:
            conditionConfig = {
                type,
                conditionExpression: "",
                scopeSymbols,
            };
            break;
    }


    const onCancelClick = () => {
        onCancel();
    };

    const onSaveClick = () => {
        if (targetPosition) {
            const modifications: STModification[] = [];
            if (type === "If") {
                const ifConfig: ConditionConfig = conditionConfig as ConditionConfig;
                const conditionExpression: string = ifConfig.conditionExpression as string;
                if (wizardType === WizardType.NEW) {
                    modifications.push(createIfStatement(conditionExpression, targetPosition));
                } else {
                    modifications.push(updateIfStatementCondition(conditionExpression, config.conditionPosition));
                }
            } else if (type === "ForEach") {
                const conditionExpression: ForeachConfig = conditionConfig.conditionExpression as
                    ForeachConfig;
                if (wizardType === WizardType.NEW) {
                    modifications.push(createForeachStatement(conditionExpression.collection, conditionExpression.variable, targetPosition));
                } else {
                    modifications.push(updateForEachCondition(conditionExpression.collection, conditionExpression.variable, config.conditionPosition))
                }
                // modifications.push();
            }
            dispatchMutations(modifications);
        }
    };

    return (
        <Wizard
            condition={conditionConfig}
            onCancel={onCancelClick}
            onSave={onSaveClick}
            isNewConditionForm={wizardType === WizardType.NEW}
        />
    );
}
