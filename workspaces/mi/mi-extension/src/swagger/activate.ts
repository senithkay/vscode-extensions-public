/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { SwaggerWebview } from './webview';
import { SwaggerData } from '@wso2-enterprise/mi-core';

export async function openSwaggerWebview(projectUri: string, swaggerData: SwaggerData) {
    if (!SwaggerWebview.webviews.has(projectUri)) {
        const webview = new SwaggerWebview(swaggerData, projectUri);
        SwaggerWebview.webviews.set(projectUri, webview);
    } else {
        const webview = SwaggerWebview.webviews.get(projectUri);
        if (webview) {
            webview.getWebview()?.reveal();
        }
    }
}
