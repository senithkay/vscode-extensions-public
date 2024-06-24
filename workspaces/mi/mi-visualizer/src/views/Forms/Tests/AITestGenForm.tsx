/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { yupResolver } from "@hookform/resolvers/yup";
import { EVENT_TYPE, MACHINE_VIEW, ProjectStructureArtifactResponse, GetSelectiveArtifactsResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, Dropdown, FormActions, FormView, ProgressIndicator, TextField } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { UnitTest } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import path from "path";
import { MI_UNIT_TEST_GENERATION_BACKEND_URL } from "../../../constants";

interface AITestGenFormProps {
    stNode?: UnitTest;
    filePath?: string;
}

interface UnitTestApiResponse {
    event: string;
    error: string | null;
    tests: string;
}

export function AITestGenForm(props: AITestGenFormProps) {
    const { rpcClient } = useVisualizerContext();

    const [isLoaded, setIsLoaded] = useState(false);
    const [artifacts, setArtifacts] = useState([]);
    const [projectUri, setProjectUri] = useState("");
    const [allTestSuites, setAllTestSuites] = useState([]);
    const artifactTypes = ["Api", "Sequence", "Template"];
    const syntaxTree = props.stNode;
    const filePath = props.filePath;
    const isWindows = navigator.platform.toLowerCase().includes("win");
    const fileName = filePath ? filePath.split(isWindows ? path.win32.sep : path.sep).pop().split(".xml")[0] : undefined;

    // Schema
    const schema = yup.object({
        name: yup.string().required("Test suite name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in test suite name")
            .test('validateTestSuiteName',
                'A test suite with same name already exists', value => {
                    let isDuplicate = false;
                    for (let i = 0; i < allTestSuites.length; i++) {
                        if (allTestSuites[i].name === value && allTestSuites[i].path !== filePath) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    return !isDuplicate;
                }),
        artifactType: yup.string().required("Artifact type is required"),
        artifact: yup.string().required("Artifact is required"),
    });

    const {
        handleSubmit,
        formState: { errors },
        register,
        watch,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            // get available artifacts
            const projectStructure = await rpcClient.getMiVisualizerRpcClient().getProjectStructure({});
            const machineView = await rpcClient.getVisualizerState();
            const projectUri = machineView.projectUri;
            const artifacts = projectStructure.directoryMap.src?.main?.wso2mi?.artifacts;
            const apis = artifacts?.apis?.map((api: ProjectStructureArtifactResponse) => { return { name: api.name, path: api.path.split(projectUri)[1], type: "Api" } });
            const sequences = artifacts?.sequences?.map((sequence: ProjectStructureArtifactResponse) => { return { name: sequence.name, path: sequence.path.split(projectUri)[1], type: "Sequence" } });
            const templates = artifacts?.templates?.map((template: ProjectStructureArtifactResponse) => { return { name: template.name, path: template.path.split(projectUri)[1], type: "Template" } });
            const allArtifacts = [...apis, ...sequences, ...templates];

            setArtifacts(allArtifacts);
            setProjectUri(projectUri);

            // get all test suites
            const testSuites = await rpcClient.getMiDiagramRpcClient().getAllTestSuites();
            setAllTestSuites(testSuites.testSuites);

            if (syntaxTree && filePath) {
                let artifactType = "";
                let artifactPath = "";

                if (syntaxTree.unitTestArtifacts.testArtifact.artifact) {
                    artifactPath = syntaxTree.unitTestArtifacts.testArtifact.artifact.content;
                    artifactType = allArtifacts.find(artifact => artifact.path === artifactPath)?.type;
                }

                reset({
                    name: fileName,
                    artifactType: artifactType,
                    artifact: artifactPath
                });
            } else {
                reset({
                    name: "",
                    artifactType: "Api",
                    artifact: apis[0]?.path,
                })
            }
            setIsLoaded(true);
        })();
    }, []);

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleCreateUnitTests = async (values: any) => {
        setIsLoaded(false);

        try {
            const token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
            const backendRootUri = (await rpcClient.getMiDiagramRpcClient().getBackendRootUrl()).url;
            const url = backendRootUri + MI_UNIT_TEST_GENERATION_BACKEND_URL;
            const artifact = isWindows ? path.win32.join(projectUri, values.artifact) : path.join(projectUri, values.artifact);

            var context: GetSelectiveArtifactsResponse[] = [];
            await rpcClient?.getMiDiagramRpcClient()?.getSelectiveArtifacts({path:artifact}).then((response: GetSelectiveArtifactsResponse) => {
                context.push(response);
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.token}`
                },
                body: JSON.stringify({ context: context[0].artifacts, testFileName: values.name, num_suggestions: 1, type: "generate_unit_tests" }),
            });
            if (!response.ok) {
                throw new Error('Failed to create unit tests');
            }
            const data = await response.json() as UnitTestApiResponse;
            if (data.event === "test_generation_success") {
            // Extract xml from the response
            const xml = data.tests.match(/```xml\n([\s\S]*?)\n```/gs);
            if (xml) {
                // Remove the Markdown code block delimiters
                const cleanedXml = xml.map(xml => xml.replace(/```xml\n|```/g, ''));
                rpcClient.getMiDiagramRpcClient().updateTestSuite({ path: props.filePath, content: cleanedXml[0], name: values.name, artifact }).then(() => {
                    openOverview();
                });
            } else {
                console.error('No XMLs found in the response');
            }
        } else {
                throw new Error("Failed to generate suggestions: " + data.error);
            }
        setIsLoaded(true);
    
        } catch (error) {
            console.error('Error while generating unit tests:', error);
        }
    };

    if (!isLoaded) {
        return <ProgressIndicator/>;
    }

    return (
        <FormView title= "Generate Unit Tests with AI" onClose={handleBackButtonClick}>
            < TextField
                label="Name"
                id="name"
                placeholder="Test suite name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />
            < Dropdown
                label="Artifact type"
                id="artifactType"
                errorMsg={errors.artifactType?.message.toString()}
                isRequired
                items={artifactTypes.map((artifactType) => { return { value: artifactType } })}
                {...register("artifactType")}
            ></Dropdown >
            <Dropdown
                label="Artifact"
                id="artifact"
                errorMsg={errors.artifact?.message.toString()}
                isRequired
                items={artifacts.filter(artifact => artifact.type === watch("artifactType")).map((artifact) => { return { id: artifact.name, value: artifact.path, content: artifact.name } })}
                sx={{ zIndex: 99 }}
                {...register("artifact")}
            ></Dropdown>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateUnitTests)}
                >
                    Generate Unit Tests with AI
                </Button>
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView >
    );
}
