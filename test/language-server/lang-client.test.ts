'use strict';
/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import assert = require('assert');
import { expect } from 'chai';
import * as path from 'path';
import { ExtendedLangClient } from "../../src/core/extended-language-client";
import { getServerOptions } from "../../src/server/server";
import { getBallerinaCmd, getBBEPath } from "../test-util";
import { commands, Uri } from "vscode";

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..', 'test', 'data');

suite("Language Server Tests", function () {
    this.timeout(10000);
    let langClient: ExtendedLangClient;

    suiteSetup((done: MochaDone): any => {
        langClient = new ExtendedLangClient(
            'ballerina-vscode',
            'Ballerina LS Client',
            getServerOptions(getBallerinaCmd()),
            { documentSelector: [{ scheme: 'file', language: 'ballerina' }] },
            false
        );
        langClient.start();
        done();
    });


    test("Test Language Server Start", function (done): void {
        langClient.onReady().then(() => {
            done();
        }, () => {
            done(new Error("Language Server start failed"));
        }).catch((err) => {
            done(new Error("Language Server start failed"));
        });
    });

    test("Test getSyntaxTree", function (done): void {
        const uri = Uri.file(path.join(getBBEPath(), 'hello_world.bal').toString());
        commands.executeCommand('vscode.open', uri).then(() => {
            langClient.onReady().then(() => {
                langClient.getSyntaxTree(uri).then((response) => {
                    expect(response).to.contain.keys('syntaxTree', 'parseSuccess');
                    done();
                }, (reason) => {
                    done(reason);
                });
            });
        });
    });

    test("Test getBallerinaProject - Ballerina project", (done) => {
        const projectPath = path.join(PROJECT_ROOT, 'helloPackage');
        const uri = Uri.file(path.join(projectPath, 'main.bal').toString());
        commands.executeCommand('vscode.open', uri).then(() => {
            langClient.onReady().then(() => {
                const projectPath = path.join(PROJECT_ROOT, 'helloPackage');
                const documentIdentifier = {
                    documentIdentifier: {
                        uri: uri.toString()
                    }
                };
                langClient.getBallerinaProject(documentIdentifier).then((response) => {
                    assert.equal(response.packageName, 'helloproject', "Invalid package name.");
                    assert.equal(response.path, projectPath, 'Invalid project path');
                    assert.equal(response.kind, 'BUILD_PROJECT', 'Invalid project kind.');
                    done();
                }, (reason) => {
                    done(reason);
                });
            });
        });
    });

    test("Test getBallerinaProject - Single file", (done) => {
        const uri = Uri.file(path.join(PROJECT_ROOT, 'hello_world.bal'));
        commands.executeCommand('vscode.open', uri).then(() => {
            langClient.onReady().then(() => {
                const documentIdentifier = {
                    documentIdentifier: {
                        uri: uri.toString()
                    }
                };
                langClient.getBallerinaProject(documentIdentifier).then((response) => {
                    assert.equal(response.kind, 'SINGLE_FILE_PROJECT', 'Invalid project kind.');
                    done();
                }, (reason) => {
                    done(reason);
                });
            });
        });
    });

    test("Test fetchExamples", (done) => {
        langClient.onReady().then(() => {
            langClient.fetchExamples().then((response) => {
                assert.notEqual(response.samples.length, 0, 'No samples listed');
                done();
            }, (reason) => {
                done(reason);
            });
        });
    });

    test("Test Folding Range - Ballerina project", (done) => {
        const uri = Uri.file(path.join(PROJECT_ROOT, 'helloPackage', 'modules', 'hello', 'hello_service.bal').toString());
        commands.executeCommand('vscode.open', uri).then(() => {
            langClient.onReady().then(() => {
                const foldingRangeParam = {
                    textDocument: {
                        uri: uri.toString()
                    }
                };
                langClient.sendRequest('textDocument/foldingRange', foldingRangeParam).then((response: any) => {
                    assert.equal(response.length, 4, 'Invalid folding start position.');
                    assert.equal(response[0].startLine, 4, 'Invalid folding start position - 4.');
                    assert.equal(response[0].endLine, 12, 'Invalid folding end position - 12.');
                    assert.equal(response[1].startLine, 8, 'Invalid folding start position - 8.');
                    assert.equal(response[1].endLine, 11, 'Invalid folding end position - 11.');
                    assert.equal(response[2].startLine, 15, 'Invalid folding start position - 15.');
                    assert.equal(response[2].endLine, 17, 'Invalid folding end position - 17.');
                    assert.equal(response[3].startLine, 0, 'Invalid folding start position - 0.');
                    assert.equal(response[3].endLine, 1, 'Invalid folding end position - 1.');
                    done();
                });
            });
        });
    });

    test("Test Folding Range - Single file", (done) => {
        const uri = Uri.file(path.join(PROJECT_ROOT, 'hello_world.bal').toString());
        commands.executeCommand('vscode.open', uri).then(() => {
            langClient.onReady().then(() => {
                const foldingRangeParam = {
                    textDocument: {
                        uri: uri.toString()
                    }
                };
                langClient.sendRequest('textDocument/foldingRange', foldingRangeParam).then((response: any) => {
                    assert.equal(response[0].startLine, 3, 'Invalid folding start position - 3.');
                    assert.equal(response[0].endLine, 4, 'Invalid folding end position - 4.');
                    assert.equal(response[0].kind, 'region', 'Invalid folding kind.');
                    assert.equal(response[1].startLine, 7, 'Invalid folding start position - 7.');
                    assert.equal(response[1].endLine, 9, 'Invalid folding end position - 9.');
                    assert.equal(response[1].kind, 'comment', 'Invalid folding kind.');
                    done();
                });
            });
        });
    });

    test("Test Goto Defition - Ballerina project", (done) => {
        const uri = Uri.file(path.join(PROJECT_ROOT, 'helloPackage', 'main.bal'));
        langClient.onReady().then(() => {
            const definitionParam = {
                textDocument: {
                    uri: uri.toString()
                }, position: {
                    line: 5,
                    character: 33
                }
            };
            langClient.sendRequest('textDocument/definition', definitionParam).then((response: any) => {
                const gotoDefFilePath = Uri.file(path.join(PROJECT_ROOT, 'helloPackage', 'modules', 'hello',
                    'hello_service.bal').toString());
                assert.equal(response[0].uri, gotoDefFilePath, 'Invalid goto definitopn file uri.');
                assert.equal(response[0].range.start.line, 15, 'Invalid goto def start line.');
                assert.equal(response[0].range.start.character, 16, 'Invalid goto def start character.');
                assert.equal(response[0].range.end.line, 15, 'Invalid goto def end line.');
                assert.equal(response[0].range.end.character, 26, 'Invalid goto def start character.');
                done();
            });
        });
    });

    test("Test Goto Defition - Single file", (done) => {
        const uri = Uri.file(path.join(PROJECT_ROOT, 'hello_world.bal'));
        langClient.onReady().then(() => {
            const definitionParam = {
                textDocument: {
                    uri: uri.toString()
                }, position: {
                    line: 4,
                    character: 20
                }
            };
            langClient.sendRequest('textDocument/definition', definitionParam).then((response: any) => {
                assert.equal(response[0].uri, uri, 'Invalid goto definitopn file uri.');
                assert.equal(response[0].range.start.line, 10, 'Invalid goto def start line.');
                assert.equal(response[0].range.start.character, 16, 'Invalid goto def start character.');
                assert.equal(response[0].range.end.line, 10, 'Invalid goto def end line.');
                assert.equal(response[0].range.end.character, 26, 'Invalid goto def start character.');
                done();
            });
        });
    });

    test("Test Hover - Ballerina project", (done) => {
        langClient.onReady().then(() => {
            const hoverParam = {
                textDocument: {
                    uri: Uri.file(path.join(PROJECT_ROOT, 'helloPackage', 'main.bal')).toString()
                },
                position: {
                    line: 6,
                    character: 10
                }
            };
            langClient.sendRequest('textDocument/hover', hoverParam).then((response: any) => {
                assert.equal(response.contents.kind, 'markdown', 'Invalid content kind.');
                assert.equal(response.contents.value.includes('Prints'), true, 'Invalid hover value.');
                done();
            });
        });
    });

    test("Test Hover - Single file", (done) => {
        langClient.onReady().then(() => {
            const hoverParam = {
                textDocument: {
                    uri: Uri.file(path.join(PROJECT_ROOT, 'hello_world.bal')).toString()
                },
                position: {
                    line: 10,
                    character: 20
                }
            };
            langClient.sendRequest('textDocument/hover', hoverParam).then((response: any) => {
                assert.equal(response.contents.kind, 'markdown', 'Invalid content kind.');
                assert.equal(response.contents.value.includes('Returns a message'), true, 'Invalid hover value.');
                done();
            });
        });
    });

    test("Test Code Action - Ballerina project", (done) => {
        langClient.onReady().then(() => {
            const actionParam = {
                textDocument: {
                    uri: Uri.file(path.join(PROJECT_ROOT, 'helloPackage', 'main.bal')).toString()
                },
                range: {
                    start: {
                        line: 4,
                        character: 10
                    },
                    end: {
                        line: 4,
                        character: 11
                    }
                },
                context: {
                    diagnostics: []
                }
            };
            langClient.sendRequest('textDocument/codeAction', actionParam).then((response: any) => {
                assert.equal(response.length, 2, 'Invalid number of code actions.');
                assert.equal(response[0].command.command, 'ADD_DOC', 'Invalid \'Document this\' command.');
                assert.equal(response[1].command.command, 'ADD_ALL_DOC', 'Invalid \'Document all\' command.');
                done();
            });
        });
    });

    test("Test Code Action - Single file", (done) => {
        langClient.onReady().then(() => {
            const actionParam = {
                textDocument: {
                    uri: Uri.file(path.join(PROJECT_ROOT, 'hello_world.bal')).toString()
                },
                range: {
                    start: {
                        line: 10,
                        character: 20
                    },
                    end: {
                        line: 10,
                        character: 22
                    }
                },
                context: {
                    diagnostics: []
                }
            };
            langClient.sendRequest('textDocument/codeAction', actionParam).then((response: any) => {
                assert.equal(response.length, 2, 'Invalid number of code actions.');
                assert.equal(response[0].command.command, 'ADD_DOC', 'Invalid \'Document this\' command.');
                assert.equal(response[1].command.command, 'ADD_ALL_DOC', 'Invalid \'Document all\' command.');
                done();
            });
        });
    });

    test("Test Language Server Stop", (done) => {
        langClient.stop().then(() => {
            done();
        }, () => {
            done(new Error("Language Server stop failed"));
        });
    });
});

