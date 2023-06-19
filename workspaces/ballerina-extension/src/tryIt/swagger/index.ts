/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CodeServerContext, ExtendedLangClient, OpenAPIConverterResponse, RUN_PROJECT_TO_TRYIT } from "../../core";
import { showSwaggerView } from "./swaggerViewPanel";
import { MESSAGE_TYPE, showMessage } from "../../utils/showMessage";
import { log } from "../../utils";
import path from "path";

export async function createSwaggerView(langClient: ExtendedLangClient, documentFilePath: string,
    serviceName: any, codeServerContext: CodeServerContext) {
    const file = path.basename(documentFilePath);
    const ERR = 'Unable to open the swagger view.';

    if (!langClient) {
        return;
    }
    await langClient.convertToOpenAPI({
        documentFilePath
    }).then(async (lSesponse) => {
        const response = lSesponse as OpenAPIConverterResponse;
        if (response.content === undefined || response.error) {
            showMessage(`${ERR} ${response.error}`,
                MESSAGE_TYPE.ERROR, false);
            return;
        }
        if (response.content.length == 0) {
            showMessage(`${ERR} OpenAPI specification not found.`,
                MESSAGE_TYPE.ERROR, false);
            return;
        }
        showMessage(RUN_PROJECT_TO_TRYIT, MESSAGE_TYPE.INFO, true);
        showSwaggerView(langClient, response.content, file, serviceName, codeServerContext);
    }).catch((err) => {
        log(err);
    });
}
