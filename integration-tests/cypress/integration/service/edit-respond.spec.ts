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
import { ResourceForm } from "../../utils/forms/resource-form"
import { ResponseForm } from "../../utils/forms/response-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL("service/add-service-to-empty-file.bal"))
    })

    it('Add a resource with advanced config', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Service");
        ServiceForm
            .selectServiceType("HTTP")
            .typeServicePath("/getData")
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
            .togglePayload()
            .typePayloadType("string")
            .clickRequestCheckBox()
            .clickCallerCheckBox()
            .save()

        Canvas.getService("/getData")
            .shouldHaveResources(2)
      
        Canvas.getService("/getData")
            .getResourceFunction("GET","path1")
            .expand()
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .getBlockLevelPlusWidget()
            .clickOption("Respond")
      
        ResponseForm
            .shouldBeVisible()
            .typeExpression('"Success"')
            .typeStatusCode(400)
            .save()

        Canvas.getService("/getData")
            .getResourceFunction("GET","path1")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickExistingRespondStatement()

        ResponseForm
            .shouldBeVisible()
            .clearExpression()
            .typeExpression('"Updated success"')
            .save()
        
        
        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-respond.expected.bal");
    })

})
