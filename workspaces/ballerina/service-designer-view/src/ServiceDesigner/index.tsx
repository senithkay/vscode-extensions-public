/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { ResourceForm } from "./components/ResourceForm//ResourceForm";
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { STModification } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI } from "vscode-uri";
interface ServiceDesignerProps {
    st: ServiceDeclaration
}

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { st } = props;
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

    const handleOnClose = () => {
        setIsSidePanelOpen(false);
    };
    const handleOnClick = () => {
        setIsSidePanelOpen(true);
    };

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = ballerinaRpcClient.getLangServerRpcClient();
        const visualizerRPCClient = ballerinaRpcClient.getVisualizerRpcClient();
        const filePath = viewLocation.location.fileName;
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { parseSuccess, source } = await visualizerRPCClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            await langServerRPCClient.updateFileContent({
                content: source,
                fileUri: filePath
            });
        }
    };

    return (
        <div data-testid="service-design-view">
           <h2 onClick={handleOnClick}>Hello Service Designer - {st?.value}</h2>
           {isSidePanelOpen && <ResourceForm isOpen={isSidePanelOpen} applyModifications={applyModifications} onClose={handleOnClose} />}
        </div>
    )
}
