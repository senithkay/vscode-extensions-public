/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Button, Codicon, TextField, Typography, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { CreateTaskRequest, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { SectionWrapper } from "./Commons";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";

const WizardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 95vw;
    height: calc(100vh - 140px);
    overflow: auto;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 20px 120px;
    width: calc(100% - 250px);
    margin: 0 auto;
`;

const HiddenFormWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 20px;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

const TriggerContainer = styled.div({
    padding: "20px 20px",
    border: "1px solid #e0e0e0",
    borderRadius: "5px"
});

const FlexDiv = styled.div({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "20px"
});

const Message = styled.span((props: any) => ({
    color: props["is-error"] ? "#f48771" : "",
}));

export interface Region {
    label: string;
    value: string;
}

interface DetailedTaskWizardProps {
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

const schema = yup
  .object({
    name: yup.string().required("Task Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Task name"),
    group: yup.string().required("Task group is required"),
    implementation: yup.string().required("Task Implementation is required"),
    pinnedServers: yup.string(),
    triggerType: yup.mixed<"simple" | "cron">().oneOf(["simple", "cron"]),
    triggerCount: yup.number().nullable().typeError('Trigger count must be a number').min(1, "Trigger count must be greater than 0"),
    triggerInterval: yup.number().typeError('Trigger interval must be a number').min(1, "Trigger interval must be greater than 0"),
    triggerCron: yup.string()
  })

export function TaskWizard(props: DetailedTaskWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const {
        reset,
        register,
        formState: { errors, isDirty, isValid },
        handleSubmit,
        getValues,
    } = useForm<InputsFields>({
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

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">{!isNewTask && "Update"} Scheduled Task Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    label="Task Name"
                    id="name"
                    placeholder="Name"
                    size={100}
                    errorMsg={errors.name?.message.toString()}
                    autoFocus
                    required
                    {...register("name")}
                />
                <TextField
                    label="Task Group"
                    id="group"
                    placeholder="Group"
                    size={100}
                    errorMsg={errors.group?.message.toString()}
                    required
                    {...register("group")}
                />
                <TextField
                    label="Task Implementation"
                    id="implementation"
                    placeholder="Implementation"
                    size={100}
                    errorMsg={errors.implementation?.message.toString()}
                    required
                    {...register("implementation")}
                />
                <TextField
                    label="Pinned Servers"
                    id="pinned-servers"
                    placeholder="Servers"
                    size={100}
                    {...register("pinnedServers")}
                />
                <Typography variant="h4" sx={{ my: 0 }}>Trigger Information of the Task</Typography>
                <TriggerContainer>
                    <FlexDiv>
                        <Typography sx={{ whiteSpace: 'nowrap' }}>Trigger Type</Typography>
                        <Dropdown
                            id="trigger-group"
                            items={[{ content: "Simple", value: "simple" }, { content: "Cron", value: "cron" }]}
                            {...register("triggerType")}
                        />
                    </FlexDiv>
                    {getValues("triggerType") === 'simple' ? (
                        <HiddenFormWrapper>
                            <TextField
                                id="count"
                                label="Count"
                                size={50}
                                errorMsg={errors.triggerCount?.message as string}
                                {...register("triggerCount", { valueAsNumber: true })}
                            />
                            <TextField
                                label="Interval (in seconds)"
                                id="interval"
                                size={50}
                                required
                                errorMsg={errors.triggerInterval?.message.toString()}
                                {...register("triggerInterval", { valueAsNumber: true })}
                            />
                        </HiddenFormWrapper>
                    ) : (
                        <HiddenFormWrapper>
                            <TextField
                                label="Cron"
                                id="cron"
                                size={50}
                                required
                                errorMsg={errors.triggerCron?.message.toString()}
                                {...register("triggerCron")}
                            />
                        </HiddenFormWrapper>
                    )}
                </TriggerContainer>
            </SectionWrapper>
            <ActionContainer>
                <FlexDiv>
                    <Button
                        appearance="secondary"
                        onClick={openOverview}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit((values) => {
                            handleCreateTask(values);
                        })}
                        disabled={(!isDirty && !isNewTask)}
                    >
                        {isNewTask ? "Create" : "Save Changes"}
                    </Button>
                </FlexDiv>
            </ActionContainer>
        </WizardContainer>
    );
}
