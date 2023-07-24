/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { extensions } from "vscode";
import { Project } from "@wso2-enterprise/choreo-core";
import { ComponentModel } from "@wso2-enterprise/ballerina-languageclient";
import { AxiosResponse } from "axios";

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    getChoreoProject(): Promise<Project|undefined>;
    isChoreoProject(): Promise<boolean>;
    getPerformanceForecastData(data: string): Promise<AxiosResponse<any>>;
    getSwaggerExamples(spec: any): Promise<AxiosResponse<any>>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
    deleteComponent(projectId: string, path: string): Promise<void>;
}

export async function getChoreoExtAPI(): Promise<IChoreoExtensionAPI | undefined> {
    const choreoExt = extensions.getExtension("wso2.choreo");
    if (choreoExt) {
        if (!choreoExt.isActive) {
            return choreoExt.activate();
        } else {
            return choreoExt.exports;
        }
    }
}
