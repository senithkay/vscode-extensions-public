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

import { VSCodeDropdown, VSCodeLink, VSCodeOption, VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { Trigger } from '@wso2-enterprise/ballerina-languageclient';
import { useEffect } from 'react';
import { ErrorBanner } from '../../Commons/ErrorBanner';
import { ChoreoWebViewAPI } from '../../utilities/WebViewRpc';

import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { ComponentWizardState } from "../types";
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";


const DEFAULT_ERROR_MSG = "Could not load the Webhook triggers.";
const GET_TRIGGERS_PATH = "https://api.central.ballerina.io/2.0/registry/triggers";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const TriggerSelectorContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`

export const WebhookTriggerSelector = (props: StepProps<Partial<ComponentWizardState>>) => {

    const { formData, onFormDataChange } = props;

    const { isLoading, error, data: triggers, refetch } = useQuery({
        queryKey: ['availableTriggers'],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTriggers().then(async (response) => {
                if (response && response.central?.length) {
                    return response.central;
                } else {
                    return fetch(GET_TRIGGERS_PATH, {
                        headers: {
                            'User-Agent': await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getBalVersion()
                        }
                    }).then((res) => res.json())
                        .then((data) => {
                            if (data && data.triggers?.length) {
                                return data.triggers;
                            } else {
                                throw new Error(DEFAULT_ERROR_MSG);
                            }
                        })
                }
            })
      })

    const setSelectedTrigger = (id: string | undefined) => {
        onFormDataChange((prevFormData) => {
            return {
                ...prevFormData,
                trigger: id
            };
        });
    };

    const setDefaultTrigger = () => {
        if (!formData?.trigger && triggers && triggers.length) {
            setSelectedTrigger(triggers[0].id);
        }
    };

    useEffect(() => {
        setDefaultTrigger();
    }, [triggers]);


    return (
        <StepContainer>
            <label htmlFor="trigger-dropdown">Select Trigger</label>
            {isLoading && <VSCodeProgressRing />}
            {triggers && triggers.length > 0 && (
                <TriggerSelectorContainer>
                    <VSCodeDropdown id="trigger-dropdown" value={formData?.trigger} onChange={(e: any) => { setSelectedTrigger(e.target.value) }}>
                        {triggers.map((trigger: Trigger) => (
                            <VSCodeOption id={trigger.id} value={trigger.id} key={trigger.id}>
                                {trigger.displayAnnotation?.label || trigger.moduleName}
                            </VSCodeOption>
                        ))}
                    </VSCodeDropdown>
                    <VSCodeLink onClick={() => refetch()}>Refresh</VSCodeLink>
                </TriggerSelectorContainer>
            )}
            {error && <ErrorBanner errorMsg={error as any} />}
        </StepContainer>
    );
}


export const TriggerConfigStep: Step<Partial<ComponentWizardState>> = {
    title: 'Configure Webhook Trigger',
    component: WebhookTriggerSelector,
    shouldSkip: (formData) => {
        return formData?.type !== ChoreoComponentType.Webhook;
    },
    validationRules: [
        {
            field: "trigger",
            message: 'Please select a trigger type',
            rule: async (value: any) => {
                return value !== undefined;
            }
        }
    ]
};
