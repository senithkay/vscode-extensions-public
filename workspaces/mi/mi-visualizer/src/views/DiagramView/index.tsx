/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { MachineStateValue, VisualizerLocation } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Diagram } from "@wso2-enterprise/mi-diagram-2";

export function DiagramView() {
    const { rpcClient } = useVisualizerContext();
    const [model, setModel] = React.useState<any>(null);
    const [view, setView] = React.useState<VisualizerLocation>(null);

    useEffect(() => {
        rpcClient.getVisualizerState().then((machineView) => {
            rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: machineView.documentUri }).then((st) => {
                const identifier = machineView.identifier || machineView.identifier === undefined;
                if (identifier && st?.syntaxTree?.api?.resource) {
                    const resourceNode = st?.syntaxTree?.api.resource.find((resource: any) => (resource.uriTemplate === machineView.identifier) || resource.uriTemplate === undefined);
                    setModel(resourceNode);
                    setView(machineView);
                }
            });
            rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: machineView.documentUri });
        });
    }, []);


    rpcClient?.onStateChanged((mainState: MachineStateValue) => {
        if (typeof mainState === 'object' && 'ready' in mainState && mainState.ready === 'viewEditing') {
            rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: view.documentUri }).then((st) => {
                const identifier = view.identifier || view.identifier === undefined;
                if (identifier && st?.syntaxTree?.api?.resource) {
                    const resourceNode = st?.syntaxTree?.api.resource.find((resource: any) => (resource.uriTemplate === view.identifier) || resource.uriTemplate === undefined);
                    setModel(resourceNode);
                    rpcClient.getMiVisualizerRpcClient().openView({ type: "EDIT_DONE", location: null });
                }
            });
            rpcClient.getMiDiagramRpcClient().initUndoRedoManager({ path: view.documentUri });
        }
    });

    return (
        <>
            {model && <Diagram model={model} documentUri={view.documentUri} />}
        </>
    );
}
