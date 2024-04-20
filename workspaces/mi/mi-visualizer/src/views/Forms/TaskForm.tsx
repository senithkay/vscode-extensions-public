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
    triggerType?: string;
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

export function TaskForm(props: TaskFormProps) {

    const schema = yup.object({
        name: yup.string().required("Task Name is required")
            .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Task name")
            .test('validateTaskName',
                'Task with same name already exists', value => {
                    return !isNewTask ? !(tasks.includes(value) && value !== savedTaskName) : !tasks.includes(value);
                }),
        group: yup.string().required("Task group is required"),
        implementation: yup.string().required("Task Implementation is required"),
        pinnedServers: yup.string(),
        triggerType: yup.mixed().oneOf(["simple", "cron"]),
        triggerCount: yup.mixed().when('triggerType', {
            is: 'simple',
            then: () => yup.number().typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 0"),
            otherwise: () => yup.string().notRequired().default("1")
        }),
        triggerInterval: yup.number().when('triggerType', {
            is: 'simple',
            then: () => yup.number().required('Trigger Interval is required').typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 1"),
            otherwise: () => yup.string().notRequired().default("1")
        }),
        triggerCron: yup.string().when('triggerType', {
            is: 'cron',
            then: (schema) => schema.required("Trigger cron is required"),
            otherwise: (schema) => schema.notRequired().default(''),
        })
    })

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
    } = useForm({
        defaultValues: initialInboundEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const { rpcClient } = useVisualizerContext();
    const [isNewTask, setIsNewTask] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [savedTaskName, setSavedTaskName] = useState<string>("");
    const formTitle = isNewTask
        ? "Create new Scheduled Task"
        : "Edit Scheduled Task : " + props.path.replace(/^.*[\\/]/, '').split(".")[0];

    useEffect(() => {
        (async () => {
            const taskResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "task",
            });

            if (taskResponse.resources) {
                const resources = taskResponse.resources.map((resource) => resource.name);
                setTasks(resources);
            }
            if (props.path && props.path.endsWith(".xml")) {
                const taskRes = await rpcClient.getMiDiagramRpcClient().getTask({ path: props.path });
                if (taskRes.name) {
                    setIsNewTask(false);
                    reset(taskRes);
                    setSavedTaskName(taskRes.name);
                }
            }
        })();
    }, [props.path]);

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const handleCreateTask = async (values: any) => {
        const taskRequest: CreateTaskRequest = {
            ...values,
            directory: props.path
        };
        await rpcClient.getMiDiagramRpcClient().createTask(taskRequest);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <FormView title={formTitle} onClose={openOverview}>
            <TextField
                required
                autoFocus
                label="Task Name"
                placeholder="Name"
                {...renderProps("name")}
            />
            <TextField
                label="Pinned Servers"
                placeholder="Servers"
                {...renderProps("pinnedServers")}
            />
            <FormGroup title="Trigger Information of the Task" isCollapsed={false}>
                <RadioButtonGroup
                    label="Trigger Type"
                    options={[{ content: "Simple", value: "simple" }, { content: "Cron", value: "cron" }]}
                    {...renderProps("triggerType")}
                />
                {watch("triggerType") === 'simple' ? (
                    <>
                        <TextField
                            label="Count"
                            {...renderProps("triggerCount")}
                        />
                        <TextField
                            required
                            label="Interval (in seconds)"
                            {...renderProps("triggerInterval")}
                        />
                    </>
                ) : (
                    <>
                        <TextField
                            required
                            label="Cron"
                            {...renderProps("triggerCron")}
                        />
                    </>
                )}
            </FormGroup>
            <FormGroup title="Advanced">
                <TextField
                    required
                    label="Task Group"
                    placeholder="Group"
                    {...renderProps("group")}
                />
                <TextField
                    required
                    label="Task Implementation"
                    placeholder="Implementation"
                    {...renderProps("implementation")}
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
