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
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { Resource, ServiceDesignerView } from "@wso2-enterprise/service-designer-view";
import { EVENT_TYPE, STModification } from "@wso2-enterprise/ballerina-core";
import { ViewWrapper } from "../styles";

interface ServiceDesignerProps {
    model: ServiceDeclaration;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    isEggplant?: boolean;
    isEditingDisabled?: boolean;
}

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { model, applyModifications } = props;
    const { rpcClient } = useRpcContext();

    const handleOpenDiagram = (resource: Resource) => {
        rpcClient.getVisualizerLocation().then(res => {
            rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: resource.position, documentUri: res.documentUri } })
        })
    }

    return (
        <>
            <ServiceDesignerView
                model={model}
                rpcClients={{
                    serviceDesignerRpcClient: rpcClient.getServiceDesignerRpcClient(),
                    commonRpcClient: rpcClient.getCommonRpcClient(),
                }}
                applyModifications={applyModifications}
                goToSource={handleOpenDiagram}
                isEggplant={props.isEggplant}
                isEditingDisabled={props.isEditingDisabled}
            />
        </>
    );
}
