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
import React, { useContext } from "react";

import { Context } from "../../../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus } from "../../../../../../Definitions";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { ConditionConfig } from "../../../Types";

import { AddForeachForm } from "./AddForeachForm";
import { AddIfForm } from "./AddIfForm/index";
import { AddWhileForm } from "./AddWhileForm";

interface ConditionsWizardProps {
    condition: ConditionConfig;
    onCancel: () => void;
    onSave: () => void;
    configOverlayFormStatus: ConfigOverlayFormStatus
}


export function ConditionsOverlayForm(props: ConditionsWizardProps) {
    const { condition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, error, formType, formArgs} = configOverlayFormStatus;
    const {
        api: {
            panNZoom: {
                pan,
                fitToScreen
            }
        }
    } = useContext(Context);

    if (formType === "if" || formType === "While") {
        if (!condition.conditionExpression) {
            condition.conditionExpression = "";
        }
    } else if (formType === "ForEach") {
        if (!condition.conditionExpression) {
            condition.conditionExpression = {
                variable: '', collection: '', type: ''
            };
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
                {formType === "If" && <AddIfForm condition={condition} formArgs={formArgs} onSave={onSave} onCancel={onCancel} />}
                {formType === "ForEach" && <AddForeachForm condition={condition} formArgs={formArgs} onSave={onSave} onCancel={onCancel} />}
                {formType === "While" && <AddWhileForm condition={condition} formArgs={formArgs} onSave={onSave} onCancel={onCancel} />}
            </div>
        );
    }
}

