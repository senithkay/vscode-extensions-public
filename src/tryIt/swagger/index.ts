/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { CodeServerContext, ExtendedLangClient, OpenAPIConverterResponse, RUN_PROJECT_TO_TRYIT } from "../../core";
import { showSwaggerView } from "./swaggerViewPanel";
import { MESSAGE_TYPE, showMessage } from "../../utils/showMessage";
import { log } from "../../utils";
import path from "path";

export async function createSwaggerView(langClient: ExtendedLangClient, documentFilePath: string,
    serviceName: any, codeServerContext: CodeServerContext) {
    const file = path.basename(documentFilePath);

    if (!langClient) {
        return;
    }
    await langClient.convertToOpenAPI({
        documentFilePath
    }).then(async (lSesponse) => {
        const response = lSesponse as OpenAPIConverterResponse;
        if (response.content === undefined || response.error) {
            showMessage(`Unable to open the swagger view. ${response.error}`,
                MESSAGE_TYPE.ERROR, false);
            return;
        }
        showMessage(RUN_PROJECT_TO_TRYIT, MESSAGE_TYPE.INFO, true);
        showSwaggerView(langClient, response.content, file, serviceName, codeServerContext);
    }).catch((err) => {
        log(err);
    });
}
