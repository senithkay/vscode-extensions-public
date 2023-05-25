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

import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { DataMapper } from "../../utils/forms/data-mapper";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const CONFIG_PANEL_BAL_FILES_DIR = "expectedBalFiles/config-panel";
const EXISTING_RECORDS_BAL_FILE = `${CONFIG_PANEL_BAL_FILES_DIR}/transform-from-existing-records.bal`;
const EXISTING_RECORDS_ARRAY_BAL_FILE = `${CONFIG_PANEL_BAL_FILES_DIR}/transform-from-existing-records-array-io.bal`;
const JSON_IMPORTS_BAL_FILE = `${CONFIG_PANEL_BAL_FILES_DIR}/transform-from-json-imports.bal`;
const JSON_IMPORTS_ARRAY_BAL_FILE = `${CONFIG_PANEL_BAL_FILES_DIR}/transform-from-json-imports-array-io.bal`;
const UPDATED_CONFIG_BAL_FILE = `${CONFIG_PANEL_BAL_FILES_DIR}/transform-from-updated-config.bal`;
const EMPTY_BAL_FILE_PATH = "default/empty-file.bal";
const BAL_FILE_WITH_RECORDS = "data-mapper/with-records.bal";
const BAL_FILE_WITH_BASIC_TRANSFORM = "data-mapper/with-basic-transform.bal";
const INPUT_JSON_FOR_RECORD = `{"st1":"string","items":{"st2":"string"}}`;
const OUTPUT_JSON_FOR_RECORD = `{"st1":"string"}`;

describe("Create new data mapper with new record from json imports", () => {
    before(() => cy.visit(getIntegrationTestPageURL(EMPTY_BAL_FILE_PATH)));

    it("Open Data mapper with plus button", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Data Mapper");
    });

    it("Add new input from json import (separate records)", () => {
        DataMapper.addNewInputRecord(INPUT_JSON_FOR_RECORD, "Input", true);
        DataMapper.editInputRecord(0);
        DataMapper.selectInputRecord("Input");
    });

    it("Add new output record from json import", () => DataMapper.addNewOutputRecord(OUTPUT_JSON_FOR_RECORD, "Output"));

    it("Save data mapper config", () => DataMapper.saveConfig());

    it("Canvas contains source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("mappingConstructor", "Output");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + JSON_IMPORTS_BAL_FILE);
    });
});

describe("Create new data mapper with array typed i/o from new record by json imports", () => {
    before(() => cy.visit(getIntegrationTestPageURL(EMPTY_BAL_FILE_PATH)));

    it("Open Data mapper with plus button", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Data Mapper");
    });

    it("Add new input from json import (separate records)", () => {
        DataMapper.addNewInputRecord(INPUT_JSON_FOR_RECORD, "Input", true);
        DataMapper.editInputRecord(0);
        DataMapper.selectInputRecord("Input", true);
    });

    it("Add new output record from json import", () => DataMapper.addNewOutputRecord(OUTPUT_JSON_FOR_RECORD, "Output"));

    it("Save data mapper config", () => DataMapper.saveConfig());

    it("Canvas contains source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode("mappingConstructor", "Output");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + JSON_IMPORTS_ARRAY_BAL_FILE);
    });
});

describe("Create new data mapper with existing record types", () => {
    before(() => cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_RECORDS)));

    it("Open Data mapper with plus button", () => {
        Canvas.clickTopLevelPlusButton(26);
        TopLevelPlusWidget.clickOption("Data Mapper");
    });

    it("Have a valid function name generated", () => DataMapper.checkFnName('transform2'));

    it("Add new input record from existing records", () => DataMapper.addExitingInputRecord("Input"));

    it("Add new input record from imported http package", () => DataMapper.addExitingInputRecord("CredentialsConfig"));

    it("Add new output record from existing records", () => {
        DataMapper.addExitingOutputRecord("Output");
        DataMapper.clickConfigUpdateBtn();
    });

    it("Save data mapper config", () => DataMapper.saveConfig());

    it("Canvas contains source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getSourceNode("credentialsConfig");
        DataMapper.getTargetNode("mappingConstructor", "Output");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + EXISTING_RECORDS_BAL_FILE);
    });
});

describe("Create new data mapper with array typed i/o from existing records", () => {
    before(() => cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_RECORDS)));

    it("Open Data mapper with plus button", () => {
        Canvas.clickTopLevelPlusButton(26);
        TopLevelPlusWidget.clickOption("Data Mapper");
    });

    it("Have a valid function name generated", () => DataMapper.checkFnName('transform2'));

    it("Add new input record from existing records", () => DataMapper.addExitingInputRecord("Input", true));

    it("Add new input record from imported http package", () => DataMapper.addExitingInputRecord("CredentialsConfig"));

    it("Add new output record from existing records", () => {
        DataMapper.addExitingOutputRecord("Output", true);
        DataMapper.clickConfigUpdateBtn();
    });

    it("Save data mapper config", () => DataMapper.saveConfig());

    it("Canvas contains source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getSourceNode("credentialsConfig");
        DataMapper.getTargetNode("listConstructor", "array");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + EXISTING_RECORDS_ARRAY_BAL_FILE);
    });
});

describe("Edit existing data mapper record types", () => {
    before(() => cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM)));

    it("Edit existing transform function", () => Canvas.getDataMapper("transform").clickEdit());

    it("Open configure menu", () => DataMapper.openConfigureMenu());

    it("Shows diagnostics for invalid function name", () => {
        DataMapper.clearFunctionName();
        DataMapper.containsInvalidFnName();
    });

    it("Update with a valid function name", () => {
        DataMapper.updateFunctionName("updatedFunctionName");
        DataMapper.containsValidFnName();
    });

    it("Update first input record", () => {
        DataMapper.editInputRecord(0);
        DataMapper.selectInputRecord("UpdatedInput");
    });

    it("Delete second input record", () => DataMapper.deleteInputRecord(1));

    it("Delete output record and select new output record", () => {
        DataMapper.deleteOutputRecord();
        DataMapper.addExitingOutputRecord("UpdatedOutput");
        DataMapper.clickConfigUpdateBtn();
    });

    it("Save data mapper config", () => {
        DataMapper.saveConfig();
        DataMapper.confirmSaveConfig();
    });

    it("Canvas contains the updated source and target nodes", () => {
        DataMapper.getSourceNode("updatedInput");
        DataMapper.getTargetNode("mappingConstructor", "UpdatedOutput");
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + UPDATED_CONFIG_BAL_FILE);
    });
});

describe("Edit data mapper with unsupported types", () => {
    before(() => cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM)));

    it("Edit existing unsupported transform function", () => Canvas.getDataMapper("unsupportedTransform").clickEdit());

    it("Show unsupported banners in config panel", () => {
        DataMapper.getForm().should('exist');
        DataMapper.disabledSaveButton();
        DataMapper.displayUnsupportedTypesBanner();
    });
});

describe("Edit data mapper with incomplete config", () => {
    before(() => cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_BASIC_TRANSFORM)));

    it("Edit existing transform function with incomplete config", () => Canvas.getDataMapper("incompleteTransform").clickEdit());

    it("Automatically show config panel with disabled save button", () => {
        DataMapper.getForm().should('exist');
        DataMapper.disabledSaveButton();
    });
});
