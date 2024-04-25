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
import { NamedSequence } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Diagram } from "@wso2-enterprise/mi-diagram";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { generateSequenceData, onSequenceEdit } from "../../utils/form";
import { EditSequenceForm, EditSequenceFields } from "../Forms/EditForms/EditSequenceForm";

export interface SequenceViewProps {
    model: NamedSequence;
    documentUri: string;
    diagnostics: Diagnostic[];
}

export const SequenceView = ({ model: SequenceModel, documentUri, diagnostics }: SequenceViewProps) => {
    const { rpcClient } = useVisualizerContext();
    const model = SequenceModel as NamedSequence;
    const data = generateSequenceData(model) as EditSequenceFields
    const [isFormOpen, setFormOpen] = React.useState(false);

    const handleEditSequence = () => {
        setFormOpen(true);
    }

    const onSave = (data: EditSequenceFields) => {
        onSequenceEdit(data, model.range.startTagRange, documentUri, rpcClient);
        setFormOpen(false);
    }

    return (
        <View>
            {isFormOpen ?
                <EditSequenceForm
                    sequenceData={data}
                    isOpen={isFormOpen}
                    onCancel={() => setFormOpen(false)}
                    onSave={onSave}
                    documentUri={documentUri}
                /> :
                <>
                    <ViewHeader title={`Sequence: ${model.name}`} codicon="globe" onEdit={handleEditSequence} />
                    <ViewContent>
                        <Diagram
                            model={model}
                            documentUri={documentUri}
                            diagnostics={diagnostics}
                            isFormOpen={isFormOpen}
                        />
                    </ViewContent>
                </>
            }
        </View>
    )
}

