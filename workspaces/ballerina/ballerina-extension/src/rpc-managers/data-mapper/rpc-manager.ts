/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    DataMapperAPI
} from "@wso2-enterprise/ballerina-core";
import { getLangClient } from "../../visualizer/activator";


export class DataMapperRpcManager implements DataMapperAPI {
    async getLangClient() {
        return new Promise((resolve) => {
            resolve(getLangClient());
        });
    }
}
