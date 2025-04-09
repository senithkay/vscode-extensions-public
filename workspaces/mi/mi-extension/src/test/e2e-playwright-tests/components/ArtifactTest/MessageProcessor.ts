/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";
import { ProjectExplorer } from "../ProjectExplorer";
import { AddArtifact } from "../AddArtifact";
import { Overview } from "../Overview";
import { Form, ParamManagerValues } from "../Form";
import { page } from "../../Utils";

export class MessageProcessor {

    constructor(private _page: Page) {
    }

    public async init() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");

        const overviewPage = new Overview(this._page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();

        const addArtifactPage = new AddArtifact(this._page);
        await addArtifactPage.init();
        await addArtifactPage.add('Message Processor');
    }

    public async createMessageProcessorFromProjectExplorer() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(['Project testProject', 'Message Processors'], true);
        await this._page.getByLabel('Add Message Processor').click();
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        await mpWebView.getByText('Custom Message Processor', { exact: true }).click();

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestMessageProcessor',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Message Processor Provider Class FQN*': {
                    type: 'input',
                    value: 'ProviderClass',
                }
            }
        });
        await messageProcessorForm.submit();

        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async createMessageSamplingProcessor() {
        await this.init();
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        await mpWebView.getByText('Message Sampling Processor').click();

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestSampleMessageProcessor',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 * * FRI',
                },
                'Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Sampling Interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Sampling Concurrency': {
                    type: 'input',
                    value: '10',
                },
                'Yes': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        const paramValues: ParamManagerValues = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3"
        };
        await messageProcessorForm.fillParamManager(paramValues);
        await messageProcessorForm.submit();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async editMessageSamplingProcessor() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(["Project testProject", 'Other Artifacts', 'Message Processors', 'TestSampleMessageProcessor'], true);

        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestSampleMessageProcessorEdited',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file-edited.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 0 * FRI',
                },
                'Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Sampling Interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Sampling Concurrency': {
                    type: 'input',
                    value: '100',
                },
                'No': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        await messageProcessorForm.submit("Save Changes");
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async createScheduledMessageForwardingProcessor() {
        await this.init();
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        await mpWebView.getByText('Scheduled Message Forwarding Processor').click();

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestScheduledMessageForwardingProcessor',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                    additionalProps: { nthValue: 0 }
                },
                'Deactivate': {
                    type: 'radio',
                    value: 'checked',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 * * FRI',
                },
                'Forwarding Interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Retry Interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Maximum redelivery attempts': {
                    type: 'input',
                    value: '100',
                },
                'Maximum store connection attempts': {
                    type: 'input',
                    value: '100',
                },
                'Store connection attempt interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Disabled': {
                    type: 'radio',
                    value: 'checked',
                },
                'Fault Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Deactivate Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Task Count (Cluster Mode)': {
                    type: 'input',
                    value: '100',
                },
                'Non retry http status codes': {
                    type: 'input',
                    value: '404',
                },
                'Axis2 Client Repository': {
                    type: 'input',
                    value: 'axis2Repo',
                },
                'Axis2 Configuration': {
                    type: 'input',
                    value: 'axis2Config',
                },
                'Endpoint Name': {
                    type: 'combo',
                    value: 'httpEndpoint',
                },
                'Reply Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Fail Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Yes': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        const paramValues: ParamManagerValues = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3"
        };
        await messageProcessorForm.fillParamManager(paramValues);
        await messageProcessorForm.submit();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async editScheduledMessageForwardingProcessor() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(["Project testProject", 'Other Artifacts', 'Message Processors', 'TestScheduledMessageForwardingProcessor'], true);

        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestScheduledMessageForwardingProcessorEdited',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                    additionalProps: { nthValue: 0 }
                },
                'Deactivate': {
                    type: 'radio',
                    value: 'checked',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file-edited.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 0 * FRI',
                },
                'Forwarding Interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Retry Interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Maximum redelivery attempts': {
                    type: 'input',
                    value: '10',
                },
                'Maximum store connection attempts': {
                    type: 'input',
                    value: '10',
                },
                'Store connection attempt interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Disabled': {
                    type: 'radio',
                    value: 'checked',
                },
                'Fault Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Deactivate Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Task Count (Cluster Mode)': {
                    type: 'input',
                    value: '10',
                },
                'Non retry http status codes': {
                    type: 'input',
                    value: '405',
                },
                'Axis2 Client Repository': {
                    type: 'input',
                    value: 'axis2RepoEdited',
                },
                'Axis2 Configuration': {
                    type: 'input',
                    value: 'axis2ConfigEdited',
                },
                'Endpoint Name': {
                    type: 'combo',
                    value: 'httpEndpoint',
                },
                'Reply Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Fail Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'No': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        await messageProcessorForm.submit("Save Changes");
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async createScheduledFailoverMessageForwardingProcessor() {
        await this.init();
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        await mpWebView.getByText('Scheduled Failover Message Forwarding Processor').click();

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestScheduledFailoverMessageForwardingProcessor',
                },
                'Source Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Target Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Deactivate': {
                    type: 'radio',
                    value: 'checked',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 * * FRI',
                },
                'Forwarding Interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Retry Interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Maximum redelivery attempts': {
                    type: 'input',
                    value: '100',
                },
                'Maximum store connection attempts': {
                    type: 'input',
                    value: '100',
                },
                'Store connection attempt interval (Millis)': {
                    type: 'input',
                    value: '100',
                },
                'Disabled': {
                    type: 'radio',
                    value: 'checked',
                },
                'Fault Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Deactivate Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Task Count (Cluster Mode)': {
                    type: 'input',
                    value: '100',
                },
                'Yes': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        const paramValues: ParamManagerValues = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3"
        };
        await messageProcessorForm.fillParamManager(paramValues);
        await messageProcessorForm.submit();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async editScheduledFailoverMessageForwardingProcessor() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(["Project testProject", 'Other Artifacts', 'Message Processors', 'TestScheduledFailoverMessageForwardingProcessor'], true);

        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestScheduledFailoverMessageForwardingProcessorEdited',
                },
                'Source Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Target Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Deactivate': {
                    type: 'radio',
                    value: 'checked',
                },
                'Quartz configuration file path': {
                    type: 'input',
                    value: 'temp/test-file-edited.txt',
                },
                'Cron Expression': {
                    type: 'input',
                    value: '0 0 0 * FRI',
                },
                'Forwarding Interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Retry Interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Maximum redelivery attempts': {
                    type: 'input',
                    value: '10',
                },
                'Maximum store connection attempts': {
                    type: 'input',
                    value: '10',
                },
                'Store connection attempt interval (Millis)': {
                    type: 'input',
                    value: '1000',
                },
                'Disabled': {
                    type: 'radio',
                    value: 'checked',
                },
                'Fault Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Deactivate Sequence Name': {
                    type: 'combo',
                    value: 'newSeqEP',
                },
                'Task Count (Cluster Mode)': {
                    type: 'input',
                    value: '10',
                },
                'Yes': {
                    type: 'radio',
                    value: 'checked',
                }
            }
        });
        await messageProcessorForm.submit("Save Changes");
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async createCustomMessageProcessor() {
        await this.init();
        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }
        await mpWebView.getByText('Custom Message Processor', { exact: true }).click();

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestCustomMessageProcessor',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Message Processor Provider Class FQN*': {
                    type: 'input',
                    value: 'ProviderClass',
                }
            }
        });
        const paramValues: ParamManagerValues = {
            "param1": "value1",
            "param2": "value2",
            "param3": "value3"
        };
        await messageProcessorForm.fillParamManager(paramValues);
        await messageProcessorForm.submit();
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }

    public async editCustomMessageProcessor() {
        const projectExplorer = new ProjectExplorer(this._page);
        await projectExplorer.goToOverview("testProject");
        await projectExplorer.findItem(["Project testProject", 'Other Artifacts', 'Message Processors', 'TestCustomMessageProcessor'], true);

        const mpWebView = await switchToIFrame('Message Processor Form', this._page);
        if (!mpWebView) {
            throw new Error("Failed to switch to Message Processor Form iframe");
        }

        const messageProcessorForm = new Form(page.page, 'Message Processor Form');
        await messageProcessorForm.switchToFormView();
        await messageProcessorForm.fill({
            values: {
                'Message Processor Name*': {
                    type: 'input',
                    value: 'TestCustomMessageProcessorEdited',
                },
                'Message Store': {
                    type: 'combo',
                    value: 'newMsgStore',
                },
                'Message Processor Provider Class FQN*': {
                    type: 'input',
                    value: 'ProviderClassEdited',
                }
            }
        });
        const paramValues: ParamManagerValues = {
            "param4": "value1",
            "param5": "value2",
            "param6": "value3"
        };
        await messageProcessorForm.fillParamManager(paramValues);
        await messageProcessorForm.submit("Save Changes");
        const overview = await switchToIFrame('Project Overview', this._page);
        if (!overview) {
            throw new Error("Failed to switch to project overview iframe");
        }
    }
}
