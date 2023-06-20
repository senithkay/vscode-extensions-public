/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Canvas } from "../../../utils/components/canvas"
import { SourceCode } from "../../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../../utils/file-utils"
import { TriggerForm } from "../../../utils/forms/trigger-form"
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils"

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
      .selectServiceType("AppService")
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
      .selectServiceType("AppService")
      .addChannel("DndService")
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
      .selectServiceType("AppService")
      .addChannel("DndService")
      .deleteChannel("DndService")
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
      .selectServiceType("AppService")
      .cancel()
      .selectTriggerType("Github")
      .createBtnShouldNotBeClickable()
      .selectServiceType("IssuesService")
      .create();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-trigger.expected.bal");
  });
});
