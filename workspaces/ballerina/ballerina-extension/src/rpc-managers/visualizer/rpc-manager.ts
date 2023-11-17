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
    VisualizerAPI,
    VisualizerContext,
} from "@wso2-enterprise/ballerina-core";
import { getService } from "../../visualizer/activator";

export class VisualizerRpcManager implements VisualizerAPI {
    async getVisualizerState(): Promise<VisualizerContext> {
        const snapshot = getService().getSnapshot();
        return new Promise((resolve) => {
            resolve(snapshot.context);
        });
    }
}
