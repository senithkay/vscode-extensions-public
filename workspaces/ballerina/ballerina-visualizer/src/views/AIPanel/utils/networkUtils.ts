/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { AIMachineEventType } from "@wso2-enterprise/ballerina-core";

interface FetchWithAuthParams {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    rpcClient: any;
}

// Global controller for aborting requests
let controller: AbortController | null = null;

export const fetchWithAuth = async ({
    url,
    method,
    body,
    rpcClient,
}: FetchWithAuthParams): Promise<Response> => {
    controller?.abort();

    controller = new AbortController();

    const makeRequest = async (authToken: string): Promise<Response> =>
        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller!.signal,
        });

    let finalToken;
    try {
        finalToken = await rpcClient.getAiPanelRpcClient().getAccessToken();
    } catch (error) {
        if (isErrorWithMessage(error) && error?.message === "TOKEN_EXPIRED") {
            rpcClient.sendAIStateEvent(AIMachineEventType.LOGOUT);
            return;
        }
        throw error;
    }

    let response = await makeRequest(finalToken);

    if (response.status === 401) {
        finalToken = await rpcClient.getAiPanelRpcClient().getRefreshedAccessToken();
        if (finalToken) {
            response = await makeRequest(finalToken);
        }
    }

    return response;
}

// Function to abort the fetch request
export function abortFetchWithAuth() {
    if (controller) {
        controller.abort();
        controller = null;
    }
}

function isErrorWithMessage(error: unknown): error is { message: string } {
    return typeof error === 'object' && error !== null && 'message' in error;
}
