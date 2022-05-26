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
                    "stringAttribute":"**Description:** ``` function test() returns int {  returns 10; } ```",
                    "HTMLAttribute":"<p dir=\"auto\"><strong>Description:</strong></p> <p dir=\"auto\">Some description</p> <div class=\"highlight overflow-auto\"></div>",
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
