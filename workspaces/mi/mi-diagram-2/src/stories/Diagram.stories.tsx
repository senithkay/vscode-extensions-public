import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

const resourceModel: any = {
    inSequence: {
        mediatorList: [
            {
                then: {
                    mediatorList: [
                        {
                            endpoint: {
                                http: {
                                    enableSecAndEnableRMAndEnableAddressing: {
                                        suspendOnFailure: {
                                            initialDuration: {
                                                range: {
                                                    startTagRange: {
                                                        start: {
                                                            line: 11,
                                                            character: 36
                                                        },
                                                        end: {
                                                            line: 11,
                                                            character: 53
                                                        }
                                                    },
                                                    endTagRange: {
                                                        start: {
                                                            line: 11,
                                                            character: 55
                                                        },
                                                        end: {
                                                            line: 11,
                                                            character: 73
                                                        }
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "-1",
                                                selfClosed: false,
                                                tag: "initialDuration"
                                            },
                                            progressionFactor: {
                                                range: {
                                                    startTagRange: {
                                                        start: {
                                                            line: 12,
                                                            character: 36
                                                        },
                                                        end: {
                                                            line: 12,
                                                            character: 55
                                                        }
                                                    },
                                                    endTagRange: {
                                                        start: {
                                                            line: 12,
                                                            character: 57
                                                        },
                                                        end: {
                                                            line: 12,
                                                            character: 77
                                                        }
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "-1",
                                                selfClosed: false,
                                                tag: "progressionFactor"
                                            },
                                            maximumDuration: {
                                                range: {
                                                    startTagRange: {
                                                        start: {
                                                            line: 13,
                                                            character: 36
                                                        },
                                                        end: {
                                                            line: 13,
                                                            character: 53
                                                        }
                                                    },
                                                    endTagRange: {
                                                        start: {
                                                            line: 13,
                                                            character: 54
                                                        },
                                                        end: {
                                                            line: 13,
                                                            character: 72
                                                        }
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "0",
                                                selfClosed: false,
                                                tag: "maximumDuration"
                                            },
                                            range: {
                                                startTagRange: {
                                                    start: {
                                                        line: 10,
                                                        character: 32
                                                    },
                                                    end: {
                                                        line: 10,
                                                        character: 50
                                                    }
                                                },
                                                endTagRange: {
                                                    start: {
                                                        line: 14,
                                                        character: 32
                                                    },
                                                    end: {
                                                        line: 14,
                                                        character: 51
                                                    }
                                                }
                                            },
                                            hasTextNode: false,
                                            selfClosed: false,
                                            tag: "suspendOnFailure"
                                        },
                                        markForSuspension: {
                                            retriesBeforeSuspension: {
                                                range: {
                                                    startTagRange: {
                                                        start: {
                                                            line: 16,
                                                            character: 36
                                                        },
                                                        end: {
                                                            line: 16,
                                                            character: 61
                                                        }
                                                    },
                                                    endTagRange: {
                                                        start: {
                                                            line: 16,
                                                            character: 62
                                                        },
                                                        end: {
                                                            line: 16,
                                                            character: 88
                                                        }
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "0",
                                                selfClosed: false,
                                                tag: "retriesBeforeSuspension"
                                            },
                                            range: {
                                                startTagRange: {
                                                    start: {
                                                        line: 15,
                                                        character: 32
                                                    },
                                                    end: {
                                                        line: 15,
                                                        character: 51
                                                    }
                                                },
                                                endTagRange: {
                                                    start: {
                                                        line: 17,
                                                        character: 32
                                                    },
                                                    end: {
                                                        line: 17,
                                                        character: 52
                                                    }
                                                }
                                            },
                                            hasTextNode: false,
                                            selfClosed: false,
                                            tag: "markForSuspension"
                                        },
                                        hasTextNode: false,
                                        selfClosed: false
                                    },
                                    uriTemplate: "http://google.com",
                                    method: "get",
                                    range: {
                                        startTagRange: {
                                            start: {
                                                line: 9,
                                                character: 28
                                            },
                                            end: {
                                                line: 9,
                                                character: 80
                                            }
                                        },
                                        endTagRange: {
                                            start: {
                                                line: 18,
                                                character: 28
                                            },
                                            end: {
                                                line: 18,
                                                character: 35
                                            }
                                        }
                                    },
                                    hasTextNode: false,
                                    selfClosed: false,
                                    tag: "http"
                                },
                                property: [],
                                parameter: [],
                                type: "HTTP_ENDPOINT",
                                range: {
                                    startTagRange: {
                                        start: {
                                            line: 8,
                                            character: 24
                                        },
                                        end: {
                                            line: 8,
                                            character: 34
                                        }
                                    },
                                    endTagRange: {
                                        start: {
                                            line: 19,
                                            character: 24
                                        },
                                        end: {
                                            line: 19,
                                            character: 35
                                        }
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "endpoint"
                            },
                            blocking: false,
                            range: {
                                startTagRange: {
                                    start: {
                                        line: 7,
                                        character: 20
                                    },
                                    end: {
                                        line: 7,
                                        character: 43
                                    }
                                },
                                endTagRange: {
                                    start: {
                                        line: 20,
                                        character: 20
                                    },
                                    end: {
                                        line: 20,
                                        character: 27
                                    }
                                }
                            },
                            hasTextNode: false,
                            selfClosed: false,
                            tag: "call"
                        }
                    ],
                    range: {
                        startTagRange: {
                            start: {
                                line: 6,
                                character: 16
                            },
                            end: {
                                line: 6,
                                character: 22
                            }
                        },
                        endTagRange: {
                            start: {
                                line: 21,
                                character: 16
                            },
                            end: {
                                line: 21,
                                character: 23
                            }
                        }
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "then"
                },
                else_: {
                    mediatorList: [],
                    range: {
                        startTagRange: {
                            start: {
                                line: 22,
                                character: 16
                            },
                            end: {
                                line: 22,
                                character: 22
                            }
                        },
                        endTagRange: {
                            start: {
                                line: 23,
                                character: 16
                            },
                            end: {
                                line: 23,
                                character: 23
                            }
                        }
                    },
                    hasTextNode: true,
                    textNode: "\n                ",
                    selfClosed: false,
                    tag: "else"
                },
                range: {
                    startTagRange: {
                        start: {
                            line: 5,
                            character: 12
                        },
                        end: {
                            line: 5,
                            character: 20
                        }
                    },
                    endTagRange: {
                        start: {
                            line: 24,
                            character: 12
                        },
                        end: {
                            line: 24,
                            character: 21
                        }
                    }
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "filter"
            }
        ],
        range: {
            startTagRange: {
                start: {
                    line: 3,
                    character: 8
                },
                end: {
                    line: 3,
                    character: 20
                }
            },
            endTagRange: {
                start: {
                    line: 26,
                    character: 8
                },
                end: {
                    line: 26,
                    character: 21
                }
            }
        },
        hasTextNode: false,
        selfClosed: false,
        tag: "inSequence"
    },
    outSequence: {
        mediatorList: [],
        range: {
            startTagRange: {
                start: {
                    line: 27,
                    character: 8
                },
                end: {
                    line: 27,
                    character: 21
                }
            },
            endTagRange: {
                start: {
                    line: 28,
                    character: 8
                },
                end: {
                    line: 28,
                    character: 22
                }
            }
        },
        hasTextNode: true,
        textNode: "\n        ",
        selfClosed: false,
        tag: "outSequence"
    },
    faultSequence: {
        mediatorList: [],
        range: {
            startTagRange: {
                start: {
                    line: 29,
                    character: 8
                },
                end: {
                    line: 29,
                    character: 23
                }
            },
            endTagRange: {
                start: {
                    line: 30,
                    character: 8
                },
                end: {
                    line: 30,
                    character: 24
                }
            }
        },
        hasTextNode: true,
        textNode: "\n        ",
        selfClosed: false,
        tag: "faultSequence"
    },
    methods: [
        "GET"
    ],
    uriTemplate: "/resource",
    range: {
        startTagRange: {
            start: {
                line: 2,
                character: 4
            },
            end: {
                line: 2,
                character: 53
            }
        },
        endTagRange: {
            start: {
                line: 31,
                character: 4
            },
            end: {
                line: 31,
                character: 15
            }
        }
    },
    hasTextNode: false,
    selfClosed: false,
    tag: "resource"
};

export default {
    title: "Example/Diagram",
    component: Diagram,
} as Meta;

const Template: Story<DiagramProps> = (args: React.JSX.IntrinsicAttributes & DiagramProps) => <Diagram {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    model: resourceModel,
};

export const Sequence = Template.bind({});
Sequence.args = {
    model: {
        "mediatorList": [
            {
                "correlateOnOrCompleteConditionOrOnComplete": {
                    "completeCondition": {
                        "messageCount": {
                            "min": "-1",
                            "max": "-1",
                            "range": {
                                "startTagRange": {
                                    "start": {
                                        "line": 4,
                                        "character": 12
                                    },
                                    "end": {
                                        "line": 4,
                                        "character": 45
                                    }
                                },
                                "endTagRange": {}
                            },
                            "hasTextNode": false,
                            "selfClosed": true,
                            "tag": "messageCount"
                        },
                        "timeout": 0,
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 3,
                                    "character": 8
                                },
                                "end": {
                                    "line": 3,
                                    "character": 27
                                }
                            },
                            "endTagRange": {
                                "start": {
                                    "line": 5,
                                    "character": 8
                                },
                                "end": {
                                    "line": 5,
                                    "character": 28
                                }
                            }
                        },
                        "hasTextNode": false,
                        "selfClosed": false,
                        "tag": "completeCondition"
                    },
                    "onComplete": {
                        "mediators": [],
                        "expression": "$ctx:esfadf",
                        "aggregateElementType": "root",
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 6,
                                    "character": 8
                                },
                                "end": {
                                    "line": 6,
                                    "character": 74
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "onComplete"
                    },
                    "hasTextNode": false,
                    "selfClosed": false
                },
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 2,
                            "character": 4
                        },
                        "end": {
                            "line": 2,
                            "character": 15
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 7,
                            "character": 4
                        },
                        "end": {
                            "line": 7,
                            "character": 16
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "aggregate"
            },
            {
                "target": [
                    {
                        "sequence": {
                            "mediatorList": [],
                            "range": {
                                "startTagRange": {
                                    "start": {
                                        "line": 10,
                                        "character": 12
                                    },
                                    "end": {
                                        "line": 10,
                                        "character": 23
                                    }
                                },
                                "endTagRange": {}
                            },
                            "hasTextNode": false,
                            "selfClosed": true,
                            "tag": "sequence"
                        },
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 9,
                                    "character": 8
                                },
                                "end": {
                                    "line": 9,
                                    "character": 16
                                }
                            },
                            "endTagRange": {
                                "start": {
                                    "line": 11,
                                    "character": 8
                                },
                                "end": {
                                    "line": 11,
                                    "character": 17
                                }
                            }
                        },
                        "hasTextNode": false,
                        "selfClosed": false,
                        "tag": "target"
                    }
                ],
                "continueParent": false,
                "sequential": false,
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 8,
                            "character": 4
                        },
                        "end": {
                            "line": 8,
                            "character": 11
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 12,
                            "character": 4
                        },
                        "end": {
                            "line": 12,
                            "character": 12
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "clone"
            },
            {
                "target": [
                    {
                        "sequence": {
                            "mediatorList": [],
                            "range": {
                                "startTagRange": {
                                    "start": {
                                        "line": 15,
                                        "character": 12
                                    },
                                    "end": {
                                        "line": 15,
                                        "character": 23
                                    }
                                },
                                "endTagRange": {}
                            },
                            "hasTextNode": false,
                            "selfClosed": true,
                            "tag": "sequence"
                        },
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 14,
                                    "character": 8
                                },
                                "end": {
                                    "line": 14,
                                    "character": 16
                                }
                            },
                            "endTagRange": {
                                "start": {
                                    "line": 16,
                                    "character": 8
                                },
                                "end": {
                                    "line": 16,
                                    "character": 17
                                }
                            }
                        },
                        "hasTextNode": false,
                        "selfClosed": false,
                        "tag": "target"
                    }
                ],
                "sequential": false,
                "continueParent": false,
                "expression": "$ctx:aefa",
                "preservePayload": false,
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 13,
                            "character": 4
                        },
                        "end": {
                            "line": 13,
                            "character": 36
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 17,
                            "character": 4
                        },
                        "end": {
                            "line": 17,
                            "character": 14
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "iterate"
            },
            {
                "sequence": {
                    "mediatorList": [],
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 19,
                                "character": 8
                            },
                            "end": {
                                "line": 19,
                                "character": 19
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "sequence"
                },
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 18,
                            "character": 4
                        },
                        "end": {
                            "line": 18,
                            "character": 27
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 20,
                            "character": 4
                        },
                        "end": {
                            "line": 20,
                            "character": 14
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "foreach"
            },
            {
                "onReject": {
                    "mediatorList": [],
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 22,
                                "character": 8
                            },
                            "end": {
                                "line": 22,
                                "character": 19
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "onReject"
                },
                "onAccept": {
                    "mediatorList": [],
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 23,
                                "character": 8
                            },
                            "end": {
                                "line": 23,
                                "character": 19
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "onAccept"
                },
                "advice": {
                    "mediatorList": [],
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 25,
                                "character": 8
                            },
                            "end": {
                                "line": 25,
                                "character": 17
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "advice"
                },
                "obligations": {
                    "mediatorList": [],
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 24,
                                "character": 8
                            },
                            "end": {
                                "line": 24,
                                "character": 22
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "obligations"
                },
                "callbackClass": "org.wso2.carbon.identity.entitlement.mediator.callback.UTEntitlementCallbackHandler",
                "client": "basicAuth",
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 21,
                            "character": 4
                        },
                        "end": {
                            "line": 21,
                            "character": 213
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 26,
                            "character": 4
                        },
                        "end": {
                            "line": 26,
                            "character": 25
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "entitlementService"
            },
            {
                "remoteServiceUrl": "https://adfa/",
                "username": "aef",
                "password": "aef",
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 27,
                            "character": 4
                        },
                        "end": {
                            "line": 27,
                            "character": 82
                        }
                    },
                    "endTagRange": {}
                },
                "hasTextNode": false,
                "selfClosed": true,
                "tag": "oauthService"
            },
            {
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 28,
                            "character": 4
                        },
                        "end": {
                            "line": 28,
                            "character": 68
                        }
                    },
                    "endTagRange": {}
                },
                "hasTextNode": false,
                "selfClosed": true,
                "tag": "NTLM"
            },
            {
                "source": {
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 31,
                                "character": 8
                            },
                            "end": {
                                "line": 31,
                                "character": 21
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "brs:source"
                },
                "target": {
                    "action": "replace",
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 32,
                                "character": 8
                            },
                            "end": {
                                "line": 32,
                                "character": 62
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "brs:target"
                },
                "ruleSet": {
                    "properties": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 34,
                                    "character": 12
                                },
                                "end": {
                                    "line": 34,
                                    "character": 29
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "brs:properties"
                    },
                    "rule": {
                        "value": "<![CDATA[<code/>]]>",
                        "resourceType": "regular",
                        "sourceType": "inline",
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 35,
                                    "character": 12
                                },
                                "end": {
                                    "line": 35,
                                    "character": 65
                                }
                            },
                            "endTagRange": {
                                "start": {
                                    "line": 35,
                                    "character": 84
                                },
                                "end": {
                                    "line": 35,
                                    "character": 95
                                }
                            }
                        },
                        "hasTextNode": false,
                        "selfClosed": false,
                        "tag": "brs:rule"
                    },
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 33,
                                "character": 8
                            },
                            "end": {
                                "line": 33,
                                "character": 21
                            }
                        },
                        "endTagRange": {
                            "start": {
                                "line": 36,
                                "character": 8
                            },
                            "end": {
                                "line": 36,
                                "character": 22
                            }
                        }
                    },
                    "hasTextNode": false,
                    "selfClosed": false,
                    "tag": "brs:ruleSet"
                },
                "input": {
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 37,
                                "character": 8
                            },
                            "end": {
                                "line": 37,
                                "character": 20
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "brs:input"
                },
                "output": {
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 38,
                                "character": 8
                            },
                            "end": {
                                "line": 38,
                                "character": 21
                            }
                        },
                        "endTagRange": {}
                    },
                    "hasTextNode": false,
                    "selfClosed": true,
                    "tag": "brs:output"
                },
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 30,
                            "character": 4
                        },
                        "end": {
                            "line": 30,
                            "character": 55
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 39,
                            "character": 4
                        },
                        "end": {
                            "line": 39,
                            "character": 15
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "brs:rule"
            },
            {
                "serverProfile": {
                    "streamConfig": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 42,
                                    "character": 12
                                },
                                "end": {
                                    "line": 42,
                                    "character": 46
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "streamConfig"
                    },
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 41,
                                "character": 8
                            },
                            "end": {
                                "line": 41,
                                "character": 31
                            }
                        },
                        "endTagRange": {
                            "start": {
                                "line": 43,
                                "character": 8
                            },
                            "end": {
                                "line": 43,
                                "character": 24
                            }
                        }
                    },
                    "hasTextNode": false,
                    "selfClosed": false,
                    "tag": "serverProfile"
                },
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 40,
                            "character": 4
                        },
                        "end": {
                            "line": 40,
                            "character": 9
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 44,
                            "character": 4
                        },
                        "end": {
                            "line": 44,
                            "character": 10
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "bam"
            },
            {
                "attributes": {
                    "meta": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 50,
                                    "character": 12
                                },
                                "end": {
                                    "line": 50,
                                    "character": 19
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "meta"
                    },
                    "correlation": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 51,
                                    "character": 12
                                },
                                "end": {
                                    "line": 51,
                                    "character": 26
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "correlation"
                    },
                    "payload": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 52,
                                    "character": 12
                                },
                                "end": {
                                    "line": 52,
                                    "character": 22
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "payload"
                    },
                    "arbitrary": {
                        "range": {
                            "startTagRange": {
                                "start": {
                                    "line": 53,
                                    "character": 12
                                },
                                "end": {
                                    "line": 53,
                                    "character": 24
                                }
                            },
                            "endTagRange": {}
                        },
                        "hasTextNode": false,
                        "selfClosed": true,
                        "tag": "arbitrary"
                    },
                    "range": {
                        "startTagRange": {
                            "start": {
                                "line": 49,
                                "character": 8
                            },
                            "end": {
                                "line": 49,
                                "character": 20
                            }
                        },
                        "endTagRange": {
                            "start": {
                                "line": 54,
                                "character": 8
                            },
                            "end": {
                                "line": 54,
                                "character": 21
                            }
                        }
                    },
                    "hasTextNode": false,
                    "selfClosed": false,
                    "tag": "attributes"
                },
                "range": {
                    "startTagRange": {
                        "start": {
                            "line": 45,
                            "character": 4
                        },
                        "end": {
                            "line": 45,
                            "character": 31
                        }
                    },
                    "endTagRange": {
                        "start": {
                            "line": 55,
                            "character": 4
                        },
                        "end": {
                            "line": 55,
                            "character": 19
                        }
                    }
                },
                "hasTextNode": false,
                "selfClosed": false,
                "tag": "publishEvent"
            }
        ],
        "name": "defseq",
        "trace": "disable",
        "range": {
            "startTagRange": {
                "start": {
                    "line": 1,
                    "character": 0
                },
                "end": {
                    "line": 1,
                    "character": 80
                }
            },
            "endTagRange": {
                "start": {
                    "line": 56,
                    "character": 0
                },
                "end": {
                    "line": 56,
                    "character": 11
                }
            }
        },
        "hasTextNode": false,
        "selfClosed": false,
        "tag": "sequence"
    }
};
