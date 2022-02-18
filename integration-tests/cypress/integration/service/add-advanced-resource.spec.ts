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
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL("service/add-service-to-empty-file.bal"))
    })

    it('Add a resource with advanced config', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Service");
        ServiceForm
            .selectServiceType("HTTP")
            .typeServicePath("/wso2")
            .clickDefineListenerline()
            .typeListenerPort(8080)
            .save();
        Canvas.clickTopLevelPlusButton(5);
        TopLevelPlusWidget.clickOption("Resource");
        ResourceForm
            .selectMethod("GET")
            .selectAdvancedConfig()
            .clickPathSegments()
            .addPathParam("path1")
            .clickPathSegments()
            .addPathParam("path2")
            .clickQueryParams()
            .addQueryParam("query")
            .togglePayload()
            .typePayloadType("string")
            .clickRequestCheckBox()
            .clickCallerCheckBox()
            .save()

        Canvas.getService("/wso2")
            .shouldHaveResources(2)

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-advanced-resource.expected.bal");
    })

})
