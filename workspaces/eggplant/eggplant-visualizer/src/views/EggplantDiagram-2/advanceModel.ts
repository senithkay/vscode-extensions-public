import { Flow } from "@wso2-enterprise/eggplant-core";


 enum ClientKind {
    HTTP,
    OTHER
}

 enum ClientScope {
    LOCAL,
    OBJECT,
    GLOBAL
}

export const sampleModel : Flow = {
    "name": "",
    "nodes": [
        {
            "kind": "EVENT_HTTP_API",
            "label": "HTTP API",
            "nodeProperties": {
                "method": {
                    "label": "Method",
                    "type": null,
                    "typeKind": "IDENTIFIER",
                    "optional": false,
                    "editable": true,
                    "documentation": "HTTP Method",
                    "value": "GET"
                },
                "path": {
                    "label": "Path",
                    "type": null,
                    "typeKind": "URI_PATH",
                    "optional": false,
                    "editable": true,
                    "documentation": "HTTP Path",
                    "value": "/search/doctors/[string name]"
                }
            },
            "returning": false,
            "fixed": true,
            "id": "1",
            "lineRange": {
                "fileName": "main.bal",
                "startLine": [
                    7,
                    7
                ],
                "endLine": [
                    15,
                    6
                ]
            },
            "flags": 0
        },
        {
            "kind": "IF",
            "label": "If",
            "nodeProperties": {
                "condition": {
                    "label": "Condition",
                    "type": "boolean",
                    "typeKind": "BTYPE",
                    "optional": false,
                    "editable": true,
                    "documentation": "Boolean Condition",
                    "value": "name == \"kandy\""
                }
            },
            "branches": [
                {
                    "kind": "BLOCK",
                    "label": "Then",
                    "children": [
                        {
                            "label": "HTTP GET",
                            "kind": "HTTP_API_GET_CALL",
                            "nodeProperties": {
                                "client": {
                                    "label": "Client",
                                    "type": "http:Client",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Client Connection",
                                    "value": "asiri"
                                },
                                "path": {
                                    "label": "Path",
                                    "type": "string",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Path",
                                    "value": "/doctors/kandy"
                                },
                                "targetType": {
                                    "label": "Target Type",
                                    "typeKind": "BTYPE",
                                    "type": "http:Response|anydata",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Response Type",
                                    "value": "json"
                                },
                                "variable": {
                                    "label": "Variable",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "Result Variable",
                                    "value": "j",
                                    "type": "json"
                                }
                            },
                            "returning": false,
                            "fixed": false,
                            "id": "3",
                            "lineRange": {
                                "fileName": "",
                                "startLine": [
                                    9,
                                    13
                                ],
                                "endLine": [
                                    9,
                                    57
                                ]
                            },
                            "flags": 0
                        },
                        {
                            "kind": "RETURN",
                            "label": "Return",
                            "nodeProperties": {
                                "expression": {
                                    "label": "Expression",
                                    "type": "json",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "Return value",
                                    "value": "j"
                                }
                            },
                            "returning": true,
                            "fixed": false,
                            "id": "5",
                            "lineRange": {
                                "fileName": "main.bal",
                                "startLine": [
                                    10,
                                    13
                                ],
                                "endLine": [
                                    10,
                                    22
                                ]
                            },
                            "flags": 0
                        }
                    ]
                },
                {
                    "kind": "BLOCK",
                    "label": "Else",
                    "children": [
                        {
                            "label": "HTTP GET",
                            "kind": "HTTP_API_GET_CALL",
                            "nodeProperties": {
                                "client": {
                                    "label": "Client",
                                    "type": "http:Client",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Client Connection",
                                    "value": "nawaloka"
                                },
                                "path": {
                                    "label": "Path",
                                    "type": "string",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Path",
                                    "value": "/doctors"
                                },
                                "targetType": {
                                    "label": "Target Type",
                                    "typeKind": "BTYPE",
                                    "type": "http:Response|anydata",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "HTTP Response Type",
                                    "value": "json"
                                },
                                "variable": {
                                    "label": "Variable",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "Result Variable",
                                    "value": "j",
                                    "type": "json"
                                }
                            },
                            "returning": false,
                            "fixed": false,
                            "id": "4",
                            "lineRange": {
                                "fileName": "",
                                "startLine": [
                                    12,
                                    13
                                ],
                                "endLine": [
                                    12,
                                    60
                                ]
                            },
                            "flags": 0
                        },
                        {
                            "kind": "RETURN",
                            "label": "Return",
                            "nodeProperties": {
                                "expression": {
                                    "label": "Expression",
                                    "type": "json",
                                    "typeKind": "BTYPE",
                                    "optional": false,
                                    "editable": true,
                                    "documentation": "Return value",
                                    "value": "j"
                                }
                            },
                            "returning": true,
                            "fixed": false,
                            "id": "6",
                            "lineRange": {
                                "fileName": "",
                                "startLine": [
                                    13,
                                    13
                                ],
                                "endLine": [
                                    13,
                                    22
                                ]
                            },
                            "flags": 0
                        }
                    ]
                }
            ],
            "returning": false,
            "fixed": false,
            "id": "2",
            "lineRange": {
                "fileName": "main.bal",
                "startLine": [
                    8,
                    9
                ],
                "endLine": [
                    14,
                    10
                ]
            },
            "flags": 0
        }
    ],
    "clients": [
        {
            "id": "cl1",
            "label": "HTTP Client",
            "kind": "HTTP",
            "lineRange": {
                "fileName": "main.bal",
                "startLine": [
                    2,
                    1
                ],
                "endLine": [
                    2,
                    63
                ]
            },
            "scope": "GLOBAL",
            "value": "asiri",
            "flags": 0
        },
        {
            "id": "cl2",
            "label": "HTTP Client",
            "kind": "HTTP",
            "lineRange": {
                "fileName": "main.bal",
                "startLine": [
                    3,
                    1
                ],
                "endLine": [
                    3,
                    66
                ]
            },
            "scope": "GLOBAL",
            "value": "nawaloka",
            "flags": 0
        }
    ]
}
