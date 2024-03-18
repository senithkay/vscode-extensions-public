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
import { APIResource, Range, DiagramService } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Diagram } from "@wso2-enterprise/mi-diagram-2";
import { Switch } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { getColorByMethod } from "@wso2-enterprise/service-designer";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { generateResourceData, getResourceDeleteRanges, onResourceEdit } from "../../utils/form";
import { EditAPIForm, EditResourceForm } from "../Forms/EditForms/EditResourceForm";
import styled from "@emotion/styled";

interface ColoredTagProps {
    color: string;
};

const ColoredTag = styled(VSCodeTag)<ColoredTagProps>`
    ::part(control) {
        color: var(--button-primary-foreground);
        background-color: ${({ color }: ColoredTagProps) => color};
    }
`;

export interface ResourceViewProps {
    model: DiagramService;
    documentUri: string;
    diagnostics: Diagnostic[];
}

export const ResourceView = ({ model: resourceModel, documentUri, diagnostics }: ResourceViewProps) => {
    const { rpcClient } = useVisualizerContext();
    const model = resourceModel as APIResource;
    const data = generateResourceData(model) as EditAPIForm
    const [isFaultFlow, setFlow] = React.useState<boolean>(false);
    const [isFormOpen, setFormOpen] = React.useState(false);

    const toggleFlow = () => {
        setFlow(!isFaultFlow);
    };

    const handleEditResource = () => {
        console.log(model);
        setFormOpen(true);
    }

    const onSave = (data: EditAPIForm) => {
        const ranges: Range[] = getResourceDeleteRanges(model, data);
        onResourceEdit(data, model.range.startTagRange, ranges, documentUri, rpcClient);
    }

    const ResourceTitle = (
        <React.Fragment>
            <h3>Resource:</h3>
            {model.methods.map((method, index) => <ColoredTag key={index} color={getColorByMethod(method)}>{method}</ColoredTag>)}
            <span>{model.uriTemplate || model.urlMapping}</span>
        </React.Fragment>
    )

    return (
        <View>
            <ViewHeader title={ResourceTitle} codicon="globe" onEdit={handleEditResource}>
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
                    isFormOpen={isFormOpen}
                />
                <EditResourceForm
                    isOpen={isFormOpen}
                    resourceData={data}
                    documentUri={documentUri}
                    onCancel={() => setFormOpen(false)}
                    onSave={onSave}
                />
            </ViewContent>
        </View>
    )
}

