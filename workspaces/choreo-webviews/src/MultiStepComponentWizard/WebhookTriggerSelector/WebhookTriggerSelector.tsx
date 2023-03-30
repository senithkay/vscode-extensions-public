/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";

import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { Trigger } from '@wso2-enterprise/ballerina-languageclient';
import { useEffect, useState } from 'react';
import { ErrorBanner } from '../../Commons/ErrorBanner';
import { ChoreoWebViewAPI } from '../../utilities/WebViewRpc';

interface WebhookTriggerProps {
    selectedTrigger: string | undefined;
    setSelectedTrigger: (id: string | undefined) => void;
}

const DEFAULT_ERROR_MSG = "Could not load the Webhook triggers.";
const GET_TRIGGERS_PATH = "https://api.central.ballerina.io/2.0/registry/triggers";

export function WebhookTriggerSelector(props: WebhookTriggerProps) {
    const { selectedTrigger, setSelectedTrigger } = props;
    const [triggers, setTriggers] = useState<Trigger[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Attempts to fetch triggers via the Ballerina Extension Instance's language client
        // If the attempt fails, retrieves the triggers via the public API.
        ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTriggers().then(async (response) => {
            if (response && response.central?.length) {
                setTriggers(response.central);
                setSelectedTrigger(response.central[0].id);
            } else {
                fetch(GET_TRIGGERS_PATH, {
                    headers: {
                        'User-Agent': await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getBalVersion()
                    }
                }).then((res) => res.json())
                    .then((data) => {
                        if (data && data.triggers?.length) {
                            setTriggers(data.triggers);
                            setSelectedTrigger(data.triggers[0].id);
                        } else {
                            setError(DEFAULT_ERROR_MSG);
                        }
                    })
                    .catch((err) => {
                        setError(err.message);
                    });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <label htmlFor="trigger-dropdown">Select Trigger</label>
            {!triggers && !error && <VSCodeProgressRing />}
            {triggers && triggers.length > 0 && (
                <VSCodeDropdown id="trigger-dropdown" onChange={(e: any) => { setSelectedTrigger(e.target.value) }}>
                    {triggers.map((trigger: Trigger) => (
                        <VSCodeOption id={trigger.id} value={trigger.id} selected={trigger.id === selectedTrigger}>
                            {trigger.displayAnnotation?.label || trigger.moduleName}
                        </VSCodeOption>
                    ))}
                </VSCodeDropdown>
            )}
            {error && <ErrorBanner errorMsg={error} />}
        </>
    );
}
