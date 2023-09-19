var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { ErrorBanner } from '../../Commons/ErrorBanner';
import { ChoreoWebViewAPI } from '../../utilities/WebViewRpc';
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
const DEFAULT_ERROR_MSG = "Could not load the Webhook triggers.";
const GET_TRIGGERS_PATH = "https://api.central.ballerina.io/2.0/registry/triggers";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;
const DropDownContainer = styled.div `
    display: flex;
    flex-direction: column;
    gap : 4px;
`;
const TriggerSelectorContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
`;
const ServiceContainer = styled.div `
    display: flex;
    flex-direction: column;
    gap : 16px;
`;
const ServiceListContainer = styled.div `
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 60vh;
`;
export const WebhookTriggerSelector = (props) => {
    var _a, _b, _c;
    const { formData, stepValidationErrors, onFormDataChange } = props;
    const balVersion = useRef();
    const triggerId = (_a = formData === null || formData === void 0 ? void 0 : formData.trigger) === null || _a === void 0 ? void 0 : _a.id;
    const triggerServices = (_b = formData === null || formData === void 0 ? void 0 : formData.trigger) === null || _b === void 0 ? void 0 : _b.services;
    const getLocalBallerinaVersion = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!balVersion.current) {
            balVersion.current = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getBalVersion();
        }
        return balVersion.current;
    });
    const { isLoading: fetchingTriggers, error: triggersError, data: triggers, refetch: refetchTriggers } = useQuery({
        queryKey: ['availableTriggers'],
        queryFn: () => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e;
            const response = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTriggers();
            if (response && ((_d = response.central) === null || _d === void 0 ? void 0 : _d.length)) {
                return response.central;
            }
            else {
                const res = yield fetch(GET_TRIGGERS_PATH, { headers: { 'User-Agent': yield getLocalBallerinaVersion() } });
                const data = yield res.json();
                if (data && ((_e = data.triggers) === null || _e === void 0 ? void 0 : _e.length)) {
                    return data.triggers;
                }
                else {
                    throw new Error(DEFAULT_ERROR_MSG);
                }
            }
        }),
        onSuccess: data => {
            if (!triggerId && data && data.length) {
                handleTriggerChange(data[0].id);
            }
        }
    });
    const { isLoading: fetchingTrigger, error: triggerError, data: trigger, refetch: refetchTrigger } = useQuery({
        enabled: !!triggerId,
        queryKey: [`triggerData-${triggerId}`],
        queryFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const balTriggerData = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().fetchTrigger(triggerId);
            if (balTriggerData) {
                return balTriggerData;
            }
            const response = yield fetch(`${GET_TRIGGERS_PATH}/${triggerId}`, {
                headers: { 'User-Agent': yield getLocalBallerinaVersion() }
            });
            const triggerData = yield response.json();
            if (!triggerData) {
                throw new Error(DEFAULT_ERROR_MSG);
            }
            return triggerData;
        }),
        onSuccess: trigger => {
            var _a;
            if (!triggerServices && ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.serviceTypes) === null || _a === void 0 ? void 0 : _a.length)) {
                onFormDataChange((prevFormData) => {
                    return Object.assign(Object.assign({}, prevFormData), { trigger: Object.assign(Object.assign({}, prevFormData.trigger), { services: [trigger.serviceTypes[0].name] }) });
                });
            }
        }
    });
    const handleTriggerChange = (id) => {
        onFormDataChange((prevFormData) => {
            return Object.assign(Object.assign({}, prevFormData), { trigger: { id: id, services: undefined } });
        });
        refetchTrigger();
    };
    const handleServiceChange = (event) => {
        var _a;
        const { name, checked } = event.target;
        const selectedServices = ((_a = formData === null || formData === void 0 ? void 0 : formData.trigger) === null || _a === void 0 ? void 0 : _a.services) || [];
        let newServices = [];
        if (selectedServices.includes(name) && !checked) {
            newServices = selectedServices.filter((selectedValue) => selectedValue !== name);
        }
        else {
            newServices = [...selectedServices, name];
        }
        onFormDataChange((prevFormData) => {
            return Object.assign(Object.assign({}, prevFormData), { trigger: Object.assign(Object.assign({}, prevFormData.trigger), { services: newServices }) });
        });
    };
    return (React.createElement(StepContainer, null,
        React.createElement(DropDownContainer, null,
            React.createElement("label", { htmlFor: "trigger-dropdown" }, "Select Trigger"),
            fetchingTriggers && React.createElement(VSCodeProgressRing, null),
            triggers && triggers.length > 0 && (React.createElement(TriggerSelectorContainer, null,
                React.createElement(VSCodeDropdown, { id: "trigger-dropdown", onChange: (e) => {
                        handleTriggerChange(e.target.value);
                    }, style: { flex: 4, zIndex: 100 } }, triggers.map((trigger) => {
                    var _a;
                    return (React.createElement(VSCodeOption, { id: trigger.id, value: trigger.id, key: trigger.id, selected: +triggerId === +trigger.id }, ((_a = trigger.displayAnnotation) === null || _a === void 0 ? void 0 : _a.label) || trigger.moduleName));
                })),
                React.createElement(VSCodeLink, { onClick: () => refetchTriggers(), style: { flex: 1 } }, "Refresh"))),
            triggersError && React.createElement(ErrorBanner, { errorMsg: triggersError })),
        formData.mode === "fromScratch" && (React.createElement(ServiceContainer, null,
            React.createElement("div", null,
                React.createElement("label", { htmlFor: "service-dropdown" }, "Select one or more Trigger Services"),
                React.createElement(VSCodeLink, { onClick: () => refetchTrigger(), style: { marginLeft: 20 } }, "Refresh")),
            fetchingTrigger && React.createElement(VSCodeProgressRing, null),
            trigger && ((_c = trigger.serviceTypes) === null || _c === void 0 ? void 0 : _c.length) > 0 && (React.createElement(ServiceListContainer, null, trigger.serviceTypes.map((service) => {
                var _a;
                return (React.createElement(VSCodeCheckbox, { key: service.name, name: service.name, checked: triggerServices === null || triggerServices === void 0 ? void 0 : triggerServices.includes(service.name), onChange: handleServiceChange }, ((_a = service.displayAnnotation) === null || _a === void 0 ? void 0 : _a.label) || service.name));
            }))),
            triggerError && React.createElement(ErrorBanner, { errorMsg: triggerError }))),
        stepValidationErrors["trigger"] && React.createElement(ErrorBanner, { errorMsg: stepValidationErrors["trigger"] })));
};
export const TriggerConfigStep = {
    title: "Configure Webhook Trigger",
    component: WebhookTriggerSelector,
    shouldSkip: (formData) => {
        return (formData === null || formData === void 0 ? void 0 : formData.type) !== ChoreoComponentType.Webhook;
    },
    validationRules: [
        {
            field: "trigger",
            message: "Please select a trigger type and at least one service",
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                return formData.mode === "fromExisting" || ((value === null || value === void 0 ? void 0 : value.id) !== undefined && ((_a = value === null || value === void 0 ? void 0 : value.services) === null || _a === void 0 ? void 0 : _a.length) > 0);
            }),
        },
    ],
};
//# sourceMappingURL=WebhookTriggerSelector.js.map