/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import assert = require('assert');
import { join } from 'path';
import { ExtendedLangClient } from "../../src/core/extended-language-client";
import { commands, Uri } from "vscode";
import { log } from '../../src/utils';

const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'grammar', 'ballerina-grammar', 'test', 'resources',
    'config');

const TEST_CONFIG = [['class.bal'], ['object.bal'], ['service.bal'], ['test.bal'], ['semtype', 'main.bal'],
['semtype', 'bmain.bal'], ['semtype', 'modules', 'b', 'bbuild.bal'], ['semtype', 'modules', 'b', 'bparse.bal'],
['semtype', 'modules', 'b', 'btoken.bal'], ['semtype', 'modules', 'b', 'tests', 'btokentest.bal'],
['semtype', 'modules', 'bdd', 'bdd.bal'], ['semtype', 'modules', 'bdd', 'tests', 'bddtest.bal'],
['semtype', 'modules', 'core', 'boolean.bal'], ['semtype', 'modules', 'core', 'common.bal'],
['semtype', 'modules', 'core', 'core.bal'], ['semtype', 'modules', 'core', 'error.bal'],
['semtype', 'modules', 'core', 'function.bal'], ['semtype', 'modules', 'core', 'int.bal'],
['semtype', 'modules', 'core', 'list.bal'], ['semtype', 'modules', 'core', 'mapping.bal'],
['semtype', 'modules', 'core', 'string.bal'], ['semtype', 'modules', 'json', 'parse.bal'],
['semtype', 'modules', 'json', 'schema.bal'], ['semtype', 'tests', 'baltest.bal'],
['semtype', 'tests', 'data', 'basic.bal'], ['semtype', 'tests', 'data', 'boolean-subtype.bal'],
['semtype', 'tests', 'data', 'error1.bal'], ['semtype', 'tests', 'data', 'error2.bal'],
['semtype', 'tests', 'data', 'function.bal'], ['semtype', 'tests', 'data', 'hard.bal'],
['semtype', 'tests', 'data', 'int-singleton.bal'], ['semtype', 'tests', 'data', 'int-subtype.bal'],
['semtype', 'tests', 'data', 'never.bal'], ['semtype', 'tests', 'data', 'readonly1.bal'],
['semtype', 'tests', 'data', 'readonly2.bal'], ['semtype', 'tests', 'data', 'string-singleton.bal'],
['semtype', 'tests', 'data', 'tuple1.bal']];

export async function runSemanticTokensTestCases(langClient: ExtendedLangClient) {
    let status: boolean = true;
    for (let i = 0; i < TEST_CONFIG.length; i++) {
        const element = TEST_CONFIG[i];
        let filePath = PROJECT_ROOT;
        element.forEach(path => {
            filePath = join(filePath, path);
        })

        const uri = Uri.file(filePath);
        await commands.executeCommand('vscode.open', uri).then(() => {
            const start = new Date();
            langClient.sendRequest("textDocument/semanticTokens/full", {
                textDocument: {
                    uri: uri.toString()
                }
            }).then((response: any) => {
                const result: boolean = response.data.length > 0;
                status = status ? result : false;
                assert.equal(result, true, `Semantic tokens API resulted in an incorrect response for ${filePath}`);
                const end = new Date();
                const diff = end.getTime() - start.getTime();
                log(`Time taken for ${filePath}: ${diff}`);
                assert.equal(diff < 5000, true, `Semantic token response took more than 5 seconds for ${filePath}.`)
            });
        });
    }
    return status;
}
