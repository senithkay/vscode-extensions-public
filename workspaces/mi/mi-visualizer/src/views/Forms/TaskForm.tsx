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
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { SectionWrapper } from "./Commons";

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

const initialInboundEndpoint = {
    name: "",
    group: "synapse.simple.quartz",
    implementation: "org.apache.synapse.startup.tasks.MessageInjector",
    pinnedServers: "",
    triggerType: "simple",
    triggerCount: 1,
    triggerInterval: 1,
    triggerCron: ""
};

export function TaskWizard(props: DetailedTaskWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [isNewTask, setIsNewTask] = useState(true);
    const [changesOccured, setChangesOccured] = useState(false);

    const [task, setTask] = useState<any>(initialInboundEndpoint);

    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });

    useEffect(() => {
        if (props.path) {
            (async () => {
                const taskRes = await rpcClient.getMiDiagramRpcClient().getTask({ path: props.path });
                console.log(taskRes);
                if (taskRes.name) {
                    setIsNewTask(false);
                    setTask(taskRes);
                }
                else {
                    clearForm();
                }
            })();
        }
    }, [props.path]);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;

        if (INVALID_CHARS_REGEX.test(task.name)) {
            handleMessage("Invalid Task Name", true);
        }
        else {
            handleMessage("");
        }
    }, [task.name]);

    useEffect(() => {
        if (isNaN(Number(task.triggerCount)) || isNaN(Number(task.triggerInterval)) || Number(task.triggerCount) < 1 || Number(task.triggerInterval) < 1) {
            handleMessage("Invalid Count or Interval", true);
        }
        else {
            handleMessage("");
        }
    }, [task.triggerCount, task.triggerInterval]);

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleOnChange = (field: any, value: any) => {
        if (!isNewTask && !changesOccured) {
            setChangesOccured(true);
        }

        setTask((prevTask: any) => ({ ...prevTask, [field]: value }));
    }

    const handleTriggerTypeChange = (type: any) => {
        if (!isNewTask && !changesOccured) {
            setChangesOccured(true);
        }

        setTask((prevTask: any) => ({ ...prevTask, triggerType: type }));
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const clearForm = () => {
        setTask(initialInboundEndpoint);
        setMessage({ isError: false, text: "" });
        setIsNewTask(true);
    }

    const handleCreateTask = async () => {
        const ceateTaskParams = {
            ...task,
            directory: props.path ?? "",
        }
        await rpcClient.getMiDiagramRpcClient().createTask(ceateTaskParams);
        handleMessage(isNewTask ? "Task created successfully" : "Task updated successfully");
        clearForm();
        openOverview();
    };

    const isValid: boolean = !message.isError && task.name.length > 0 && task.group.length > 0 && task.implementation.length > 0
        && (task.triggerType === 'simple' ?
            Number(task.triggerCount) >= 1 && Number(task.triggerInterval) >= 1 :
            task.triggerCron.length > 0);

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
                    value={task.name}
                    id='name-input'
                    label="Task Name"
                    placeholder="Name"
                    validationMessage="Task name is required"
                    onChange={(text: string) => handleOnChange("name", text)}
                    size={100}
                    autoFocus
                    required
                />
                <TextField
                    value={task.group}
                    id='group-input'
                    label="Task Group"
                    placeholder="Group"
                    validationMessage="Task group is required"
                    onChange={(text: string) => handleOnChange("group", text)}
                    size={100}
                    required
                />
                <TextField
                    value={task.implementation}
                    id='implementation'
                    label="Task Implementation"
                    placeholder="Implementation"
                    validationMessage="Task implementation is required"
                    onChange={(text: string) => handleOnChange("implementation", text)}
                    size={100}
                    required
                />
                <TextField
                    value={task.pinnedServers}
                    id='pinned-servers'
                    label="Pinned Servers"
                    placeholder="Servers"
                    onChange={(text: string) => handleOnChange("pinnedServers", text)}
                    size={100}
                />
                <Typography variant="h4" sx={{ my: 0 }}>Trigger Information of the Task</Typography>
                <TriggerContainer>
                    <FlexDiv>
                        <Typography sx={{ whiteSpace: 'nowrap' }}>Trigger Type</Typography>
                        <Dropdown
                            id="trigger-type"
                            value={task.triggerType}
                            onChange={handleTriggerTypeChange}
                            items={[{ content: "Simple", value: "simple" }, { content: "Cron", value: "cron" }]}
                        />
                    </FlexDiv>
                    {task.triggerType === 'simple' ? (
                        <HiddenFormWrapper>
                            <TextField
                                value={task.triggerCount}
                                id='count'
                                label="Count"
                                onChange={(text: string) => {
                                    if (!isNaN(Number(text))) {
                                        handleOnChange("triggerCount", Number(text));
                                    }
                                }}
                                size={50}
                            />
                            <TextField
                                value={task.triggerInterval}
                                id='interval'
                                label="Interval (in seconds)"
                                validationMessage="Interval is required"
                                onChange={(text: string) => {
                                    if (!isNaN(Number(text))) {
                                        handleOnChange("triggerInterval", Number(text));
                                    }
                                }}
                                size={50}
                                required
                            />
                        </HiddenFormWrapper>
                    ) : (
                        <HiddenFormWrapper>
                            <TextField
                                value={task.triggerCron}
                                id='cron'
                                label="Cron"
                                validationMessage="Cron is required"
                                onChange={(text: string) => handleOnChange("triggerCron", text)}
                                size={50}
                                required
                            />
                        </HiddenFormWrapper>
                    )}
                </TriggerContainer>
            </SectionWrapper>
            <ActionContainer>
                {message && <Message is-error={message.isError}>{message.text}</Message>}
                <FlexDiv>
                    <Button
                        appearance="secondary"
                        onClick={openOverview}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateTask}
                        disabled={!isValid || (!changesOccured && !isNewTask)}
                    >
                        {isNewTask ? "Create" : "Save Changes"}
                    </Button>
                </FlexDiv>
            </ActionContainer>
        </WizardContainer>
    );
}
