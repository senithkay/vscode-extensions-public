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
import { HttpForm } from "../../../utils/forms/connectors/http-form"
import { LogForm } from "../../../utils/forms/log-form"
import { ResourceForm } from "../../../utils/forms/resource-form"
import { ServiceForm } from "../../../utils/forms/service-form"
import { VariableFormBlockLevel } from "../../../utils/forms/variable-form-block-level"
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils"

const BAL_FILE_PATH = "service/edit-existing-resource-file.bal";

describe('edit a http advanced resource', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Edit service and add statements', () => {
        Canvas.getService("/wso2")
            .getResourceFunction("POST", "path1/path2")
            .editDiagram();

        ResourceForm
            .shouldBeVisible()
            .typePathName("path2")
            .removeParameter("http:Caller", "caller")
            .waitForAddBtn("Add Caller")
            .removeParameter("http:Request", "request")
            .waitForAddBtn("Add Request")
            .addHeaderParam("header")
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-advanced-resource.expected.bal");
    })
})
