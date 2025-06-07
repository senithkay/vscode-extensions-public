/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Page } from "@playwright/test";
import { Form } from "./Form";
import { ProjectExplorer } from "./ProjectExplorer";

interface PropertyData {
    name: string,
    scope: 'default' | 'transport' | 'axis2' | 'axis2-client',
    value: string
}

interface AssertionData {
    type: 'Assert Equals' | 'Assert Not Null',
    actualExpression: string,
    expectedValue?: string,
    errorMessage: string
}

interface HeaderData {
    name: string,
    value: string
}

interface ExpectedRequestData {
    headers?: HeaderData[],
    payload: string
}

interface ExpectedResponseData {
    statusCode: string,
    headers?: HeaderData[],
    payload: string
}

interface MockServiceResourceData {
    serviceSubContext: string,
    serviceMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
    expectedRequest: ExpectedRequestData,
    expectedResponse: ExpectedResponseData
}

interface TestCaseData {
    name: string,
    resourcePath: string,
    resourceMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT',
    resourceProtocol: 'HTTP' | 'HTTPS',
    inputPayload?: string,
    properties?: PropertyData[],
    assertions?: AssertionData[]
}

interface MockServiceData {
    name: string,
    endpoint?: string,
    port: string,
    context: string
    resources?: MockServiceResourceData[]
}

interface UnitTestData {
    name: string,
    artifactType: 'API' | 'Sequence',
    artifact: string,
    supportiveArtifacts?: string[];
    registryResources?: string[];
    testCases?: TestCaseData[];
    mockServices?: string | MockServiceData[];
}

export class UnitTest {
    private projectName: string = 'testProject';

    constructor(private _page: Page) {
    }

    public async init() {
        const testBtn = this._page.getByRole('tab', { name: 'Testing' }).locator('a');
        await testBtn.waitFor();
        await testBtn.click();
    }

    public async openUnitTestFormByMainBtn() {
        await this._page.getByRole('button', { name: 'Add Unit Test', exact: true }).click();
    }

    public async openUnitTestFormByExplorer() {
        const testExplorer = this._page.locator('div[aria-label="Test Explorer Section"]');
        await testExplorer.hover();
        await testExplorer.getByLabel('Test Explorer actions').getByLabel('Add unit test').click();
    }

    private async getUniTestForm(): Promise<Form> {
        const form = new Form(this._page, 'Test Suite Form');
        await form.switchToFormView();
        return form;
    }

    private async getTestCaseForm(): Promise<Form> {
        const form = new Form(this._page, 'Test Case Form');
        await form.switchToFormView();
        return form;
    }

    private async getMockServiceForm(): Promise<Form> {
        const form = new Form(this._page, 'Mock Service');
        await form.switchToFormView();
        return form;    
    }

    private async addSupportiveArtifacts(parentForm: Form, artifacts: string[]) {
        for (const artifact of artifacts) {
            console.log('Adding supportive artifact: ', artifact);
            const paramManager = await parentForm.getSimpleParamManager('Supportive Artifact');
            const form = await paramManager.getAddNewForm();      
            await form.fill({
            values: {
                'Name': {
                    type: 'combo',
                    value: artifact
                }
            }
            });
            await form.submit('Save');
        }
    }

    private async addRegistryResources(parentForm: Form, resources: string[]) {
        for (const resource of resources) {
            console.log('Adding registry resource: ', resource);
            const paramManager = await parentForm.getSimpleParamManager('Registry Resources');
            const form = await paramManager.getAddNewForm();
            await form.fill({
                values: {
                    'Name': {
                        type: 'combo',
                        value: resource
                    }
                }
            });
            await form.submit('Save');
        }
    }

    public async fillTestCaseForm(form: Form, testCase: TestCaseData) {
        this._page.pause();
        await this.fillTestCaseBasicForm(form, testCase);
        for (const property of testCase.properties ?? []) {
            const propertiesParamManager = await form.getDefaultParamManager('Properties', 'Add Property');
            const propertiesForm = await propertiesParamManager.getAddNewForm();
            await this.fillTestCasePropertyForm(propertiesForm, property);
            await propertiesForm.submit('Save');
        }
        for (const assertion of testCase.assertions ?? []) {
            const assertionsParamManager = await form.getDefaultParamManager('Assertions', 'Add Assertion');
            const assertionsForm = await assertionsParamManager.getAddNewForm();
            await this.fillTestCaseAssertionForm(assertionsForm, assertion);
            await assertionsForm.submit('Save');
        }
    }

