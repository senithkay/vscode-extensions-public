/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { Resource, ServiceDesignerView } from "@wso2-enterprise/service-designer-view";
import { STModification } from "@wso2-enterprise/eggplant-core";
import { URI } from 'vscode-uri';

export function ServiceDesigner() {
    const { rpcClient } = useVisualizerContext();
    const [st, setSt] = React.useState<ServiceDeclaration>();

    rpcClient.onFileContentUpdate(() => {
        fetchServiceSt();
    });

    useEffect(() => {
        fetchServiceSt();
    }, []);

    const fetchServiceSt = () => {
        rpcClient.getLangServerRpcClient().getSyntaxTree().then((value) => {
            const serviceSt = value.syntaxTree as ServiceDeclaration;
            setSt(serviceSt);
        });
    }

    const showDiagram = (resource: Resource) => {
        const context: any = {
            position: resource.position
        }
        rpcClient.getVisualizerRpcClient().openView(context);
    }

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = rpcClient.getLangServerRpcClient();
        const filePath = (await rpcClient.getVisualizerLocation()).documentUri;
        const { parseSuccess, source: newSource } = await langServerRPCClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            await langServerRPCClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });
        }
    };

    return (
        <>
            <ServiceDesignerView
                model={st}
                rpcClients={{ serviceDesignerRpcClient: rpcClient.getServiceDesignerRpcClient(), commonRpcClient: rpcClient.getCommonRpcClient() }}
                goToSource={showDiagram}
                applyModifications={applyModifications}
            />
        </>
    );
}
