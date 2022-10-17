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
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { SuggestionsPane } from "../../utils/components/statement-editor/suggestions-pane";

const BAL_FILE_PATH = "default/empty-file.bal";
const EXISTING_RECORD_FILE_PATH = "module-level/record.bal";

describe('Record', () => {

    it('Add Record', () => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .clickCreateNew();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent("Record")
        InputEditor.typeInput("Person");
        EditorPane.clickPlusButton();
        EditorPane.doubleClickStatementContent("<add-type>");
        InputEditor.typeInput("string");
        EditorPane.doubleClickStatementContent("<add-field-name>");
        InputEditor.typeInput("name");
        EditorPane.clickPlusButton();
        EditorPane.clickStatementContent("<add-type>");
        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('record{Es Ex;}');
        EditorPane.doubleClickStatementContent("<add-field-name>");
        InputEditor.typeInput("address");
        EditorPane.doubleClickStatementContent("<add-type>");
        InputEditor.typeInput("string");
        EditorPane.doubleClickStatementContent("<add-binding-pattern>");
        InputEditor.typeInput("city");
        EditorPane.clickPlusRecordFieldPlus("city");
        EditorPane.doubleClickStatementContent("<add-type>");
        InputEditor.typeInput("int");
        EditorPane.doubleClickStatementContent("<add-field-name>");
        InputEditor.typeInput("id");
        RecordForm
            .shouldBeVisible()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "record-form.expected.bal");
    });

    it('Edit Record', () => {
        cy.visit(getIntegrationTestPageURL(EXISTING_RECORD_FILE_PATH));
        Canvas
            .getRecord('Person')
            .clickEdit();

        RecordForm
            .shouldBeVisible();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent("Person");
        InputEditor.typeInput("Individual");

        EditorPane.clickPlusRecordFieldPlus("name");
        EditorPane.doubleClickStatementContent("<add-type>");
        InputEditor.typeInput("int");
        EditorPane.doubleClickStatementContent("<add-field-name>");
        InputEditor.typeInput("age");

        EditorPane.doubleClickStatementContent("name");
        InputEditor.typeInput("firstName");

        RecordForm
            .shouldBeVisible()
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "record-form-edited.expected.bal");
    });

    it('Delete Record', () => {
        cy.visit(getIntegrationTestPageURL(EXISTING_RECORD_FILE_PATH));
        Canvas
            .getRecord('Person')
            .clickDelete();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-record.expected.bal");
    });

    it('Open and Cancel Form', () => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .clickCreateNew()
            .cancel();
    });

    it('Add from JSON', () => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .clickImportAJSON();

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .importFromJson(`
                {
                    "name": "",
                    "address": {
                        "city": "Colombo",
                        "id": 10
                    }
                }
            `);

        RecordForm
            .shouldBeVisible()
            .panelDone();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "record-form.expected.bal");
    });

    it('Add from JSON File Upload', () => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .clickImportAJSON();

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .importFromJsonFile()
            .importFromJsonSave();

        RecordForm
            .shouldBeVisible()
            .panelDone();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "record-form.expected.bal");
    });

    it('Add from JSON File Upload Panel Test', () => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Record');

        RecordForm
            .shouldBeVisible()
            .clickImportAJSON();

        RecordForm
            .shouldBeVisible()
            .typeRecordName('Person')
            .importFromJsonFile()
            .checkSeperateRecords()
            .importFromJsonSave();

        RecordForm
            .shouldBeVisible()
            .seperateRecordsVisible()
            .panelDone();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "record-form-seperate.expected.bal");
    });
});
