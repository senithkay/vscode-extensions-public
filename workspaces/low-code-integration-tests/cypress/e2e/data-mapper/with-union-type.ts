/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { DataMapper } from "../../utils/forms/data-mapper";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_WITH_UNION_TYPES = "data-mapper/with-union-type.bal";

describe("Map to a record construct with union type output", () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_WITH_UNION_TYPES));
        Canvas.getDataMapper("transformUnionRecord").clickEdit();
    });

    it("Canvas contains the source and target nodes", () => {
        DataMapper.getSourceNode("input");
        DataMapper.getTargetNode('mappingConstructor');
    });

    it("Initialize output as outputType1", () => {
        DataMapper.targetNodeRootMenuClick('Reinitialize as OutputType1', 'mappingConstructor')
    });

    it("Create mapping to union field (string type) within union type", () => {
        DataMapper.createMappingUsingFields('input.str1', 'OutputType1.unionVal1', 'mappingConstructor');
        DataMapper.linkExists('input.str1', 'OutputType1.unionVal1', 'mappingConstructor');
        cy.wait(3000);
        DataMapper.deleteLink('input.str1', 'OutputType1.unionVal1', 'mappingConstructor');

        DataMapper.createMappingUsingFields('input.str1', 'OutputType1.unionVal1', 'mappingConstructor');
        DataMapper.linkExists('input.str1', 'OutputType1.unionVal1', 'mappingConstructor');
        cy.wait(3000);
        DataMapper.createMappingUsingFields('input.str2', 'OutputType1.unionVal1', 'mappingConstructor');
        DataMapper.linkExists('input.str2', 'OutputType1.unionVal1', 'mappingConstructor');
    });

    it("Create mapping to union field (record type) within union type", () => {
        DataMapper.targetNodeFieldMenuClick('OutputType1.unionVal2','Reinitialize as OutputType2', 'mappingConstructor')
        DataMapper.createMappingUsingFields('input.dec1', 'OutputType1.unionVal2.dec1', 'mappingConstructor');
        DataMapper.linkExists('input.dec1', 'OutputType1.unionVal2.dec1', 'mappingConstructor');
    });

    it("Generated source code is valid", () => {
        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "expectedBalFiles/transform-union-mapping-construct-target.bal");
    });
});
