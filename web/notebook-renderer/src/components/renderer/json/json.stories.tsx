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
                mimeType: 'ballerina-notebook/json-view',
                type: 'json'
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
                mimeType: 'ballerina-notebook/json-view',
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
                    "objectAttribute":{
                        "Attribute":"value",
                        "urlAttribute":"https://dummy.com/dummy"
                    },
                    "stringAttribute":"**Description:** We cannot pass defaultable params and rest params when invoking function pointers. ```ballerina function test() returns int { function (int, int, int...) returns int pow = calculatePow; // Syntax error. return pow(10, j = 20, 30); // Semantic error. } function calculatePow(int i, int j = 1, int... k) returns int { return i * j * k[0]; } ```",
                    "HTMLAttribute":"<p dir=\"auto\"><strong>Description:</strong></p> <p dir=\"auto\">Some description</p> <div class=\"highlight highlight-source-ballerina position-relative overflow-auto\" data-snippet-clipboard-copy-content=\"function test() returns int { function (int, int, int...) returns int pow = calculatePow; // Syntax error. return pow(10, j = 20, 30); // Semantic error. } function calculatePow(int i, int j = 1, int... k) returns int { return i * j * k[0]; }\"></div>",
                    "BoolAttribute":false,
                    "nullAttribute":null,
                    "intAttribute":365591912,
                }),
                mimeType: 'ballerina-notebook/json-view',
                type: 'json'
            }
        }
    },
};