    public async fillTestCaseBasicForm(form: Form, testCase: TestCaseData) {
        await form.fill({
            values: {
                'Name*': {
                    type: 'input',
                    value: testCase.name 
                },
                'Resource path*': {
                    type: 'input',
                    value: testCase.resourcePath
                },
                'Resource method': {
                    type: 'dropdown',
                    value: testCase.resourceMethod  
                },
                'Resource Protocol': {
                    type: 'dropdown',
                    value: testCase.resourceProtocol
                },
                'Input Payload ': {
                    type: 'textarea',
                    value: testCase.inputPayload || ''
                }
            }
        });
    }

    private async fillTestCasePropertyForm(form: Form, property: PropertyData) {
        await form.fill({
            values: {
                'Property Name*': {
                    type: 'input',
                    value: property.name
                },
                'Property Scope*': {
                    type: 'dropdown',
                    value: property.scope
                },
                'Property Value*': {
                    type: 'input',
                    value: property.value
                }
            }
        });
    }

    private async fillTestCaseAssertionForm(form: Form, assertion: AssertionData) {
        await form.fill({
            values: {
                'Assertion Type': {
                    type: 'dropdown',
                    value: assertion.type
                },
                'Actual Expression*': {
                    type: 'input',
                    value: assertion.actualExpression
                },
                'Error Message*': {
                    type: 'input',
                    value: assertion.errorMessage
                }
            }
        });
        if (assertion.expectedValue) {
            await form.fill({
                values: {
                    'Expected Value ': {
                        type: 'textarea',
                        value: assertion.expectedValue
                    },
                }
            });
        }
    }
    
    private async addTestCases(parentForm: Form, testCases: TestCaseData[]) {
        for (const testCase of testCases) {
            console.log('Adding test case: ', testCase.name);
            const paramManager = await parentForm.getParamManagerWithNewCreateForm('TestCases', 'Test Suite Form');
            const form = await paramManager.getAddNewForm();
            await this.fillTestCaseForm(form, testCase);
            await form.submit('Create');
        }
    }

    public async fillMockServiceBasicForm(mockServiceForm: Form, mockService: MockServiceData) {
        await mockServiceForm.fill({
            values: {
                'Name*': {
                    type: 'input',
                    value: mockService.name
                },
                'Endpoint': {
                    type: 'combo',
                    value: mockService.endpoint || ''
                },
                'Service port*': {
                    type: 'input',
                    value: mockService.port
                },
                'Service context*': {
                    type: 'input',
                    value: mockService.context
                }
            }
        });
    }

    private async fillMockServiceForm(mockServiceForm: Form, mockService: MockServiceData, frame: string) {
        await this.fillMockServiceBasicForm(mockServiceForm, mockService);
        for (const resource of mockService.resources || []) {
            const resourceParamManager = await mockServiceForm.getParamManagerWithNewCreateForm('MockServiceResources', frame);
            const resourceForm = await resourceParamManager.getAddNewForm();
            await this.fillMockServiceResourceForm(resourceForm, resource);
            for (const header of resource.expectedRequest.headers ?? []) {
                const requestHeaderParamManager = await resourceForm.getDefaultParamManager('Request', 'Add Header');
                const requestHeaderForm = await requestHeaderParamManager.getAddNewForm();
                await this.fillResourceHeaderForm(requestHeaderForm, header);
                await requestHeaderForm.submit('Save');
            }   
            for (const header of resource.expectedResponse.headers ?? []) {
                const responseHeaderParamManager = await resourceForm.getDefaultParamManager('Response', 'Add Header');
                const responseHeaderForm = await responseHeaderParamManager.getAddNewForm();
                await this.fillResourceHeaderForm(responseHeaderForm, header);
                await responseHeaderForm.submit('Save');
            }
            await resourceForm.submit('Submit');
        }
    }

    public async fillMockServiceResourceForm(form: Form, resource: MockServiceResourceData) {
        await form.fill({
            values: {
                'Service Sub Context*': {
                    type: 'input',
                    value: resource.serviceSubContext
                },
                'Service Method': {
                    type: 'dropdown',
                    value: resource.serviceMethod
                },
                'Expected Request Payload ': {
                    type: 'textarea',
                    value: resource.expectedRequest.payload
                },
                'Response Status Code': {
                    type: 'dropdown',
                    value: resource.expectedResponse.statusCode
                },
                'Expected Response Payload ': {
                    type: 'textarea',
                    value: resource.expectedResponse.payload
                }
            }
        });
    }

