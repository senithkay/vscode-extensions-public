/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { useEffect, useState } from "react";

import { Codicon, Button } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { VisualizerLocation } from "@wso2-enterprise/mi-core";
import path from "path";

interface NavButtonGroupProps {
    currentProjectPath?: string;
}

export function NavButtonGroup(props: NavButtonGroupProps) {

    const { rpcClient } = useVisualizerContext();

    const [machineView, setMachineView] = useState<VisualizerLocation>(null);

    useEffect(() => {
        try {
            rpcClient.getVisualizerState().then((mState) => {
                setMachineView(mState);
            });
        } catch (error) {

        }
    }, []);

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const handleHomeButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });
        rpcClient.getVisualizerState
    }

    const HierarchicalPath = () => {
        if (!machineView?.projectUri || !machineView?.documentUri) {
            return <></>
        }

        const filePath = path.relative(machineView.projectUri, machineView.documentUri).split(path.join("src", "main", "wso2mi", "artifacts"))[1];
        const segments = filePath.substring(1).split(path.sep);

        if (machineView.identifier) {
            segments.push(machineView.identifier);
        }

        return (
            <>
                <Codicon name="chevron-right" sx={{ paddingTop: "2px" }} />
                {segments.map((segment, index) => {
                    return <>
                        <Button appearance="icon" disabled={index === 0} onClick={() => {
                            if (segment.endsWith(".xml")) {
                                rpcClient.getMiVisualizerRpcClient().openView({ view: "ServiceDesigner", documentUri: machineView.documentUri });
                            }
                        }}>
                            {segment}
                        </Button>
                        {index < segments.length - 1 && <Codicon name="chevron-right" sx={{ paddingTop: "2px" }} />}
                    </>
                })}
            </>
        );
    }

    return (
        <>
            <>
                {machineView?.view !== "Overview" && (
                    <VSCodeButton appearance="icon" title="Go Back" onClick={handleBackButtonClick}>
                        <Codicon name="arrow-left" />
                    </VSCodeButton>
                )}
                <VSCodeButton appearance="icon" title="Home" onClick={handleHomeButtonClick}>
                    <Codicon name="home" />
                </VSCodeButton>
                <HierarchicalPath />
            </>

        </>
    );
}
