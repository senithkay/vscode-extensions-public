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
import { EVENT_TYPE, MACHINE_VIEW, MockService, ProjectStructureArtifactResponse, TestCase, TestSuite, UpdateTestSuiteResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ButtonWrapper, ComponentCard, ContainerProps, ContextMenu, Dropdown, FormActions, FormGroup, FormView, Item, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { TestCaseForm } from "./TestCaseForm";
import { MockServiceForm } from "./MockServices/MockServiceForm";

interface TestSuiteFormProps {
    filePath?: string;
}

const cardStyle = {
    display: "block",
    margin: "15px 0",
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

    const [isLoaded, setIsLoaded] = useState(false);
    const [artifacts, setArtifacts] = useState([]);
    const [showAddTestCase, setShowAddTestCase] = useState(false);
    const [showAddMockService, setShowAddMockService] = useState(false);
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [currentTestCase, setCurrentTestCase] = useState<TestCase | undefined>(undefined);
    const [mockServices, setMockServices] = useState<MockService[]>([]);
    const [currentMockService, setCurrentMockService] = useState<MockService | undefined>(undefined);
    const [allTestSuites, setAllTestSuites] = useState([]);
    const artifactTypes = ["Api", "Sequence", "Template"];

    // Schema
    const schema = yup.object({
        name: yup.string().required("Test suite name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in test suite name")
            .test('validateTestSuiteName',
                'A test suite with same name already exists', value => {
                    let isDuplicate = false;
                    for (let i = 0; i < allTestSuites.length; i++) {
                        if (allTestSuites[i].name === value) {
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
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty, dirtyFields },
        register,
        watch,
        getValues,
        setValue,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });


    useEffect(() => {
        (async () => {
            // get available artifacts
            const projectStructure = await rpcClient.getMiVisualizerRpcClient().getProjectStructure({});
            const apis = projectStructure.directoryMap.src?.main?.wso2mi?.artifacts?.apis?.map((api: ProjectStructureArtifactResponse) => { return { name: api.name, path: api.path, type: "Api" } });
            const sequences = projectStructure.directoryMap.src?.main?.wso2mi?.artifacts?.sequences?.map((sequence: ProjectStructureArtifactResponse) => { return { name: sequence.name, path: sequence.path, type: "Sequence" } });
            const templates = projectStructure.directoryMap.src?.main?.wso2mi?.artifacts?.templates?.map((template: ProjectStructureArtifactResponse) => { return { name: template.name, path: template.path, type: "Template" } });

            setArtifacts([...apis, ...sequences, ...templates]);

            if (props.filePath) {
                const testCases = getTestCases({});
                setTestCases(testCases);

                const mockServices = getMockServices({});
                setMockServices(mockServices);
            }

            // get all test suites
            const testSuites = await rpcClient.getMiDiagramRpcClient().getAllTestSuites();
            setAllTestSuites(testSuites.testSuites);

            setIsLoaded(true);
            reset({
                name: "",
                artifactType: "Api",
                artifact: apis[0]?.path,
            })
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
        for (let i = 0; i < mockServices.length; i++) {
            const mockService = await rpcClient.getMiDiagramRpcClient().updateMockService(mockServices[i]);
            mockServicePaths.push(mockService.path);
        }
        values.mockServices = mockServicePaths;

        rpcClient.getMiDiagramRpcClient().updateTestSuite({ path: props.filePath, ...values }).then((resp: UpdateTestSuiteResponse) => {
            openOverview();
        });
    }

    const getTestCases = (st: any): TestCase[] => {
        const testCases = [] as TestCase[];

        return testCases.map((testCase, index) => {
            let prevTestCase: TestCase | undefined = undefined;
            if (index > 0) {
                prevTestCase = testCases[index - 1];
            }
            const moreActions: Item[] = getActions(testCase, "test-case");

            return {
                ...testCase,
                actions: moreActions,
            };
        });
    };

    const getMockServices = (st: any): MockService[] => {
        const mockServices = [] as MockService[];

        return mockServices.map((mockService, index) => {
            let prevMockService: MockService | undefined = undefined;
            if (index > 0) {
                prevMockService = mockServices[index - 1];
            }
            const moreActions: Item[] = getActions(mockService, "mock-service");

            return {
                ...mockService,
                actions: moreActions,
            };
        });
    };

    function getActions(testCase: TestCase | MockService, type: "test-case" | "mock-service") {
        const goToSourceAction: Item = {
            id: "go-to-source",
            label: "Go to Source",
            onClick: () => highlightCode(testCase, true),
        };
        const editAction: Item = {
            id: "edit",
            label: "Edit",
            onClick: () => {
                if (type === "test-case") {
                    editTestCase(testCase as TestCase);
                } else {
                    editMockService(testCase as MockService);
                }
            },
        };
        const deleteAction: Item = {
            id: "delete",
            label: "Delete",
            onClick: () => {
                if (props.filePath) {
                    handleResourceDelete(testCase);
                }
                if (type === "test-case") {
                    setTestCases(testCases.filter(tc => tc !== testCase));
                } else {
                    setMockServices(mockServices.filter(ms => ms !== testCase));
                }
            },
        };
        const moreActions: Item[] = [goToSourceAction, editAction, deleteAction];
        return moreActions;
    }

    const editTestCase = (testCase: TestCase) => {
        setCurrentTestCase(testCase);
        setTestCases(testCases.filter(tc => tc !== testCase));
        setShowAddTestCase(true);
    };

    const editMockService = (mockService: MockService) => {
        setCurrentMockService(mockService);
        setMockServices(mockServices.filter(ms => ms !== mockService));
        setShowAddMockService(true);
    }

    const handleResourceDelete = (
        resource: TestCase | MockService
    ) => {
        // const position: Position = parentTagEndPosition;
        // let startPosition;
        // // Selecting the start position as the end position of the previous XML tag
        // if (!prevTestCase) {
        //     startPosition = {
        //         line: position.line,
        //         character: position.character,
        //     };
        // } else {
        //     startPosition = {
        //         line: prevTestCase.range.endTagRange.end.line,
        //         character: prevTestCase.range.endTagRange.end.character,
        //     };
        // }
        // rpcClient.getMiDiagramRpcClient().applyEdit({
        //     text: "",
        //     documentUri: documentUri,
        //     range: {
        //         start: startPosition,
        //         end: {
        //             line: currentTestCase.range.endTagRange.end.line,
        //             character: currentTestCase.range.endTagRange.end.character,
        //         },
        //     },
        // });
    };

    const highlightCode = (testCase: TestCase | MockService, force?: boolean) => {
        // rpcClient.getMiDiagramRpcClient().highlightCode({
        //     range: {
        //         start: {
        //             line: testCase.position.startLine,
        //             character: testCase.position.startColumn,

        //         },
        //         end: {
        //             line: testCase.position.endLine,
        //             character: testCase.position.endColumn,
        //         },
        //     },
        //     force: force,
        // });
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
        const onSubmit = (values: TestCase) => {
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
        const onSubmit = (values: MockService) => {
            setMockServices([...mockServices, values]);
            setCurrentMockService(undefined);
            setShowAddMockService(false);
        };
        const availableMockServices = mockServices.map((mockService) => mockService.name);
        return <MockServiceForm onGoBack={goBack} onSubmit={onSubmit} mockService={currentMockService} availableMockServices={availableMockServices} />
    }

    return (
        <FormView title="Create New Test Suite" onClose={handleBackButtonClick}>
            <TextField
                label="Name"
                id="name"
                placeholder="Test suite name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />
            <Dropdown
                label="Artifact type"
                id="artifactType"
                errorMsg={errors.artifactType?.message.toString()}
                isRequired
                items={artifactTypes.map((artifactType) => { return { value: artifactType } })}
                {...register("artifactType")}
            ></Dropdown>
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
                    <Button appearance="primary" onClick={openAddTestCase}>Add test case</Button>

                    {testCases.map((testCase, index) => {
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
                    <Button appearance="primary" onClick={openMockService}>Add mock service</Button>

                    {mockServices.map((mockService, index) => {
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
                // disabled={!isDirty || ( getValues("filePath") === "Please select a file or folder")}
                >
                    Create
                </Button>
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );

}
