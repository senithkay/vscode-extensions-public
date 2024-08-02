/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { Diagnostic } from "vscode-languageserver-types";
import { Proxy } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Diagram } from "@wso2-enterprise/mi-diagram";
import { Switch } from "@wso2-enterprise/ui-toolkit";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { EditProxyForm, ProxyProps } from "../Forms/EditForms/EditProxyForm";
import { generateProxyData, onProxyEdit } from "../../utils/form";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import path from "path";

export interface ProxyViewProps {
    model: Proxy;
    documentUri: string;
    diagnostics: Diagnostic[];
}

export const ProxyView = ({ model: ProxyModel, documentUri, diagnostics }: ProxyViewProps) => {
    const model = ProxyModel as Proxy;
    const { rpcClient } = useVisualizerContext();
    const data = generateProxyData(model) as EditProxyForm;
    const [isFormOpen, setFormOpen] = React.useState(false);
    const [isFaultFlow, setFlow] = React.useState<boolean>(false);

    const toggleFlow = () => {
        setFlow(!isFaultFlow);
    };

    const handleEditProxy = () => {
        setFormOpen(true);
    }
    const onSave = (data: EditProxyForm) => {
        let artifactNameChanged = false;
        let documentPath = documentUri;
        if (path.basename(documentUri).split('.')[0] !== data.name) {
            rpcClient.getMiDiagramRpcClient().renameFile({existingPath: documentUri, newPath: path.join(path.dirname(documentUri), `${data.name}.xml`)});
            artifactNameChanged = true;
            documentPath = path.join(path.dirname(documentUri), `${data.name}.xml`);
        }
        onProxyEdit(data, model, documentPath, rpcClient);
        if (artifactNameChanged) {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        } else {
            setFormOpen(false);
        }
    }
    
    return (
        <View>
            {isFormOpen ?
                <EditProxyForm
                    proxyData={data}
                    documentUri={documentUri}
                    onCancel={() => setFormOpen(false)}
                    onSave={onSave}
                    isOpen={isFormOpen}
                /> : 
            <>
            <ViewHeader title={`Proxy: ${model.name}`} codicon="arrow-swap" onEdit={handleEditProxy}>
                <Switch
                    leftLabel="Flow"
                    rightLabel="Fault"
                    checked={isFaultFlow}
                    checkedColor="var(--vscode-button-background)"
                    enableTransition={true}
                    onChange={toggleFlow}
                    sx={{
                        "margin": "auto",
                        fontFamily: "var(--font-family)",
                        fontSize: "var(--type-ramp-base-font-size)",
                    }}
                    disabled={false}
                />
            </ViewHeader>
            <ViewContent>
                    <Diagram
                        model={model}
                        documentUri={documentUri}
                        diagnostics={diagnostics}
                        isFaultFlow={isFaultFlow}
                    />
            </ViewContent> 
        </>
        } 
        </View>
    )
}

