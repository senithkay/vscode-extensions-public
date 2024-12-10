/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { Resource, ServiceDesigner as BServiceDesigner } from "@wso2-enterprise/ballerina-service-designer";
import { EVENT_TYPE, LineRange, STModification, TriggerNode } from "@wso2-enterprise/ballerina-core";
import { BodyText, ViewWrapper } from "../styles";
import { Container, ProgressRing, Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import ServiceConfigView from "../BI/Trigger/ServiceConfigView";
import { BIHeader } from "../BI/BIHeader";
import styled from "@emotion/styled";


const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

interface ServiceDesignerProps {
    model: ServiceDeclaration;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    isBI?: boolean;
    filePath?: string;
    isEditingDisabled?: boolean;
}

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { model, applyModifications, filePath } = props;
    const { rpcClient } = useRpcContext();
    const [triggerNode, setTriggerNode] = useState<TriggerNode>(undefined);

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleOpenDiagram = (resource: Resource) => {
        rpcClient.getVisualizerLocation().then(res => {
            rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: resource.position, documentUri: res.documentUri } })
        })
    }
    const handleServiceConfig = (triggerNode: TriggerNode) => {
        setTriggerNode(triggerNode);
    }

    useEffect(() => {
        if (model) {
            setTriggerNode(undefined);
            setIsSaving(false);
        }
    }, [model]);

    const handleServiceFormSubmit = async (trigger: TriggerNode) => {
        setIsSaving(true);
        const position: NodePosition = model.position;
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        await rpcClient.getTriggerWizardRpcClient().updateTriggerSourceCode({ filePath: "", trigger, codedata: { lineRange } });
        setTriggerNode(undefined);
        setIsSaving(false);
    };

    const handleOnBack = () => {
        setTriggerNode(undefined);
    };

    return (
        <>
            {!triggerNode &&
                <BServiceDesigner
                    handleServiceConfig={handleServiceConfig}
                    model={model}
                    serviceFilePath={filePath}
                    rpcClients={{
                        serviceDesignerRpcClient: rpcClient.getServiceDesignerRpcClient(),
                        commonRpcClient: rpcClient.getCommonRpcClient(),
                        triggerWizardRpcClient: rpcClient.getTriggerWizardRpcClient()
                    }}
                    applyModifications={applyModifications}
                    goToSource={handleOpenDiagram}
                    isBI={props.isBI}
                    isEditingDisabled={props.isEditingDisabled}
                />
            }
            {triggerNode &&
                <View>
                    <ViewContent padding>
                        <Container>
                            <BIHeader />
                            <Typography variant="h2">{`Configure ${triggerNode?.displayName || ''} `}</Typography>
                            <BodyText>
                                Provide the necessary configuration details for the selected trigger to complete the setup.
                            </BodyText>
                            {!isSaving &&
                                <ServiceConfigView
                                    triggerNode={triggerNode}
                                    onSubmit={handleServiceFormSubmit}
                                    onBack={handleOnBack}
                                />
                            }
                            {isSaving &&
                                <LoadingContainer>
                                    <ProgressRing />
                                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Saving Configurations...</Typography>
                                </LoadingContainer>
                            }
                        </Container>
                    </ViewContent>
                </View>
            }
        </>
    );
}
