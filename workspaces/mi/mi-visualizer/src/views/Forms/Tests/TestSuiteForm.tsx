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
import { EVENT_TYPE, MACHINE_VIEW, ProjectStructureArtifactResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ComponentCard, ContainerProps, ContextMenu, Dropdown, FormActions, FormGroup, FormView, Item, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { TestCaseEntry, TestCaseForm } from "./TestCaseForm";
import { UnitTest, TestCase, STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import path from "path";
import { getTestSuiteXML } from "../../../utils/template-engine/mustache-templates/TestSuite";
import { SelectMockService } from "./MockServices/SelectMockService";

interface TestSuiteFormProps {
    stNode?: UnitTest;
    filePath?: string;
}

interface MockServiceEntry {
    name: string;
}

const cardStyle = {
    display: "block",
    margin: "15px 0 0 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const AccordionContainer = styled.div<ContainerProps>`
    padding-left: 10px;
    overflow: hidden;
    display: flex;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
        cursor: pointer;
    }
`;

const verticalIconStyles = {
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
    const [showAddTestCase, setShowAddTestCase] = useState(false);
    const [showAddMockService, setShowAddMockService] = useState(false);

    const [testCases, setTestCases] = useState<TestCaseEntry[]>([]);
    const [mockServices, setMockServices] = useState<MockServiceEntry[]>([]);

    const [currentTestCase, setCurrentTestCase] = useState<TestCaseEntry | undefined>(undefined);
    const [currentMockService, setCurrentMockService] = useState<MockServiceEntry | undefined>(undefined);
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

    const openAddTestCase = () => {
        setShowAddTestCase(true);
    }

    const openMockService = () => {
        setShowAddMockService(true);
    }

    const submitForm = async (values: any) => {
        values.testCases = testCases;

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
                    assertion.actual.textNode,
                    assertion.expected.textNode,
                    assertion.message.textNode,
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

    if (!isLoaded) {
        return <div>Loading...</div>
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
        return <TestCaseForm onGoBack={goBack} onSubmit={onSubmit} testCase={currentTestCase} availableTestCases={availableTestCases} />
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

        return <SelectMockService name={currentMockService?.name} availableMockServices={availableMockServices} onGoBack={goBack} onSubmit={onSubmit} />
    }

    return (
        <FormView title={`${isUpdate ? "Update" : "Create New"} Test Suite`} onClose={handleBackButtonClick}>
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
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView >
    );

}
