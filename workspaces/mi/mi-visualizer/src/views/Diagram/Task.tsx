/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { Diagnostic } from "vscode-languageserver-types";
import { NamedSequence, Task } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { Diagram } from "@wso2-enterprise/mi-diagram";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { generateSequenceData, onSequenceEdit } from "../../utils/form";
import { EditSequenceForm, EditSequenceFields } from "../Forms/EditForms/EditSequenceForm";
import { TaskForm } from "../Forms/TaskForm";
import { GetTaskResponse } from '@wso2-enterprise/mi-core';

export interface TaskViewProps {
    path: string;
    model: Task;
    diagnostics: Diagnostic[];
}

export const TaskView = ({ path, model, diagnostics }: TaskViewProps) => {
    const { rpcClient } = useVisualizerContext();
    // const data = generateSequenceData(model) as EditSequenceFields
    const [isFormOpen, setFormOpen] = React.useState(false);

    const handleEditTask = () => {
        setFormOpen(true);
    }

    const onSave = (data: EditSequenceFields) => {
        setFormOpen(false);
    }

    return (
        <View>
            {isFormOpen || !model.sequence ?
                <TaskForm path={path} /> :
                <>
                    <ViewHeader title={`Task: ${model.name}`} codicon="globe" onEdit={handleEditTask} />
                    {<ViewContent>
                        <Diagram
                            model={model.sequence}
                            documentUri={model.sequenceURI}
                            diagnostics={diagnostics}
                            isFormOpen={isFormOpen}
                        />
                    </ViewContent>}
                </>
            }
        </View>
    )
}

