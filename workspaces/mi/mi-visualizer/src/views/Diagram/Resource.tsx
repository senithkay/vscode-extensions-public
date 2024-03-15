/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { Diagram } from "@wso2-enterprise/mi-diagram-2";
import { DiagramService } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Switch } from "@wso2-enterprise/ui-toolkit";
import { Diagnostic } from "vscode-languageserver-types";

export interface ResourceViewProps {
    model: DiagramService;
    documentUri: string;
    diagnostics: Diagnostic[];
}

export const ResourceView = ({ model, documentUri, diagnostics }: ResourceViewProps) => {
    const [isFaultFlow, setFlow] = React.useState<boolean>(false);
    const [isTabPaneVisible, setTabPaneVisible] = React.useState(true);

    const toggleFlow = () => {
        setFlow(!isFaultFlow);
    };
    
    return (
        <View>
            <ViewHeader title="MI Diagram" codicon="globe">
                {isTabPaneVisible && (
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
                )}
            </ViewHeader>
            <ViewContent>
                <Diagram
                    model={model}
                    documentUri={documentUri}
                    diagnostics={diagnostics}
                    isFaultFlow={isFaultFlow}
                    setTabPaneVisible={setTabPaneVisible}
                />
            </ViewContent>
        </View>
    )
}

