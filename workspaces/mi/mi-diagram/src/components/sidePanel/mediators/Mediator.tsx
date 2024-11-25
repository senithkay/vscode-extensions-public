/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { VSCodePanels, VSCodePanelTab } from "@vscode/webview-ui-toolkit/react";
import { PanelContent } from "@wso2-enterprise/ui-toolkit";
import { MediatorForm } from "./Form";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import TryOutView from "./Tryout";

interface MediatorPageProps {
    mediatorData: any;
    mediatorType: string;
    nodeRange: Range;
    documentUri: string;
    isUpdate: boolean;
}
export function MediatorPage(props: MediatorPageProps) {
    const { mediatorData, mediatorType, documentUri, nodeRange, isUpdate } = props;
    const [activeTab, setActiveTab] = React.useState("form");

    const onChangeTab = (tabId: string) => {
        if (activeTab === tabId) {
            return;
        }
        setActiveTab(tabId);
    }
    return (
        <div>
            <VSCodePanels activeId={activeTab}>
                <VSCodePanelTab id="form" onClick={() => onChangeTab("form")}>Edit</VSCodePanelTab>
                <VSCodePanelTab id="tryout" onClick={() => onChangeTab("tryout")}>Tryout</VSCodePanelTab>

                <PanelContent id={"form"} >
                    <MediatorForm
                        mediatorData={mediatorData}
                        mediatorType={mediatorType}
                        isUpdate={isUpdate}
                        documentUri={documentUri}
                        range={nodeRange} />
                </PanelContent>
                <PanelContent id={"tryout"}>
                    <TryOutView
                        documentUri={documentUri}
                        nodeRange={nodeRange}
                    />
                </PanelContent>
            </VSCodePanels>
        </div>
    );
}
