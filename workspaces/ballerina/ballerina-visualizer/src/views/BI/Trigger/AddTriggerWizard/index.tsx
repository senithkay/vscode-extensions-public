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
import { FlowNode, LineRange, ComponentTriggerType, DIRECTORY_MAP, FunctionField, BallerinaTrigger, SubPanelView, Trigger } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import TriggerView from "../TriggerView";
import TriggerConfigView from "../TriggerConfigView";
import { convertTriggerFunctionsConfig, convertTriggerListenerConfig, convertTriggerServiceConfig, convertTriggerServiceTypes, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import PullingModuleLoader from "../../../Connectors/PackageLoader/Loader";
import { BodyText } from "../../../styles";

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
    const [serviceTypes, setServiceTypes] = useState<Record<string, FunctionField>>({});
    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);
    const selectedTriggerRef = useRef<BallerinaTrigger>();

    const handleOnSelect = async (trigger: BallerinaTrigger) => {
        selectedTriggerRef.current = null;
        if (!trigger) {
            console.error(">>> Error selecting trigger. No codedata found");
            return;
        }

        setCurrentStep(WizardStep.TRIGGER_CONFIG);
        const response = await rpcClient.getTriggerWizardRpcClient().getTrigger({ id: trigger.id });
        console.log(">>>Trigger by id", response);
        selectedTriggerRef.current = response;
        setListenerFields(convertTriggerListenerConfig(response));
        setServiceTypes(convertTriggerServiceTypes(response));
        if (response.serviceTypes.length === 1) {
            setFunctionFields(convertTriggerFunctionsConfig(response));
        }
    };

    const handleOnFormSubmit = async (trigger: ComponentTriggerType) => {
        setIsPullingConnector(true);
        trigger.trigger = selectedTriggerRef.current as Trigger;
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
            {!isPullingConnector && <TriggerView onTriggerSelect={handleOnSelect} />}
            {!isPullingConnector && currentStep === WizardStep.TRIGGER_CONFIG && (

                <PanelContainer
                    show={true}
                    title={`Configure ${selectedTriggerRef.current?.displayName || ''} `}
                    onClose={onClose ? onClose : handleOnBack}
                    width={400}
                    onBack={handleOnBack}
                >
                    <>
                        <BodyText style={{ padding: '20px 20px 0 20px' }}>
                            Provide the necessary configuration details for the selected trigger to complete the setup.
                        </BodyText>
                        <TriggerConfigView
                            name={selectedTriggerRef.current?.name}
                            listenerFields={listenerFields}
                            serviceTypes={serviceTypes}
                            serviceFields={serviceFields}
                            functionFields={functionFields}
                            onSubmit={handleOnFormSubmit}
                            onBack={handleOnBack}
                        />
                    </>
                </PanelContainer>
            )}
        </Container>
    );
}

export default AddTriggerWizard;
