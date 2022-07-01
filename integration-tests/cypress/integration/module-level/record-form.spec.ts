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
import { RecordForm } from "../../utils/forms/record-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Record', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    })

    it('Add and Edit Record', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .clickWhiteSpace()
            .haveRecordName("Person")
            .addNewField('string', 'firstName')
            .addNewField('string', 'lastName')
            //.addNewField('string', 'address', '"none"') // Need to fix this
            .addNewField('int', 'test')
            .save();

        Canvas
            .getRecord('Person')
            .clickEdit();

        RecordForm
            .editField('firstName', 'fname')
            .editField('lastName', 'lname')
            .deleteField('test')
            .save();


        Canvas
            .getRecord('Person')
            .clickEdit();

        // toggle public
        RecordForm
            .shouldBeVisible()
            .makePublicRecord()
            .save();

        Canvas
            .getRecord('Person')
            .clickEdit();

        // toggle closed
        RecordForm
            .shouldBeVisible()
            .toggleClosedRecord()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "record-form.expected.bal");
    });

    it('Add and Delete Record', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .clickWhiteSpace()
            .haveRecordName("Person")
            .addNewField('string', 'firstName')
            .addNewField('string', 'lastName')
            .addNewField('string', 'address', '"none"')
            .save();

        Canvas
            .getRecord('Person')
            .clickDelete();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-record.expected.bal");
    });

    it('Open and Cancel Form', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .cancel();
    });

    it('Open and Close Form', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .close();
    });


    it('Add from Json', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .clickWhiteSpace()
            .haveRecordName("Person")
            .importFromJson(`
                {
                    "firstName": "",
                    "lastName": ""
                }
            `)
            .save();
    });
});
