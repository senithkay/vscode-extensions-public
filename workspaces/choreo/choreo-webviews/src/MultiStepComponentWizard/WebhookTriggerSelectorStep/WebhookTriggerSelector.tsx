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
import React, { useRef } from "react";

import { VSCodeCheckbox, VSCodeDropdown, VSCodeLink, VSCodeOption, VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { BallerinaTriggerInfo, DisplayAnnotation, ServiceType, Trigger } from '@wso2-enterprise/ballerina-languageclient';
import { ErrorBanner, Typography } from "@wso2-enterprise/ui-toolkit";
import { ChoreoWebViewAPI } from '../../utilities/WebViewRpc';

import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { ComponentWizardState } from "../types";
import { ChoreoComponentType, TriggerDetails } from "@wso2-enterprise/choreo-core";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { SectionWrapper } from "../../ProjectWizard/ProjectWizard";

const DEFAULT_ERROR_MSG = "Could not load the Webhook triggers.";
const GET_TRIGGERS_PATH = "https://api.central.ballerina.io/2.0/registry/triggers";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap : 4px;
`;

const TriggerSelectorContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
`;

const ServiceContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap : 16px;
`;

const ServiceListContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 60vh;
`;

interface TriggerServiceType extends ServiceType {
    displayAnnotation?: DisplayAnnotation;
}

export const WebhookTriggerSelector = (props: StepProps<Partial<ComponentWizardState>>) => {

    const { formData, stepValidationErrors, onFormDataChange } = props;

    const balVersion = useRef<string>();

    const triggerId = formData?.trigger?.id;
    const triggerServices = formData?.trigger?.services;

    const getLocalBallerinaVersion = async () => { 
        if(!balVersion.current) {
            balVersion.current = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getBalVersion();
        }
        return balVersion.current;
    }

    const { isLoading: fetchingTriggers, error: triggersError, data: triggers, refetch: refetchTriggers } = useQuery({
        queryKey: ['availableTriggers'],
        queryFn: async () => {
            const response = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTriggers();
            if (response && response.central?.length) {
                return response.central;
            } else {
                const res = await fetch(GET_TRIGGERS_PATH, { headers: { 'User-Agent': await getLocalBallerinaVersion()} });
                const data = await res.json();
                if (data && data.triggers?.length) {
                    return data.triggers;
                } else {
                    throw new Error(DEFAULT_ERROR_MSG);
                }
            }
        },
        onSuccess: data => {
            if (!triggerId && data && data.length) {
                handleTriggerChange(data[0].id);
            }
        }
    })

    const { isLoading: fetchingTrigger, error: triggerError, data: trigger, refetch: refetchTrigger } = useQuery({
        enabled: !!triggerId,
        queryKey: [`triggerData-${triggerId}`],
        queryFn: async () =>{
            const balTriggerData = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTrigger(triggerId);
            if (balTriggerData) { 
                return balTriggerData;
            }
            const response = await fetch(`${GET_TRIGGERS_PATH}/${triggerId}`, {
                headers: { 'User-Agent': await getLocalBallerinaVersion() }
            });
            const triggerData = await response.json();
            if (!triggerData) {
                throw new Error(DEFAULT_ERROR_MSG);
            }
            return triggerData;
        },
        onSuccess: trigger =>{
            if (!triggerServices && trigger?.serviceTypes?.length) {
                onFormDataChange((prevFormData) => {
                    return {
                        ...prevFormData,
                        trigger: {
                            ...prevFormData.trigger,
                            services: [trigger.serviceTypes[0].name]
                        }
                    };
                });
            }
        }
    })

    const handleTriggerChange = (id: string | undefined) => {
        onFormDataChange((prevFormData) => {
            return {
                ...prevFormData,
                trigger: {id: id, services: undefined}
            };
        });
        refetchTrigger();
    };  
    
    const handleServiceChange = (event: any) => {
        const { name, checked } = event.target;
        const selectedServices: string[] = formData?.trigger?.services || [];
        let newServices: string[] = [];
        if (selectedServices.includes(name) && !checked) {
            newServices = selectedServices.filter((selectedValue) => selectedValue !== name);
        } else {
            newServices = [...selectedServices, name];
        }
        onFormDataChange((prevFormData) => {
            return {
                ...prevFormData,
                trigger: {
                    ...prevFormData.trigger,
                    services: newServices,
                },
            };
        });
    };


    return (
        <StepContainer>
            <SectionWrapper>
                <Typography variant="h3">Configure Webhook Trigger</Typography>
                <DropDownContainer>
                    <label htmlFor="trigger-dropdown">Select Trigger</label>
                    {fetchingTriggers && <VSCodeProgressRing />}
                    {triggers && triggers.length > 0 && (
                        <TriggerSelectorContainer>
                            <VSCodeDropdown
                                id="trigger-dropdown"
                                onChange={(e: any) => {
                                    handleTriggerChange(e.target.value);
                                }}
                                style={{ flex: 4, zIndex: 100 }}
                            >
                                {triggers.map((trigger: Trigger) => (
                                    <VSCodeOption id={trigger.id} value={trigger.id} key={trigger.id} selected={+triggerId === +trigger.id}>
                                        {trigger.displayAnnotation?.label || trigger.moduleName}
                                    </VSCodeOption>
                                ))}
                            </VSCodeDropdown>
                            <VSCodeLink onClick={() => refetchTriggers()} style={{ flex: 1 }}>
                                Refresh
                            </VSCodeLink>
                        </TriggerSelectorContainer>
                    )}
                    {triggersError && <ErrorBanner errorMsg={triggersError as any} />}
                </DropDownContainer>
                <ServiceContainer>
                    <div>
                        <label htmlFor="service-dropdown">Select one or more Trigger Services</label>
                        <VSCodeLink onClick={() => refetchTrigger()} style={{ marginLeft: 20 }}>
                            Refresh
                        </VSCodeLink>
                    </div>
                    {fetchingTrigger && <VSCodeProgressRing />}
                    {trigger && (trigger as BallerinaTriggerInfo).serviceTypes?.length > 0 && (
                        <ServiceListContainer>
                            {trigger.serviceTypes.map((service: TriggerServiceType) => (
                                <VSCodeCheckbox
                                    key={service.name}
                                    name={service.name}
                                    checked={triggerServices?.includes(service.name)}
                                    onChange={handleServiceChange}
                                >
                                    {service.displayAnnotation?.label || service.name}
                                </VSCodeCheckbox>
                            ))}
                        </ServiceListContainer>
                    )}
                    {triggerError && <ErrorBanner errorMsg={triggerError as any} />}
                </ServiceContainer>
                {stepValidationErrors["trigger"] && <ErrorBanner errorMsg={stepValidationErrors["trigger"]} />}
            </SectionWrapper>
        </StepContainer>
    );
}

export const TriggerConfigStep: Step<Partial<ComponentWizardState>> = {
    title: "Configure Webhook Trigger",
    component: WebhookTriggerSelector,
    shouldSkip: (formData) => {
        return formData?.type !== ChoreoComponentType.Webhook;
    },
    validationRules: [
        {
            field: "trigger",
            message: "Please select a trigger type and at least one service",
            rule: async (value: TriggerDetails | undefined, _formData: Partial<ComponentWizardState>) => {
                return (value?.id !== undefined && value?.services?.length > 0);
            },
        },
    ],
};
