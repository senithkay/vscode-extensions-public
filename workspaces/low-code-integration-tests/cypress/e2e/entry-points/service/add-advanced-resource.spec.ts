/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Canvas } from "../../../utils/components/canvas"
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget"
import { ResourceForm } from "../../../utils/forms/resource-form";
import { ServiceForm } from "../../../utils/forms/service-form"
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils"
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "service/add-service-to-empty-file.bal";

describe('add a http service to an empty file', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add a resource with advanced config', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption('Service');

        ServiceForm
            .typeServicePath('/hello')
            .typeListenerPort(8080)
            .save();

        Canvas
            .getService('/hello')
            .getResourceFunction('GET', '/')
            .deleteResource();

        Canvas.getService('/hello')
            .clickPlusIcon(4);

        ResourceForm
            .selectMethod('POST')
            .typePathName('test/[string user]')
            .typeReturnValue('error|int?')
            .addResourceParam('QUERY', 'string', 'test')
            .addPayload()
            .clickShowButton()
            .addHeaderParam("contentType")
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-advanced-resource.expected.bal");
    })

})
