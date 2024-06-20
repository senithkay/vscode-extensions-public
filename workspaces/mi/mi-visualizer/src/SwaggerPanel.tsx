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
import { SwaggerData, vscode } from "@wso2-enterprise/mi-core";

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
    let response: Response;

    async function requestInterceptor(req: any) {
        const request: Request = {
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: req.body,
        }

        vscode.postMessage({
            command: 'swaggerRequest',
            req: request
        });

        const res = await new Promise(resolve => {
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'swaggerResponse':
                        if (!message.res) {
                            resolve(false);
                        }
                        response = message.res;
                        resolve(response);
                }
            })
        });
        if (res) {
            req.url = proxy;
        }
        return req;
    }

    function responseInterceptor(res: any) {
        res.ok = true;
        res.status = response.status;
        res.statusText = response.statusText;
        res.text = response.text;
        res.data = response.data;
        res.body = response.body;
        res.obj = response.obj;
        res.headers = response.headers;
        delete res.parseError

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
