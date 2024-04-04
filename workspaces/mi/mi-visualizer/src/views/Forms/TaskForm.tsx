/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Button, TextField, RadioButtonGroup, FormView, FormGroup, FormActions } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { CreateTaskRequest, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";

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
    triggerCount: null,
    triggerInterval: 1,
    triggerCron: ""
};

const schema = yup.object({
    name: yup.string().required("Task Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Task name"),
    group: yup.string().required("Task group is required"),
    implementation: yup.string().required("Task Implementation is required"),
    pinnedServers: yup.string(),
    triggerType: yup.mixed<"simple" | "cron">().oneOf(["simple", "cron"]),
    triggerCount: yup.number().nullable().typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 0"),
    triggerInterval: yup.number().typeError('Trigger interval must be a number').min(1, "Trigger interval must be greater than 0"),
    triggerCron: yup.string()
})

export function TaskForm(props: TaskFormProps) {

    const { rpcClient } = useVisualizerContext();
    
    const {
        reset,
        register,
        formState: { errors, isDirty, isValid },
        handleSubmit,
        getValues,
        watch,
        setValue
    } = useForm({
        defaultValues: initialInboundEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const [isNewTask, setIsNewTask] = useState(true);

    useEffect(() => {
        if (props.path) {
            (async () => {
                const taskRes = await rpcClient.getMiDiagramRpcClient().getTask({ path: props.path });
                console.log(taskRes);
                if (taskRes.name) {
                    setIsNewTask(false);
                    reset(taskRes);
                }
            })();
        }
    }, [props.path]);

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    };

    const handleCreateTask = async (values: InputsFields) => {
        const taskRequest: CreateTaskRequest = {
            name: values.name,
            group: values.group,
            implementation: values.implementation,
            pinnedServers: values.pinnedServers,
            triggerType: values.triggerType,
            triggerCount: values.triggerCount,
            triggerInterval: values.triggerInterval,
            triggerCron: values.triggerCron,
            directory: props.path
        };
        await rpcClient.getMiDiagramRpcClient().createTask(taskRequest);
        openOverview();
    };

    watch();

    // If triggerType changed to cron, then clear the triggerCount and triggerInterval and vice versa
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'triggerType') {
                if (value.triggerType === 'cron') {
                    setValue('triggerCount', null);
                    setValue('triggerInterval', 1);
                } else {
                    setValue('triggerCron', '');
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    return (
        <FormView title="Scheduled Task" onClose={handleBackButtonClick}>
            <TextField
                label="Task Name"
                id="name"
                placeholder="Name"
                errorMsg={errors.name?.message.toString()}
                autoFocus
                required
                {...register("name")}
            />
            <TextField
                label="Task Group"
                id="group"
                placeholder="Group"
                errorMsg={errors.group?.message.toString()}
                required
                {...register("group")}
            />
            <TextField
                label="Task Implementation"
                id="implementation"
                placeholder="Implementation"
                errorMsg={errors.implementation?.message.toString()}
                required
                {...register("implementation")}
            />
            <TextField
                label="Pinned Servers"
                id="pinned-servers"
                placeholder="Servers"
                {...register("pinnedServers")}
            />
            <FormGroup title="Trigger Information of the Task">
                <RadioButtonGroup
                    label="Trigger Type"
                    id="trigger-group"
                    options={[{ content: "Simple", value: "simple" }, { content: "Cron", value: "cron" }]}
                    {...register("triggerType")}
                />
                {getValues("triggerType") === 'simple' ? (
                    <>
                        <TextField
                            id="count"
                            label="Count"
                            errorMsg={errors.triggerCount?.message.toString()}
                            {...register("triggerCount", { valueAsNumber: true })}
                        />
                        <TextField
                            label="Interval (in seconds)"
                            id="interval"
                            required
                            errorMsg={errors.triggerInterval?.message.toString()}
                            {...register("triggerInterval", { valueAsNumber: true })}
                        />
                    </>
                ) : (
                    <>
                        <TextField
                            label="Cron"
                            id="cron"
                            required
                            errorMsg={errors.triggerCron?.message.toString()}
                            {...register("triggerCron")}
                        />
                    </>
                )}
            </FormGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit((values) => {
                        handleCreateTask(values);
                    })}
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
