import { Attributes, ComponentChildren, h, Ref } from 'preact';
import { Meta } from '@storybook/react';
import { Json } from './json';
import { NotebookCellResult } from '../types';

export default {
    component: Json,
    title: 'Components/Json',
} as Meta;

const Template = (args: JSX.IntrinsicAttributes & { notebookCellOutput: Readonly<NotebookCellResult>; } 
    & Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<any>; }>) => <Json {...args} />;

export const SimpleJson1 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `{"username":"Jake","salary":100,"fullname":{"firstname":"jake","lastname":"Peralta"}}`,
                mimeType: 'json',
                type: 'json'
            }
        }
    },
};

export const SimpleJson2 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[
                    {"username":"John","salary":100},
                    {"username":"Adam","salary":300},
                    {"username":"Jake","salary":100}
                ]`,
                mimeType: 'table',
                type: 'table'
            }
        }
    },
};

export const SimpleJson3 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: `[
                    {"username":"John","salary":100,"fullname":{"firstname":"John","lastname":"Doe"}},
                    {"username":"Adam","salary":300,"fullname":{"firstname":"Adam","lastname":"Smith"}},
                    {"username":"Jake","salary":100,"fullname":{"firstname":"jake","lastname":"Peralta"}}
                ]`,
                mimeType: 'json',
                type: 'json'
            }
        }
    },
};

export const SimpleJson4 = {
    args: {
        notebookCellOutput:{
            shellValue: {
                value: JSON.stringify({
                    "author":{
                        "login":"Shan1024",
                        "resourcePath":"/Shan1024",
                        "url":"https://github.com/Shan1024",
                        "avatarUrl":"https://avatars.githubusercontent.com/u/4003115?u=ec7c7f4b4a7c52d2897b4967e169ae5c7a43a52a&v=4"
                    },
                    "body":"**Description:** We cannot pass defaultable params and rest params when invoking function pointers. ```ballerina function test() returns int { function (int, int, int...) returns int pow = calculatePow; // Syntax error. return pow(10, j = 20, 30); // Semantic error. } function calculatePow(int i, int j = 1, int... k) returns int { return i * j * k[0]; } ```",
                    "bodyHTML":"<p dir=\"auto\"><strong>Description:</strong></p> <p dir=\"auto\">We cannot pass defaultable params and rest params when invoking function pointers.</p> <div class=\"highlight highlight-source-ballerina position-relative overflow-auto\" data-snippet-clipboard-copy-content=\"function test() returns int { function (int, int, int...) returns int pow = calculatePow; // Syntax error. return pow(10, j = 20, 30); // Semantic error. } function calculatePow(int i, int j = 1, int... k) returns int { return i * j * k[0]; }\"><pre><span class=\"pl-k\">function</span> test() <span class=\"pl-k\">returns</span> <span class=\"pl-c1\">int</span> { <span class=\"pl-k\">function</span> (<span class=\"pl-c1\">int</span>, <span class=\"pl-c1\">int</span>, <span class=\"pl-c1\">int</span><span class=\"pl-k\">...</span>) <span class=\"pl-k\">returns</span> <span class=\"pl-c1\">int</span> <span class=\"pl-smi\">pow</span> <span class=\"pl-k\">=</span> calculatePow; <span class=\"pl-c\">// Syntax error.</span> <span class=\"pl-k\">return</span> <span class=\"pl-en\">pow</span>(<span class=\"pl-c1\">10</span>, <span class=\"pl-v\">j</span> <span class=\"pl-k\">=</span> <span class=\"pl-c1\">20</span>, <span class=\"pl-c1\">30</span>); <span class=\"pl-c\">// Semantic error.</span> } <span class=\"pl-k\">function</span> calculatePow(<span class=\"pl-c1\">int</span> <span class=\"pl-v\">i</span>, <span class=\"pl-c1\">int</span> <span class=\"pl-v\">j</span> <span class=\"pl-k\">=</span> <span class=\"pl-c1\">1</span>, <span class=\"pl-k\">*</span> <span class=\"pl-smi\">k</span>[<span class=\"pl-c1\">0</span>]; }</pre></div>",
                    "bodyResourcePath":"/ballerina-platform/ballerina-lang/issues/10639#issue-365591912",
                    "bodyText":"Description: We cannot pass defaultable params and rest params when invoking function pointers. function test() returns int { function (int, int, int...) returns int pow = calculatePow; // Syntax error. return pow(10, j = 20, 30); // Semantic error. } function calculatePow(int i, int j = 1, int... k) returns int { return i * j * k[0]; }",
                    "bodyUrl":"https://github.com/ballerina-platform/ballerina-lang/issues/10639#issue-365591912",
                    "closed":false,
                    "closedAt":null,
                    "createdAt":"2018-10-01T18:44:43Z",
                    "createdViaEmail":false,
                    "databaseId":365591912,
                    "editor":null,
                    "id":"MDU6SXNzdWUzNjU1OTE5MTI=",
                    "isPinned":false,
                    "isReadByViewer":true,
                    "lastEditedAt":null,
                    "locked":false,
                    "number":10639,
                    "publishedAt":"2018-10-01T18:44:43Z",
                    "resourcePath":"/ballerina-platform/ballerina-lang/issues/10639",
                    "state":"OPEN",
                    "title":"Function pointers does not support defaultable parameters",
                    "updatedAt":"2022-03-09T10:13:08Z",
                    "url":"https://github.com/ballerina-platform/ballerina-lang/issues/10639",
                    "viewerDidAuthor":false
                }),
                mimeType: 'json',
                type: 'json'
            }
        }
    },
};