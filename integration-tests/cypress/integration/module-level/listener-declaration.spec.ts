/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { ListenerForm } from "../../utils/forms/listener-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Listener', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    });

    it('Add and Edit Listener', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Listener');

        ListenerForm
            .shouldBeVisible()
            .typeListenerName('testListener')
            .typeListenerPortValue(8081)
            .save();

        Canvas
            .getListener('testListener')
            .clickEdit();

        ListenerForm
            .clearPortValue()
            .typeListenerPortValue(8082)
            .clearListenername()
            .typeListenerName('testListener1')
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-listener.expected.bal");
    });

    it('Open and Cancel Form', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Listener');

        ListenerForm
            .shouldBeVisible()
            .cancel();
    });

    it('Open and Close Form', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Listener');

        ListenerForm
            .shouldBeVisible()
            .close();
    });
});
