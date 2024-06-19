/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import SwaggerUI from "swagger-ui-react";
import { parse } from "yaml";
import { View } from "./components/View";
import "swagger-ui-react/swagger-ui.css"
import { SwaggerData } from "@wso2-enterprise/mi-core";


declare const vscode: vscode;
interface vscode {
    postMessage(message: any): void;
}

interface Request {
    url: string,
    headers: string,
    method: string,
    body?: string,
}

interface Response {
    status: number,
    statusText: string,
    data?: string,
    text?: string,
    body?: string,
    obj?: string,
    headers?: Record<string, string>,
}

interface SwaggerPanelProps {
    swaggerData?: SwaggerData
}

export function SwaggerPanel(props: SwaggerPanelProps) {
    const { generatedSwagger, port } = props?.swaggerData;

    const proxy = `http://localhost:${port}/`;

    const openapiSpec = parse(generatedSwagger);

    const requestInterceptor = (request: any) => {
        request.url = `${proxy}${request.url}`;
        return request;
    };

    // TODO: Check on res.ok and res.parseError
    function responseInterceptor(res: any) {
        res.ok = true;
        delete res.parseError

        const unwantedHeaders = [
            'sec-ch-ua',
            'sec-ch-ua-mobile',
            'sec-ch-ua-platform',
            'sec-fetch-dest',
            'sec-fetch-mode',
            'sec-fetch-site',
            'x-forwarded-for',
            'x-forwarded-port',
            'x-forwarded-proto'
        ];

        unwantedHeaders.forEach(header => {
            if (res.headers[header]) {
                delete res.headers[header];
            }
        });

        return res;
    }

    // TODO: Support SwaggerUI for darkThemes
    return (
        <View>
            <div style={{ overflow: 'scroll', background: 'white', height: '100%' }}>
                <SwaggerUI requestInterceptor={requestInterceptor}
                    responseInterceptor={responseInterceptor} spec={openapiSpec} showMutatedRequest={false} />
            </div>
        </View>
    );
}
