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
    JsonToRecord,
    JsonToRecordParams,
    NOT_SUPPORTED_TYPE,
    RecordCreatorAPI,
    XMLToRecord,
    XMLToRecordParams,
} from "@wso2-enterprise/ballerina-core";
import { StateMachine } from "../../stateMachine";

export class RecordCreatorRpcManager implements RecordCreatorAPI {
    async convertJsonToRecord(params: JsonToRecordParams): Promise<JsonToRecord> {
        return new Promise(async (resolve) => {
            const response = await StateMachine.langClient().convertJsonToRecord(params) as JsonToRecord;
            resolve(response);
        });
    }

    async convertXMLToRecord(params: XMLToRecordParams): Promise<XMLToRecord> {
        return new Promise(async (resolve) => {
            const response = await StateMachine.langClient().convertXMLToRecord(params) as XMLToRecord;
            resolve(response);
        });
    }
}
