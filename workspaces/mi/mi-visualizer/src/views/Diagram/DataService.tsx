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
import { Query } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Diagram } from "@wso2-enterprise/mi-diagram";
import { Switch } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { View, ViewContent, ViewHeader } from "../../components/View";
import styled from "@emotion/styled";
import { ResourceFormData } from "../Forms/ResourceForm";

interface ColoredTagProps {
    color: string;
};

const ColoredTag = styled(VSCodeTag) <ColoredTagProps>`
    ::part(control) {
        color: var(--button-primary-foreground);
        background-color: ${({ color }: ColoredTagProps) => color};
    }
`;

export interface DataServiceViewProps {
    model: any;
    href: string;
    documentUri: string;
    diagnostics: Diagnostic[];
}

export const DataServiceView = (props: DataServiceViewProps) => {
    const { rpcClient } = useVisualizerContext();
    const model = props.model?.data?.queries?.find((query: any) => query.id === props.href) as Query;

    // const data = generateResourceData(model) as ResourceType;
    const [isFaultFlow, setFlow] = React.useState<boolean>(false);
    const [isFormOpen, setFormOpen] = React.useState(false);

    const toggleFlow = () => {
        setFlow(!isFaultFlow);
    };

    const handleEditResource = () => {
        console.log(model);
        setFormOpen(true);
    }

    const onSave = (data: ResourceFormData) => {
        // const ranges: Range[] = getResourceDeleteRanges(model, data);
        // onResourceEdit(data, model.range, ranges, props.documentUri, rpcClient);
        // setFormOpen(false);
    }

    const ResourceTitle = (
        <React.Fragment>
            <span>Query:</span>
            {/* {model.methods.map((method, index) => <ColoredTag key={index} color={getColorByMethod(method)}>{method}</ColoredTag>)} */}
            <span>{model?.id}</span>
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
                    documentUri={props.documentUri}
                    diagnostics={props.diagnostics}
                    isFaultFlow={isFaultFlow}
                    isFormOpen={isFormOpen}
                />
                {/* <ResourceForm
                    isOpen={isFormOpen}
                    formData={data}
                    documentUri={documentUri}
                    onCancel={() => setFormOpen(false)}
                    onSave={onSave}
                /> */}
            </ViewContent>
        </View>
    )
}

