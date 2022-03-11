/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { TriggerForm } from "../../utils/forms/trigger-form"
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "trigger/add-trigger-to-empty-file.bal";

describe('add a Github Trigger to an empty file', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  });

  it('Displays add construct message', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Trigger");
    TriggerForm
      .selectTriggerType("Github")
      .createBtnShouldNotBeClickable()
      .selectServiceType("IssuesService")
      .create();
    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-trigger.expected.bal");
  });

  it('Search and Add a trigger', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();

    TopLevelPlusWidget.clickOption("Trigger");
    TriggerForm
      .searchTrigger("slack")
      .waitForConnectorsLoading()
      .selectTriggerType("Slack")
      .createBtnShouldNotBeClickable()
      .selectServiceType("SlackEventsAppService")
      .create();
    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-trigger-slack.expected.bal");
  });

  it('Add two channels in trigger form', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();

    TopLevelPlusWidget.clickOption("Trigger");

    TriggerForm
      .searchTrigger("slack")
      .waitForConnectorsLoading()
      .selectTriggerType("Slack") //Need to fix this
      .createBtnShouldNotBeClickable()
      .selectServiceType("SlackEventsAppService")
      .addChannel("SlackEventsDndService")
      .create();
    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-multiple-channel.expected.bal");
  });

  it('Add and delete channel in trigger form', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Trigger");

    TriggerForm
      .selectTriggerType("Slack")
      .createBtnShouldNotBeClickable()
      .selectServiceType("SlackEventsAppService")
      .addChannel("SlackEventsDndService")
      .deleteChannel("SlackEventsDndService")
      .create();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-trigger-slack.expected.bal");
  });

  it('Add and cancel and select another trigger', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();

    TopLevelPlusWidget.clickOption("Trigger");

    TriggerForm
      .selectTriggerType("Slack")
      .createBtnShouldNotBeClickable()
      .selectServiceType("SlackEventsAppService")
      .cancel()
      .selectTriggerType("Github")
      .createBtnShouldNotBeClickable()
      .selectServiceType("IssuesService")
      .create();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-trigger.expected.bal");
  });
});
