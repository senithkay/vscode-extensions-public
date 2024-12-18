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
import { FlowNode, LineRange, ComponentTriggerType, DIRECTORY_MAP, FunctionField, TriggerNode, SubPanelView, Trigger, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import TriggerView from "../TriggerView";
import TriggerConfigView from "../TriggerConfigView";
import ListenerConfigView from "../ListenerConfigView";
import ServiceConfigView from "../ServiceConfigView";
import { convertTriggerFunctionsConfig, convertTriggerListenerConfig, convertTriggerServiceConfig, convertTriggerServiceTypes, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { Typography, View, ViewContent, Stepper } from "@wso2-enterprise/ui-toolkit";
import PullingModuleLoader from "../../../Connectors/PackageLoader/Loader";
import { BodyText } from "../../../styles";
import { BIHeader } from "../../BIHeader";

const Container = styled.div`
    width: 100%;
    height: inherit;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

enum TriggerWizardPage {
    TRIGGER_LIST = "trigger-list",
    TRIGGER_CONFIG = "trigger-config",
}

interface TriggerWizardProps {
    onClose?: () => void;
}

export function TriggerWizard(props: TriggerWizardProps) {
    const { onClose } = props;
    const { rpcClient } = useRpcContext();

    const [currentView, setCurrentView] = useState<TriggerWizardPage>(TriggerWizardPage.TRIGGER_LIST);


    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);

    const [trigger, setTrigger] = useState<TriggerNode>(undefined);

    const handleOnSelect = async (trigger: TriggerNode) => {
        // if (!trigger) {
        //     console.error(">>> Error selecting trigger. No codedata found");
        //     return;
        // }
        // setCurrentView(TriggerWizardPage.TRIGGER_CONFIG);
        // const response = await rpcClient.getTriggerWizardRpcClient().getTriggerModel({ id: trigger.id.toString() });
        // console.log(">>>Trigger by id", response);
        // setTrigger(response.trigger);
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIServiceWizard,
                serviceType: trigger.moduleName
            },
        });
    };

    const handleServiceFormSubmit = async (trigger: TriggerNode) => {
        setIsPullingConnector(true);
        await rpcClient.getTriggerWizardRpcClient().getTriggerSourceCode({ filePath: "", trigger });
        setIsPullingConnector(false);
    };

    const handleOnClose = () => {
        setCurrentView(TriggerWizardPage.TRIGGER_LIST);
    };

    return (
        <View>
            <ViewContent padding>
                <Container>
                    <BIHeader />
                    {isPullingConnector && (
                        <LoadingContainer>
                            <PullingModuleLoader />
                            <Typography variant="h3" sx={{ marginTop: '16px' }}>Creating the trigger service</Typography>
                            <Typography variant="h4" sx={{ marginTop: '8px' }}>This might take some time</Typography>
                        </LoadingContainer>
                    )}
                    {!isPullingConnector && currentView === TriggerWizardPage.TRIGGER_LIST &&
                        <>
                            <TriggerView onTriggerSelect={handleOnSelect} />
                        </>
                    }
                    {!isPullingConnector && currentView === TriggerWizardPage.TRIGGER_CONFIG && (
                        <>
                            <Typography variant="h2">{`Configure ${trigger?.displayName || ''} `}</Typography>
                            <BodyText>
                                Provide the necessary configuration details for the selected trigger to complete the setup.
                            </BodyText>
                            <ServiceConfigView
                                triggerNode={trigger}
                                onSubmit={handleServiceFormSubmit}
                                onBack={handleOnClose}
                            />
                        </>
                    )}
                </Container>
            </ViewContent>
        </View>
    );
}

export default TriggerWizard;
