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

import { ProcessConfig } from "../../../types";

import { AddLogForm } from "./AddLogForm";
import { AddVariableForm } from "./AddVariableForm";

interface WizardProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

export function Wizard(props: WizardProps) {
    const { config, onCancel, onSave } = props;
    const { type } = config;

    if (type === "Variable") {
        config.config = "";
    } else if (type === "Log") {
        config.config = {
            type: "",
            expression: ""
        };
    }

    return (
        <div>
            {type === "Variable" && <AddVariableForm config={config} onSave={onSave} onCancel={onCancel} />}
            {type === "Log" && <AddLogForm config={config} onSave={onSave} onCancel={onCancel} />}
        </div>
    );
}
