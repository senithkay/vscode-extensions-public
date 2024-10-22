/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, ProjectStructureArtifactResponse } from "@wso2-enterprise/ballerina-core";
import { Button, TextField, Typography, View, ViewContent, ErrorBanner, FormGroup, ParamManager, ParamConfig, Parameters, Dropdown } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import { BodyText } from "../../styles";
import { getFunctionParametersList, parameterConfig } from "../../../utils/utils";

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

const Link = styled.a`
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    margin-right: 15px;
    margin-bottom: -5px;
    color: var(--button-primary-background);
`;

export function FunctionForm() {
    const { rpcClient } = useRpcContext();
    const [name, setName] = useState("");
    const [returnType, setReturnType] = useState("void");
    const [params, setParams] = useState(parameterConfig);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFunctionCreate = async () => {
        setIsLoading(true);
        const paramList = getFunctionParametersList(params);
        const res = await rpcClient.getBIDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.FUNCTIONS, functionType: { name, returnType, parameters: paramList } });
        setIsLoading(res.response);
        setError(res.error);
    };

    const validate = () => {
        return !name || isLoading;
    }

    const handleParamChange = (params: ParamConfig) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param, index) => {
                const defaultValue = `${param.parameters[2].value}`;
                let value = `${param.parameters[1].value}`
                if (defaultValue) {
                    value += ` = ${defaultValue}`;
                }
                return {
                    ...param,
                    key: param.parameters[0].value as string,
                    value: value
                }
            })
        };
        setParams(modifiedParams);
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">Create New Function</Typography>
                    <BodyText>
                        Define a function that can be used within the integration.
                    </BodyText>
                    <FormContainer>
                        <TextField
                            onTextChange={setName}
                            value={name}
                            label="Function Name"
                            placeholder="Enter function name"
                        />
                        <FormGroup title="Parameters" isCollapsed={true}>
                            <ParamManager paramConfigs={params} readonly={false} onChange={handleParamChange} />
                        </FormGroup>
                        <FormGroup title="Return Type" isCollapsed={true}>
                            <Dropdown
                                id="return"
                                label="Return Type"
                                items={[{ value: "string" }, { value: "int" }]} // FIXME: Replace this with type editor
                                onChange={(value) => setReturnType(value.target.value)}
                                value={returnType}
                            />
                        </FormGroup>
                        <ButtonWrapper>
                            <Button
                                disabled={validate()}
                                onClick={handleFunctionCreate}
                                appearance="primary"
                            >
                                Create Function
                            </Button>
                        </ButtonWrapper>
                        {error && <ErrorBanner errorMsg={error} />}
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
