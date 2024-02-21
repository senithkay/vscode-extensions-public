import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";

const resourceModel: any = { // TODO: find and check APIResource model types and model structure
    inSequence: {
        mediatorList: [
            {
                property: [],
                range: {
                    start: {
                        line: 4,
                        character: 12
                    },
                    end: {
                        line: 4,
                        character: 18
                    }
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log"
            },
            {
                scope: "default",
                type: "STRING",
                pattern: "stPattern",
                group: 0,
                description: "Read the phone number in the resource URL",
                name: "phoneNumber",
                value: "ccc",
                range: {
                    start: {
                        line: 5,
                        character: 12
                    },
                    end: {
                        line: 5,
                        character: 170
                    }
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "property"
            },
            {
                property: [
                    {
                        name: "PhoneNumber",
                        expression: "$ctx:phoneNumber",
                        range: {
                            start: {
                                line: 7,
                                character: 16
                            },
                            end: {
                                line: 7,
                                character: 76
                            }
                        },
                        hasTextNode: false,
                        selfClosed: true,
                        tag: "property"
                    }
                ],
                level: "custom",
                description: "Log the phone number",
                range: {
                    start: {
                        line: 6,
                        character: 12
                    },
                    end: {
                        line: 8,
                        character: 18
                    }
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "log"
            },
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
                                                    start: {
                                                        line: 15,
                                                        character: 36
                                                    },
                                                    end: {
                                                        line: 15,
                                                        character: 73
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "-1",
                                                selfClosed: false,
                                                tag: "initialDuration"
                                            },
                                            progressionFactor: {
                                                range: {
                                                    start: {
                                                        line: 16,
                                                        character: 36
                                                    },
                                                    end: {
                                                        line: 16,
                                                        character: 77
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "-1",
                                                selfClosed: false,
                                                tag: "progressionFactor"
                                            },
                                            maximumDuration: {
                                                range: {
                                                    start: {
                                                        line: 17,
                                                        character: 36
                                                    },
                                                    end: {
                                                        line: 17,
                                                        character: 72
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "0",
                                                selfClosed: false,
                                                tag: "maximumDuration"
                                            },
                                            range: {
                                                start: {
                                                    line: 14,
                                                    character: 32
                                                },
                                                end: {
                                                    line: 18,
                                                    character: 51
                                                }
                                            },
                                            hasTextNode: false,
                                            selfClosed: false,
                                            tag: "suspendOnFailure"
                                        },
                                        markForSuspension: {
                                            retriesBeforeSuspension: {
                                                range: {
                                                    start: {
                                                        line: 20,
                                                        character: 36
                                                    },
                                                    end: {
                                                        line: 20,
                                                        character: 88
                                                    }
                                                },
                                                hasTextNode: true,
                                                textNode: "0",
                                                selfClosed: false,
                                                tag: "retriesBeforeSuspension"
                                            },
                                            range: {
                                                start: {
                                                    line: 19,
                                                    character: 32
                                                },
                                                end: {
                                                    line: 21,
                                                    character: 52
                                                }
                                            },
                                            hasTextNode: false,
                                            selfClosed: false,
                                            tag: "markForSuspension"
                                        },
                                        hasTextNode: false,
                                        selfClosed: false
                                    },
                                    method: "get",
                                    range: {
                                        start: {
                                            line: 13,
                                            character: 28
                                        },
                                        end: {
                                            line: 22,
                                            character: 35
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
                                    start: {
                                        line: 12,
                                        character: 24
                                    },
                                    end: {
                                        line: 23,
                                        character: 35
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "endpoint"
                            },
                            blocking: false,
                            description: "Send request to endpoint",
                            range: {
                                start: {
                                    line: 11,
                                    character: 20
                                },
                                end: {
                                    line: 24,
                                    character: 27
                                }
                            },
                            hasTextNode: false,
                            selfClosed: false,
                            tag: "call"
                        }
                    ],
                    range: {
                        start: {
                            line: 10,
                            character: 16
                        },
                        end: {
                            line: 25,
                            character: 23
                        }
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "then"
                },
                else_: {
                    mediatorList: [
                        {
                            format: {
                                content: "<Message xmlns=\"\" >Invalid Phone Number</Message>",
                                range: {
                                    start: {
                                        line: 28,
                                        character: 24
                                    },
                                    end: {
                                        line: 30,
                                        character: 33
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "format"
                            },
                            args: {
                                arg: [
                                    {
                                        value: "default",
                                        literal: false,
                                        range: {
                                            start: {
                                                line: 32,
                                                character: 28
                                            },
                                            end: {
                                                line: 32,
                                                character: 50
                                            }
                                        },
                                        hasTextNode: false,
                                        selfClosed: true,
                                        tag: "arg"
                                    },
                                    {
                                        evaluator: "xml",
                                        expression: "s",
                                        literal: false,
                                        range: {
                                            start: {
                                                line: 33,
                                                character: 28
                                            },
                                            end: {
                                                line: 33,
                                                character: 65
                                            }
                                        },
                                        hasTextNode: false,
                                        selfClosed: true,
                                        tag: "arg"
                                    }
                                ],
                                range: {
                                    start: {
                                        line: 31,
                                        character: 24
                                    },
                                    end: {
                                        line: 34,
                                        character: 31
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "args"
                            },
                            mediaType: "xml",
                            description: "Create response payload for invalid phone numbers",
                            range: {
                                start: {
                                    line: 27,
                                    character: 20
                                },
                                end: {
                                    line: 35,
                                    character: 37
                                }
                            },
                            hasTextNode: false,
                            selfClosed: false,
                            tag: "payloadFactory"
                        }
                    ],
                    range: {
                        start: {
                            line: 26,
                            character: 16
                        },
                        end: {
                            line: 36,
                            character: 23
                        }
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "else"
                },
                else_2: {
                    mediatorList: [
                        {
                            format: {
                                content: "<Message xmlns=\"\" >Invalid Phone Number</Message>",
                                range: {
                                    start: {
                                        line: 282,
                                        character: 24
                                    },
                                    end: {
                                        line: 302,
                                        character: 33
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "format"
                            },
                            args: {
                                arg: [
                                    {
                                        value: "default",
                                        literal: false,
                                        range: {
                                            start: {
                                                line: 32,
                                                character: 28
                                            },
                                            end: {
                                                line: 32,
                                                character: 50
                                            }
                                        },
                                        hasTextNode: false,
                                        selfClosed: true,
                                        tag: "arg"
                                    },
                                    {
                                        evaluator: "xml",
                                        expression: "s",
                                        literal: false,
                                        range: {
                                            start: {
                                                line: 33,
                                                character: 28
                                            },
                                            end: {
                                                line: 33,
                                                character: 65
                                            }
                                        },
                                        hasTextNode: false,
                                        selfClosed: true,
                                        tag: "arg"
                                    }
                                ],
                                range: {
                                    start: {
                                        line: 31,
                                        character: 24
                                    },
                                    end: {
                                        line: 34,
                                        character: 31
                                    }
                                },
                                hasTextNode: false,
                                selfClosed: false,
                                tag: "args"
                            },
                            mediaType: "xml",
                            description: "Create response payload for invalid phone numbers",
                            range: {
                                start: {
                                    line: 271,
                                    character: 20
                                },
                                end: {
                                    line: 351,
                                    character: 37
                                }
                            },
                            hasTextNode: false,
                            selfClosed: false,
                            tag: "payloadFactory"
                        }
                    ],
                    range: {
                        start: {
                            line: 26,
                            character: 16
                        },
                        end: {
                            line: 36,
                            character: 23
                        }
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "else"
                },
                xpath: "fn:string-length($ctx:phoneNumber) = 10",
                description: "Check phone number has 10 digits",
                range: {
                    start: {
                        line: 9,
                        character: 12
                    },
                    end: {
                        line: 37,
                        character: 21
                    }
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "filter"
            },
            {
                description: "Send response back to the client",
                range: {
                    start: {
                        line: 38,
                        character: 12
                    },
                    end: {
                        line: 38,
                        character: 69
                    }
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "respond"
            }
        ],
        range: {
            start: {
                line: 3,
                character: 8
            },
            end: {
                line: 39,
                character: 21
            }
        },
        hasTextNode: false,
        selfClosed: false,
        tag: "inSequence"
    },
    outSequence: {
        mediatorList: [],
        range: {
            start: {
                line: 40,
                character: 8
            },
            end: {
                line: 41,
                character: 22
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
            start: {
                line: 42,
                character: 8
            },
            end: {
                line: 42,
                character: 24
            }
        },
        hasTextNode: false,
        selfClosed: true,
        tag: "faultSequence"
    },
    methods: [
        "GET"
    ],
    uriTemplate: "/validate/{phoneNumber}",
    range: {
        start: {
            line: 2,
            character: 4
        },
        end: {
            line: 43,
            character: 15
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
