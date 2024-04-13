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
    MiDebuggerAPI,
    ValidateBreakpointsRequest,
    ValidateBreakpointsResponse
} from "@wso2-enterprise/mi-core";
import { StateMachine } from "../../stateMachine";

export class MiDebuggerRpcManager implements MiDebuggerAPI {
    async validateBreakpoints(params: ValidateBreakpointsRequest): Promise<ValidateBreakpointsResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const definition = await langClient.validateBreakpoints(params);

            resolve(definition);
        });
    }
}
