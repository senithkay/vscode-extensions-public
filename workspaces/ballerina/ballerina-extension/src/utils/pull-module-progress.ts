/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */

import { extension } from "../BalExtensionContext";
import { StateMachine } from "../stateMachine";

export function handlePullModuleProgress() {
    // Handle pull module progress notifications
    const progressDisposable = StateMachine.langClient().onNotification('$/progress', (params: any) => {
        if (params.token && params.token.startsWith('pull-module')) {
            extension.hasPullModuleNotification = true;
            if (params.value.kind === 'report') {
                extension.hasPullModuleResolved = true;
            }
        }
    });

    // Set up a listener to check for initialPrompt becoming empty
    const checkInterval = setInterval(() => {
        if (extension.hasPullModuleResolved) {
            // Clean up the notification listener
            progressDisposable.dispose();
            clearInterval(checkInterval);
        }
    }, 5000); // Check every 5 seconds

    // Add both disposables to context for clean extension shutdown
    extension.context.subscriptions.push(progressDisposable);
    extension.context.subscriptions.push({ dispose: () => clearInterval(checkInterval) });
}
