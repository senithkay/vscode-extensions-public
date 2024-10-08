/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { DIRECTORY_MAP } from "@wso2-enterprise/ballerina-core";
import { Button, TextField, Typography, View, ViewContent, ErrorBanner, RadioButtonGroup, FormGroup, Dropdown } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import { BodyText } from "../../styles";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 20px;
    margin-top: 20px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

type TriggerType = "SCHEDULED" | "MANUAL";

export function MainForm() {
    const { rpcClient } = useRpcContext();
    const [name, setName] = useState("");
    const [triggerType, setType] = useState<TriggerType>("MANUAL");
    const [argType, setArgType] = useState("");
    const [argName, setArgName] = useState("");
    const [cron, setCron] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFunctionCreate = async () => {
        setIsLoading(true);
        console.log(triggerType);
        const res = await rpcClient.getBIDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.TASKS, taskType: { name, triggerType, argType, argName, cron } });
        setIsLoading(res.response);
        setError(res.error);
    };

    const validate = () => {
        if (triggerType === "SCHEDULED") {
            return !name || !cron || isLoading;
        } else {
            return !name || isLoading;
        }
    }

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">Create Automation Task</Typography>
                    <BodyText>
                        Implement a task for either scheduled or one-time jobs.
                    </BodyText>
                    <FormContainer>
                        <TextField
                            onTextChange={setName}
                            value={name}
                            label="Task Name"
                            placeholder="Enter task name"
                        />
                        <RadioButtonGroup
                            id="triggerType"
                            label="Trigger Type"
                            options={[{ content: "Manual", value: "MANUAL" }, { content: "Scheduled", value: "SCHEDULED" }]}
                            onChange={(value) => setType(value.target.value as TriggerType)}
                            value={triggerType}
                        />
                        {triggerType === "SCHEDULED" &&
                            <TextField
                                onTextChange={setCron}
                                value={cron}
                                label="Cron Expression"
                                placeholder="Enter Cron expression"
                            />
                        }
                        <FormGroup title="Command-line Argument" isCollapsed={true}>
                            <Dropdown
                                id="injectTo"
                                label="Argument Type"
                                items={[{ value: "string" }, { value: "int" }]}
                                onChange={(value) => setArgType(value.target.value)}
                                value={argType}
                            />
                            <TextField
                                label="Argument Name"
                                placeholder="Enter argument name"
                                onChange={(value) => setArgName(value.target.value)}
                                value={argName}
                            />
                        </FormGroup>
                        <ButtonWrapper>
                            <Button
                                disabled={validate()}
                                onClick={handleFunctionCreate}
                                appearance="primary"
                            >
                                Create Task
                            </Button>
                        </ButtonWrapper>
                        <BodyText >
                            Please Note: Only one task can be created per project.
                        </BodyText>
                        {error && <ErrorBanner errorMsg={error} />}
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
