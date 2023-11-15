/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { resolve } from 'dns';
import { window } from 'vscode';

export async function checkInternetConnection(): Promise<boolean> {
    return new Promise((resolveCallback) => {
        resolve('google.com', (error) => {
            if (error) {
                resolveCallback(false);
            } else {
                resolveCallback(true);
            }
        });
    });
}

export interface RetryOptions {
    retries?: number;
    delay?: number;
    fallback?: () => Promise<void>;
    onError?: (error: Error, retryCount: number) => void;
}

export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    const { retries = 0, delay = 1000, fallback, onError } = options;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (onError) {
                onError(error, i + 1);
            }

            if (i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else if (fallback) {
                await fallback();
            }
        }
    }

    throw new Error('Retry limit exceeded');
}

export async function executeWithTaskRetryPrompt<T>(task: () => Promise<T>): Promise<T> {
    return await task();
}