    private async fillResourceHeaderForm(form: Form, header: HeaderData) {
        await form.fill({
            values: {
                'Header Name*': {
                    type: 'input',
                    value: header.name
                },
                'Header Value*': {
                    type: 'input',
                    value: header.value
                }
            }
        });
    }

    private async addMockServices(parentForm: Form, mockServices: string | MockServiceData[]) {
        const frame = 'Test Suite Form';
        for (const mockService of mockServices) {
            const mockServicesParamManager = await parentForm.getParamManagerWithNewCreateForm('MockServices', frame);
            const form = await mockServicesParamManager.getAddNewForm();
            if (typeof mockService === 'string') {
                await form.fill({
                    values: {
                        'Select Mock Service': {
                            type: 'combo',
                            value: mockService
                        }
                    }
                });
                await form.submit('Add');
            } else {
                await form.clickAddNewForField('Select Mock Service');
                const mockServiceForm = new Form(this._page, frame);
                await mockServiceForm.switchToFormView();
                await this.fillMockServiceForm(mockServiceForm, mockService, frame);
                await mockServiceForm.submit('Create');
            }
        }
    }

    public async fillUnitTestBasicForm(form: Form, data: UnitTestData) {
        await form.fill({
            values: {
                'Name*': {
                    type: 'input',
                    value: data.name
                },
                'Artifact type*': {
                    type: 'dropdown',
                    value: data.artifactType
                },
                'Artifact*': {
                    type: 'dropdown',
                    value: data.artifact
                }
            }
        });
    }

    public async createUnitTest(data: UnitTestData) {
        const form = await this.getUniTestForm();
        await this.fillUnitTestBasicForm(form, data);

        if (data.supportiveArtifacts) {
            await this.addSupportiveArtifacts(form, data.supportiveArtifacts);
        }
        if (data.registryResources) {
            await this.addRegistryResources(form, data.registryResources);
        }
        if (data.testCases) {
            await this.addTestCases(form, data.testCases);
        }
        if (data.mockServices) {
            await this.addMockServices(form, data.mockServices);
        }

        await form.submit('Create');
    }

    public async addTestCaseFromSidePanel(unitTestName: string, testCase: TestCaseData) {
        await this.openAddTestCaseViewOfUnitTest(unitTestName);
        const form = await this.getTestCaseForm();
        await this.fillTestCaseForm(form, testCase);
        await form.submit('Create');
    }

    private async openAddTestCaseViewOfUnitTest(name: string) {
        const testExplorer = new ProjectExplorer(this._page, 'Test Explorer');
        await testExplorer.init();
        await testExplorer.findItem([`${this.projectName} (Not yet run)`, `${name} (Not yet run)`], true);
        await this._page.getByRole('button', { name: 'Add test case' }).click();
    }

    private async openEditViewOfUnitTest(name: string) {
        const testExplorer = new ProjectExplorer(this._page, 'Test Explorer');
        await testExplorer.init();
        await testExplorer.findItem([`${this.projectName} (Not yet run)`, `${name} (Not yet run)`]);
        await this._page.getByText(name, { exact: true }).click();
        await this._page.getByRole('button', { name: 'Edit test suite' }).click();
    }

    private async openEditViewOfMockService(name: string) {
        const mockServiceExplorer = new ProjectExplorer(this._page, 'Mock Services'); 
        await mockServiceExplorer.init();
        await mockServiceExplorer.findItem([this.projectName + ' ', name + ' '], true);
        await this._page.getByRole('button', { name: 'Edit mock service' }).click();
    }

    public async addMockServiceFromSidePanel(data: MockServiceData) {
        const mockServiceExplorer = new ProjectExplorer(this._page, 'Mock Services'); 
        await mockServiceExplorer.init();
        await mockServiceExplorer.findItem([this.projectName + ' '], true);
        await this._page.getByLabel('Add mock service').click();
        const form = await this.getMockServiceForm();
        await this.fillMockServiceForm(form, data, 'Mock Service');
        await form.submit('Create');
    }

    public async getEditUnitTestForm(unitTestName: string): Promise<Form> {
        await this.openEditViewOfUnitTest(unitTestName);
        return this.getUniTestForm();
    }

    public async getEditMockServiceForm(mockServiceName: string): Promise<Form> {
        await this.openEditViewOfMockService(mockServiceName);
        return this.getMockServiceForm();
    }
}
