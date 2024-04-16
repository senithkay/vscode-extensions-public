/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Button, FormView, FormGroup, FormActions } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { CreateTaskRequest, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import ControllerField, { FieldType } from "./Commons/ControllerField";

export interface Region {
    label: string;
    value: string;
}

interface TaskFormProps {
    path?: string;
};

type InputsFields = {
    name?: string;
    group?: string;
    implementation?: string;
    pinnedServers?: string;
    triggerType?: "simple" | "cron";
    triggerCount?: number;
    triggerInterval?: number;
    triggerCron?: string;
};

const initialInboundEndpoint: InputsFields = {
    name: "",
    group: "synapse.simple.quartz",
    implementation: "org.apache.synapse.startup.tasks.MessageInjector",
    pinnedServers: "",
    triggerType: "simple",
    triggerCount: 1,
    triggerInterval: 1,
    triggerCron: ""
};

const schema = yup.object({
    name: yup.string().required("Task Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Task name"),
    group: yup.string().required("Task group is required"),
    implementation: yup.string().required("Task Implementation is required"),
    pinnedServers: yup.string(),
    triggerType: yup.mixed().oneOf(["simple", "cron"]),
    triggerCount: yup.number().when('triggerType', {
        is: 'simple',
        then: (schema) => schema.typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 0"),
        otherwise: (schema) => schema.notRequired().default(1),
    }),
    triggerInterval: yup.number().when('triggerType', {
        is: 'simple',
        then: (schema) => schema.required('Trigger Interval is required').typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 1"),
        otherwise: (schema) => schema.notRequired().default(1),
    }),
    triggerCron: yup.string().when('triggerType', {
        is: 'cron',
        then: (schema) => schema.required("Trigger cron is required"),
        otherwise: (schema) => schema.notRequired().default(''),
    })
})

export function TaskForm(props: TaskFormProps) {

    const { rpcClient } = useVisualizerContext();

    const {
        reset,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        control
    } = useForm({
        defaultValues: initialInboundEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const [isNewTask, setIsNewTask] = useState(true);

    useEffect(() => {
        if (props.path && props.path.endsWith(".xml")) {
            (async () => {
                const taskRes = await rpcClient.getMiDiagramRpcClient().getTask({ path: props.path });
                if (taskRes.name) {
                    setIsNewTask(false);
                    reset(taskRes);
                }
            })();
        }
    }, [props.path]);

    const formTitle = isNewTask
        ? "Create new Scheduled Task"
        : "Edit Scheduled Task : " + props.path.replace(/^.*[\\/]/, '').split(".")[0];

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    };

    const handleCreateTask = async (values: any) => {
        const taskRequest: CreateTaskRequest = {
            ...values,
            directory: props.path
        };
        await rpcClient.getMiDiagramRpcClient().createTask(taskRequest);
        openOverview();
    };

    return (
        <FormView title={formTitle} onClose={handleOnClose}>
            <ControllerField
                required
                autoFocus
                id="name"
                label="Task Name"
                placeholder="Name"
                control={control}
                errors={errors}
            />
            <ControllerField
                id="pinnedServers"
                label="Pinned Servers"
                placeholder="Servers"
                control={control}
                errors={errors}
            />
            <FormGroup title="Trigger Information of the Task" isCollapsed={false}>
                <ControllerField
                    id="triggerType"
                    label="Trigger Type"
                    options={[{ content: "Simple", value: "simple" }, { content: "Cron", value: "cron" }]}
                    fieldType={FieldType.RADIO_GROUP}
                    control={control}
                    errors={errors}
                />
                {watch("triggerType") === 'simple' ? (
                    <>
                        <ControllerField
                            id="triggerCount"
                            label="Count"
                            control={control}
                            errors={errors}
                        />
                        <ControllerField
                            required
                            id="triggerInterval"
                            label="Interval (in seconds)"
                            control={control}
                            errors={errors}
                        />
                    </>
                ) : (
                    <ControllerField
                        required
                        id="triggerCron"
                        label="Cron"
                        control={control}
                        errors={errors}
                    />
                )}
            </FormGroup>
            <FormGroup title="Advanced">
                <ControllerField
                    required
                    id="group"
                    label="Task Group"
                    placeholder="Group"
                    control={control}
                    errors={errors}
                />
                <ControllerField
                    required
                    id="implementation"
                    label="Task Implementation"
                    placeholder="Implementation"
                    control={control}
                    errors={errors}
                />
            </FormGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateTask)}
                    disabled={(!isDirty && !isNewTask)}
                >
                    {isNewTask ? "Create" : "Save Changes"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={openOverview}
                >
                    Cancel
                </Button>
            </FormActions>
        </FormView >
    );
}
