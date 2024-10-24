/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    Trigger,
    TriggerParams,
    TriggerWizardAPI,
    Triggers,
    TriggersParams
} from "@wso2-enterprise/ballerina-core";
import { StateMachine } from "../../stateMachine";

export class TriggerWizardRpcManager implements TriggerWizardAPI {
    async getTriggers(params: TriggersParams): Promise<Triggers> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: Triggers = await context.langClient.getTriggers(params) as Triggers;
            resolve(res);
        });
    }

    async getTrigger(params: TriggerParams): Promise<Trigger> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
