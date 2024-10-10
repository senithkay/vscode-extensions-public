/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { yupResolver } from "@hookform/resolvers/yup";
import { EVENT_TYPE, MACHINE_VIEW, ProjectStructureArtifactResponse, GetSelectiveArtifactsResponse, GetUserAccessTokenResponse, Platform, ResourceType } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ComponentCard, ContainerProps, ContextMenu, Dropdown, FormActions, FormGroup, FormView, Item, ProgressIndicator, TextField, Typography, Icon } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { TestCaseEntry, TestCaseForm, TestSuiteType } from "./TestCaseForm";
import { UnitTest, TestCase, STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import path from "path";
import { getTestSuiteXML } from "../../../utils/template-engine/mustache-templates/TestSuite";
import { SelectMockService } from "./MockServices/SelectMockService";
import { MI_UNIT_TEST_GENERATION_BACKEND_URL } from "../../../constants";
import { ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";

interface TestSuiteFormProps {
    stNode?: UnitTest;
    filePath?: string;
    isWindows: boolean;
}

interface MockServiceEntry {
    name: string;
}

interface UnitTestApiResponse {
    event: string;
    error: string | null;
    tests: string;
}

const cardStyle = {
    display: "block",
    margin: "15px 0 0 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

export const AccordionContainer = styled.div<ContainerProps>`
    padding-left: 10px;
    overflow: hidden;
    display: flex;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
        cursor: pointer;
    }
`;

export const verticalIconStyles = {
    transform: "rotate(90deg)",
    ":hover": {
        backgroundColor: "var(--vscode-welcomePage-tileHoverBackground)",
    }
};


export function TestSuiteForm(props: TestSuiteFormProps) {
    const { rpcClient } = useVisualizerContext();
    const isUpdate = !!props.filePath;

    const [isLoaded, setIsLoaded] = useState(false);
    const [artifacts, setArtifacts] = useState([]);
    const [filteredArtifacts, setFilteredArtifacts] = useState([]);
    const [showAddTestCase, setShowAddTestCase] = useState(false);
    const [showAddMockService, setShowAddMockService] = useState(false);

    const [testCases, setTestCases] = useState<TestCaseEntry[]>([]);
    const [mockServices, setMockServices] = useState<MockServiceEntry[]>([]);

    const [currentTestCase, setCurrentTestCase] = useState<TestCaseEntry | undefined>(undefined);
    const [currentMockService, setCurrentMockService] = useState<MockServiceEntry | undefined>(undefined);
    const [projectUri, setProjectUri] = useState("");
    const [projectStructure, setProjectStructure] = useState<any>();

    const [allTestSuites, setAllTestSuites] = useState([]);
    const artifactTypes = ["Api", "Sequence", "Template"];
    const syntaxTree = props.stNode;
    const filePath = props.filePath;

    const isWindows = props.isWindows;
    const fileName = filePath ? filePath.split(isWindows ? path.win32.sep : path.sep).pop().split(".xml")[0] : undefined;

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "KeyLookup",
                label: "Name",
                filterType: ["sequence", "endpoint", "api", "messageStore", "messageProcessor", "task", "sequenceTemplate", "endpointTemplate", "proxyService", "dataService", "dataSource", "localEntry", "dataMapper"] as ResourceType[],
                isRequired: true
            }]
    }
    const [params, setParams] = useState(paramConfigs);

    // Schema
    const schema = yup.object({
        name: yup.string().required("Unit test name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in unit test name")
            .test('validateTestSuiteName',
                'A unit test with same name already exists', value => {
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
        reset,
        getValues,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const openUpdateExtensionView = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.UpdateExtension }});
    };

    const handleCreateUnitTests = async (values: any) => {
        setIsLoaded(false);

        try {

            let token: GetUserAccessTokenResponse;
            try {
                token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
            } catch (error) {
                console.error('User not signed in', error);
            }

            if (!token) {
                openSignInView();
            }
            const backendRootUri = (await rpcClient.getMiDiagramRpcClient().getBackendRootUrl()).url;
            const url = backendRootUri + MI_UNIT_TEST_GENERATION_BACKEND_URL;
            const artifact = isWindows ? path.win32.join(projectUri, values.artifact) : path.join(projectUri, values.artifact);

            var context: GetSelectiveArtifactsResponse[] = [];
            await rpcClient?.getMiDiagramRpcClient()?.getSelectiveArtifacts({ path: artifact }).then((response: GetSelectiveArtifactsResponse) => {
                context.push(response);
            });

            let retryCount = 0;
            const maxRetries = 2;

            const fetchUnitTests = async (): Promise<Response> => {
                let response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.token}`
                    },
                    body: JSON.stringify({ context: context[0].artifacts, test_file_name: values.name, num_suggestions: 1, type: "generate_unit_tests" }),
                });

                if (response.status === 401) {
                    // Retrieve a new token
                    await rpcClient.getMiDiagramRpcClient().refreshAccessToken();
                    const token = await rpcClient.getMiDiagramRpcClient().getUserAccessToken();
    
                    // Make the request again with the new token
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token.token}`
                        },
                        body: JSON.stringify({ context: context[0].artifacts, testFileName: values.name, num_suggestions: 1, type: "generate_unit_tests" }),
                    });
                } else if (response.status === 404) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchUnitTests(); // Retry the request
                    } else {
                        openUpdateExtensionView();
                        return response; // Exit the function if maximum retries reached
                    }                
                }

                if (!response.ok) {
                    throw new Error('Failed to create unit tests');
                }
                return response;
            }

            const response = await fetchUnitTests();
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


    useEffect(() => {
        (async () => {
            // get available artifacts
            const projectStructure = await rpcClient.getMiVisualizerRpcClient().getProjectStructure({});
            setProjectStructure(projectStructure);
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

                if (syntaxTree.unitTestArtifacts.supportiveArtifacts?.artifacts) {
                    paramConfigs.paramValues = [];
                    setParams(paramConfigs);
                    let count = 1;
                    syntaxTree.unitTestArtifacts.supportiveArtifacts.artifacts.map((param: any) => {
                        setParams((prev: any) => {
                            return {
                                ...prev,
                                paramValues: [...prev.paramValues, {
                                    id: prev.paramValues.length,
                                    paramValues: [
                                        { value: path.basename(param.content, path.extname(param.content)) }
                                    ],
                                    key: count++,
                                    value: path.basename(param.content, path.extname(param.content))
                                }
                                ]
                            }
                        });
                    });
                } else {
                    paramConfigs.paramValues = [];
                    setParams(paramConfigs);
                }

                if (syntaxTree.unitTestArtifacts.testArtifact.artifact) {
                    artifactPath = syntaxTree.unitTestArtifacts.testArtifact.artifact.content;
                    artifactType = allArtifacts.find(artifact => path.relative(artifact.path, artifactPath) === "")?.type;
                }

                // get test cases
                if (syntaxTree.testCases?.testCases) {
                    const testCases = getTestCases(syntaxTree.testCases.testCases);
                    setTestCases(testCases);
                }

                // get mock services
                if (syntaxTree.mockServices?.services) {
                    const mockServices = getMockServices(syntaxTree.mockServices.services);
                    setMockServices(mockServices);
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
                paramConfigs.paramValues = [];
                setParams(paramConfigs);
            }
            setIsLoaded(true);
        })();
    }, [filePath, syntaxTree]);

    useEffect(() => {
        if (!artifacts || artifacts.length === 0) {
            return;
        }

        const filteredArtifacts = artifacts.filter(artifact => artifact.type === getValues("artifactType")).map((artifact) => { return { id: artifact.name, value: artifact.path, content: artifact.name } });
        setFilteredArtifacts(filteredArtifacts);

        if (!filteredArtifacts || filteredArtifacts.length === 0) {
            return;
        }
        setValue("artifact", filteredArtifacts[0].value);
    }, [artifacts, watch("artifactType")]);

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };
    const openSignInView = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.LoggedOut } });
    };

    const openAddTestCase = () => {
        setShowAddTestCase(true);
    }

    const openMockService = () => {
        setShowAddMockService(true);
    }

    const submitForm = async (values: any) => {
        values.testCases = testCases;

        const customProperties = params.paramValues.length === 0
            ? []
            : await Promise.all(
                params.paramValues.map(async (param: any) => {
                    return await findParentByName(param.paramValues[0].value);
                })
            );
        values.supportiveArtifacts = customProperties;

        const mockServicePaths = [];
        const mockServicesDirs = ["src", "test", "resources", "mock-services"];
        for (let i = 0; i < mockServices.length; i++) {
            const fileName = mockServices[i].name + ".xml";
            const mockService = isWindows ? path.win32.join(...mockServicesDirs, fileName) : path.join(...mockServicesDirs, fileName);
            mockServicePaths.push(`${isWindows ? path.win32.sep : path.sep}` + mockService);
        }
        values.mockServices = mockServicePaths;

        const xml = getTestSuiteXML(values);
        const artifact = isWindows ? path.win32.join(projectUri, values.artifact) : path.join(projectUri, values.artifact);
        rpcClient.getMiDiagramRpcClient().updateTestSuite({ path: props.filePath, content: xml, name: values.name, artifact }).then(() => {
            openOverview();
        });
    }

    const getTestCases = (testCases: TestCase[]): TestCaseEntry[] => {
        return testCases.map((testCase) => {
            const assertions = testCase.assertions.assertions.map((assertion) => {
                return [
                    assertion.tag,
                    assertion?.actual?.textNode,
                    assertion?.expected?.textNode,
                    assertion?.message?.textNode,
                ]
            });
            const input = {
                requestPath: testCase?.input?.requestPath?.textNode,
                requestMethod: testCase?.input?.requestMethod?.textNode,
                requestProtocol: testCase?.input?.requestProtocol?.textNode,
                payload: testCase?.input?.payload?.textNode,
            }

            return {
                name: testCase.name,
                assertions: assertions,
                input: input,
                range: testCase.range,
            };
        });
    };

    const getMockServices = (mockServices: STNode[]): MockServiceEntry[] => {
        return mockServices.map((mockService) => {
            const mockServicePath = mockService.textNode;
            const mockServicesDirs = ["src", "test", "resources", "mock-services"];
            const mockServicesRoot = isWindows ? path.win32.join(...mockServicesDirs) : path.join(...mockServicesDirs);
            const fileName = mockServicePath.split(mockServicesRoot)[1];
            const name = fileName ? fileName.substring(1, fileName.length - 4) : "";

            return {
                name,
                isFile: true,
            };
        });
    };

    function getActions(entry: TestCaseEntry | MockServiceEntry, type: "test-case" | "mock-service") {
        const editAction: Item = {
            id: "edit",
            label: "Edit",
            onClick: () => {
                if (type === "test-case") {
                    editTestCase(entry as TestCaseEntry);
                } else {
                    editMockService(entry as MockServiceEntry);
                }
            },
        };
        const deleteAction: Item = {
            id: "delete",
            label: "Delete",
            onClick: () => {
                if (type === "test-case") {
                    setTestCases(testCases.filter(tc => tc !== entry));
                } else {
                    setMockServices(mockServices.filter(ms => ms !== entry));
                }
            },
        };
        if (type === "test-case") {
            const goToSourceAction: Item = {
                id: "go-to-source",
                label: "Go to Source",
                onClick: () => highlightCode(entry as TestCaseEntry, true),
            };
            return [goToSourceAction, editAction, deleteAction];
        }
        return [editAction, deleteAction];
    }

    const editTestCase = (testCase: TestCaseEntry) => {
        setCurrentTestCase(testCase);
        setTestCases(testCases.filter(tc => tc !== testCase));
        setShowAddTestCase(true);
    };

    const editMockService = (mockService: MockServiceEntry) => {
        setCurrentMockService(mockService);
        setMockServices(mockServices.filter(ms => ms !== mockService));
        setShowAddMockService(true);
    }

    const highlightCode = (entry: TestCaseEntry, force?: boolean) => {
        rpcClient.getMiDiagramRpcClient().highlightCode({
            range: {
                start: {
                    line: entry.range.startTagRange.start.line,
                    character: entry.range.startTagRange.start.character,

                },
                end: {
                    line: entry.range.endTagRange.end.line,
                    character: entry.range.endTagRange.end.character,
                },
            },
            force: force,
        });
    };

    const handlePropertiesOnChange = (params: any) => {
        let count = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: count++,
                    value: param.paramValues[0].value
                }
            })
        };
        setParams(modifiedParams);
    };

    if (!isLoaded) {
        return <ProgressIndicator />;
    }

    if (showAddTestCase) {
        const goBack = () => {
            if (currentTestCase) {
                setTestCases([...testCases, currentTestCase]);
            }
            setCurrentTestCase(undefined);
            setShowAddTestCase(false);
        }
        const onSubmit = (values: TestCaseEntry) => {
            setTestCases([...testCases, values]);
            setCurrentTestCase(undefined);
            setShowAddTestCase(false);
        };
        const availableTestCases = testCases.map((testCase) => testCase.name);
        return <TestCaseForm onGoBack={goBack} onSubmit={onSubmit} testCase={currentTestCase} availableTestCases={availableTestCases} testSuiteType={getValues('artifactType') as TestSuiteType} />
    }

    if (showAddMockService) {
        const goBack = () => {
            if (currentMockService) {
                setMockServices([...mockServices, currentMockService]);
            }
            setCurrentMockService(undefined);
            setShowAddMockService(false);
        }
        const onSubmit = (values: MockServiceEntry) => {
            setMockServices([...mockServices, values]);
            setCurrentMockService(undefined);
            setShowAddMockService(false);
        };
        const availableMockServices = mockServices.map((mockService) => mockService.name);

        return <SelectMockService name={currentMockService?.name} availableMockServices={availableMockServices} isWindows={isWindows} onGoBack={goBack} onSubmit={onSubmit}/>
    }

    async function findParentByName(name: string): Promise<string | null> {
        for (const [parent, artifacts] of Object.entries(projectStructure.directoryMap.src.main.wso2mi.artifacts) as [string, any][]) {
            for (const artifact of artifacts) {
                if (artifact.name === name) {
                    const fullPath = artifact.path;
                    const parts = fullPath.split(path.sep);
                    const startSegment = 'src';
                    const startIndex = parts.indexOf(startSegment);
                    return path.sep + path.join(...parts.slice(startIndex));
                }
            }
        }
        return null;
    }

    return (
        <FormView title={`${isUpdate ? "Update" : "Create New"} Unit Test`} onClose={handleBackButtonClick}>
            < TextField
                label="Name"
                id="name"
                placeholder="Unit test name"
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
                items={filteredArtifacts}
                sx={{ zIndex: 99 }}
                {...register("artifact")}
            ></Dropdown>
            <ParamManager
                addParamText="Add Supportive Artifact"
                paramConfigs={params}
                readonly={false}
                onChange={handlePropertiesOnChange} />
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <FormGroup title="Test cases" isCollapsed={false}>
                    <Button appearance="secondary" onClick={openAddTestCase}>Add test case</Button>

                    {testCases.map((testCase) => {
                        return (
                            <AccordionContainer onClick={() => editTestCase(testCase)}>
                                <Typography variant="h4">{testCase.name}</Typography>
                                <div style={{ margin: "auto 0 auto auto" }}>
                                    <ContextMenu
                                        sx={{ transform: "translateX(-50%)" }}
                                        iconSx={verticalIconStyles}
                                        menuItems={getActions(testCase, "test-case")}
                                        position='bottom-left'

                                    />
                                </div>
                            </AccordionContainer>
                        );
                    })}
                </FormGroup>
            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <FormGroup title="Mock services" isCollapsed={false}>
                    <Button appearance="secondary" onClick={openMockService}>Add mock service</Button>

                    {mockServices.map((mockService) => {
                        return (
                            <AccordionContainer onClick={() => editMockService(mockService)}>
                                <Typography variant="h4">{mockService.name}</Typography>
                                <div style={{ margin: "auto 0 auto auto" }}>
                                    <ContextMenu
                                        sx={{ transform: "translateX(-50%)" }}
                                        iconSx={verticalIconStyles}
                                        menuItems={getActions(mockService, "mock-service")}
                                        position='bottom-left'
                                    />
                                </div>
                            </AccordionContainer>
                        );
                    })}
                </FormGroup>
            </ComponentCard>

            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(submitForm)}
                >
                    {isUpdate ? "Update" : "Create"}
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateUnitTests)}
                >
                    <Icon name="wand-magic-sparkles-solid" sx="marginRight:5px" />&nbsp;
                    Generate Unit Tests with AI
                </Button>
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView >
    );

}
