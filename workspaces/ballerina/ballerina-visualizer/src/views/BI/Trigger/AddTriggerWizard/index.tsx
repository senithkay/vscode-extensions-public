/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { TriggerModel, FlowNode, LineRange, ComponentTriggerType, DIRECTORY_MAP, FunctionField } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import TriggerView from "../TriggerView";
import TriggerConfigView from "../TriggerConfigView";
import { convertTriggerFunctionsConfig, convertTriggerListenerConfig, convertTriggerServiceConfig, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import PullingModuleLoader from "../../../Connectors/PackageLoader/Loader";

const Container = styled.div`
    width: 100%;
    overflow: scroll;
    height: inherit;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

enum WizardStep {
    TRIGGER_LIST = "trigger-list",
    TRIGGER_CONFIG = "trigger-config",
}

interface AddTriggerWizardProps {
    onClose?: () => void;
}

export function AddTriggerWizard(props: AddTriggerWizardProps) {
    const { onClose } = props;
    const { rpcClient } = useRpcContext();

    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.TRIGGER_LIST);
    const [listenerFields, setListenerFields] = useState<FormField[]>([]);
    const [serviceFields, setServiceFields] = useState<FormField[]>([]);
    const [functionFields, setFunctionFields] = useState<Record<string, FunctionField>>({});
    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);
    const selectedConnectorRef = useRef<TriggerModel>();

    const handleOnSelect = async (trigger: TriggerModel) => {
        if (!trigger) {
            console.error(">>> Error selecting trigger. No codedata found");
            return;
        }
        selectedConnectorRef.current = trigger;
        setCurrentStep(WizardStep.TRIGGER_CONFIG);
        setListenerFields(convertTriggerListenerConfig(trigger));
        setServiceFields(convertTriggerServiceConfig(trigger));
        setFunctionFields(convertTriggerFunctionsConfig(trigger));
    };

    const handleOnFormSubmit = async (trigger: ComponentTriggerType) => {
        setIsPullingConnector(true);
        await rpcClient.getBIDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.TRIGGERS, triggerType: trigger });
        setIsPullingConnector(false);
    };

    const handleOnBack = () => {
        setCurrentStep(WizardStep.TRIGGER_LIST);
        setListenerFields([]);
        setServiceFields([]);
        setFunctionFields({});
    };

    return (
        <Container>
            {isPullingConnector && (
                <LoadingContainer>
                    <PullingModuleLoader />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Creating the trigger</Typography>
                    <Typography variant="h4" sx={{ marginTop: '8px' }}>This might take some time</Typography>
                </LoadingContainer>
            )}
            {!isPullingConnector && currentStep === WizardStep.TRIGGER_LIST && <TriggerView onTriggerSelect={handleOnSelect} />}
            {!isPullingConnector && currentStep === WizardStep.TRIGGER_CONFIG && (
                <TriggerConfigView
                    name={selectedConnectorRef.current?.name}
                    listenerFields={listenerFields}
                    serviceFields={serviceFields}
                    functionFields={functionFields}
                    onSubmit={handleOnFormSubmit}
                    onBack={handleOnBack}
                />
            )}
        </Container>
    );
}

export default AddTriggerWizard;
