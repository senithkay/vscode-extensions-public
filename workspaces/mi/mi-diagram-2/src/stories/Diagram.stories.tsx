import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";
import { APIResource } from "@wso2-enterprise/mi-syntax-tree/src";

const resourceModel: any = { // TODO: find and check APIResource model types and model structure
    inSequence: {
        mediatorList: [
            {
                endpoint: [
                    {
                        http: {
                            enableSecAndEnableRMAndEnableAddressing: {
                                suspendOnFailure: {
                                    initialDuration: {
                                        range: {
                                            start: {
                                                line: 9,
                                                character: 28,
                                            },
                                            end: {
                                                line: 9,
                                                character: 65,
                                            },
                                        },
                                        hasTextNode: true,
                                        textNode: "-1",
                                        selfClosed: false,
                                        tag: "initialDuration",
                                    },
                                    progressionFactor: {
                                        range: {
                                            start: {
                                                line: 10,
                                                character: 28,
                                            },
                                            end: {
                                                line: 10,
                                                character: 69,
                                            },
                                        },
                                        hasTextNode: true,
                                        textNode: "-1",
                                        selfClosed: false,
                                        tag: "progressionFactor",
                                    },
                                    maximumDuration: {
                                        range: {
                                            start: {
                                                line: 11,
                                                character: 28,
                                            },
                                            end: {
                                                line: 11,
                                                character: 64,
                                            },
                                        },
                                        hasTextNode: true,
                                        textNode: "0",
                                        selfClosed: false,
                                        tag: "maximumDuration",
                                    },
                                    range: {
                                        start: {
                                            line: 8,
                                            character: 24,
                                        },
                                        end: {
                                            line: 12,
                                            character: 43,
                                        },
                                    },
                                    hasTextNode: false,
                                    selfClosed: false,
                                    tag: "suspendOnFailure",
                                },
                                markForSuspension: {
                                    retriesBeforeSuspension: {
                                        range: {
                                            start: {
                                                line: 14,
                                                character: 28,
                                            },
                                            end: {
                                                line: 14,
                                                character: 80,
                                            },
                                        },
                                        hasTextNode: true,
                                        textNode: "0",
                                        selfClosed: false,
                                        tag: "retriesBeforeSuspension",
                                    },
                                    range: {
                                        start: {
                                            line: 13,
                                            character: 24,
                                        },
                                        end: {
                                            line: 15,
                                            character: 44,
                                        },
                                    },
                                    hasTextNode: false,
                                    selfClosed: false,
                                    tag: "markForSuspension",
                                },
                                hasTextNode: false,
                                selfClosed: false,
                            },
                            method: "get",
                            range: {
                                start: {
                                    line: 7,
                                    character: 20,
                                },
                                end: {
                                    line: 16,
                                    character: 27,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: false,
                            tag: "http",
                        },
                        property: [],
                        parameter: [],
                        type: "HTTP_ENDPOINT",
                        range: {
                            start: {
                                line: 6,
                                character: 16,
                            },
                            end: {
                                line: 17,
                                character: 27,
                            },
                        },
                        hasTextNode: false,
                        selfClosed: false,
                        tag: "endpoint",
                    },
                ],
                buildmessage: false,
                range: {
                    start: {
                        line: 5,
                        character: 12,
                    },
                    end: {
                        line: 18,
                        character: 19,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "send",
            },
            {
                withParam: [
                    {
                        name: "testname1",
                        value: "testvalue1",
                        range: {
                            start: {
                                line: 20,
                                character: 12,
                            },
                            end: {
                                line: 20,
                                character: 62,
                            },
                        },
                        hasTextNode: false,
                        selfClosed: true,
                        tag: "with-param",
                    },
                ],
                range: {
                    start: {
                        line: 19,
                        character: 12,
                    },
                    end: {
                        line: 21,
                        character: 28,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "call-template",
            },
            {
                endpoint: {
                    property: [],
                    parameter: [],
                    type: "NAMED_ENDPOINT",
                    range: {
                        start: {
                            line: 23,
                            character: 12,
                        },
                        end: {
                            line: 27,
                            character: 23,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "endpoint",
                },
                blocking: false,
                range: {
                    start: {
                        line: 22,
                        character: 12,
                    },
                    end: {
                        line: 28,
                        character: 19,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "call",
            },
            {
                onAccept: {
                    mediatorList: [
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 38,
                                    character: 20,
                                },
                                end: {
                                    line: 38,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 39,
                                    character: 20,
                                },
                                end: {
                                    line: 39,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                    ],
                    range: {
                        start: {
                            line: 37,
                            character: 16,
                        },
                        end: {
                            line: 40,
                            character: 27,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "onAccept",
                },
                onReject: {
                    mediatorList: [
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 32,
                                    character: 20,
                                },
                                end: {
                                    line: 32,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                    ],
                    range: {
                        start: {
                            line: 31,
                            character: 16,
                        },
                        end: {
                            line: 33,
                            character: 27,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "onReject",
                },
                id: "t1",
                range: {
                    start: {
                        line: 30,
                        character: 12,
                    },
                    end: {
                        line: 41,
                        character: 23,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "throttle",
            },
            {
                property: [
                    {
                        name: "name1",
                        value: "value1",
                        range: {
                            start: {
                                line: 43,
                                character: 16,
                            },
                            end: {
                                line: 43,
                                character: 57,
                            },
                        },
                        hasTextNode: false,
                        selfClosed: true,
                        tag: "property",
                    },
                ],
                level: "simple",
                category: "INFO",
                range: {
                    start: {
                        line: 42,
                        character: 12,
                    },
                    end: {
                        line: 44,
                        character: 18,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "log",
            },
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 45,
                        character: 12,
                    },
                    end: {
                        line: 46,
                        character: 18,
                    },
                },
                hasTextNode: true,
                textNode: "\n            ",
                selfClosed: false,
                tag: "log",
            },
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 47,
                        character: 12,
                    },
                    end: {
                        line: 47,
                        character: 34,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log",
            },
            {
                description: "something",
                range: {
                    start: {
                        line: 48,
                        character: 12,
                    },
                    end: {
                        line: 48,
                        character: 60,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "store",
            },
            {
                withParam: [],
                range: {
                    start: {
                        line: 49,
                        character: 12,
                    },
                    end: {
                        line: 49,
                        character: 38,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "call-template",
            },
            {
                source: {
                    type: "property",
                    range: {
                        start: {
                            line: 51,
                            character: 16,
                        },
                        end: {
                            line: 51,
                            character: 64,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "source",
                },
                target: {
                    type: "body",
                    range: {
                        start: {
                            line: 53,
                            character: 16,
                        },
                        end: {
                            line: 53,
                            character: 45,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "target",
                },
                blocking: false,
                range: {
                    start: {
                        line: 50,
                        character: 12,
                    },
                    end: {
                        line: 54,
                        character: 19,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "call",
            },
            {
                scope: "default",
                type: "STRING",
                group: 0,
                range: {
                    start: {
                        line: 55,
                        character: 12,
                    },
                    end: {
                        line: 55,
                        character: 70,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "property",
            },
            {
                property: [],
                range: {
                    start: {
                        line: 56,
                        character: 12,
                    },
                    end: {
                        line: 56,
                        character: 28,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "propertyGroup",
            },
            {
                key: "Sequence",
                range: {
                    start: {
                        line: 57,
                        character: 12,
                    },
                    end: {
                        line: 57,
                        character: 38,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "sequence",
            },
            {
                target: {
                    type: "property",
                    range: {
                        start: {
                            line: 59,
                            character: 16,
                        },
                        end: {
                            line: 59,
                            character: 41,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: true,
                    tag: "target",
                },
                blocking: false,
                range: {
                    start: {
                        line: 58,
                        character: 12,
                    },
                    end: {
                        line: 60,
                        character: 19,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "call",
            },
            {
                onAccept: {
                    mediatorList: [
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 66,
                                    character: 20,
                                },
                                end: {
                                    line: 66,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 67,
                                    character: 20,
                                },
                                end: {
                                    line: 67,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                    ],
                    range: {
                        start: {
                            line: 65,
                            character: 16,
                        },
                        end: {
                            line: 68,
                            character: 27,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "onAccept",
                },
                onReject: {
                    mediatorList: [
                        {
                            property: [],
                            level: "simple",
                            range: {
                                start: {
                                    line: 63,
                                    character: 20,
                                },
                                end: {
                                    line: 63,
                                    character: 42,
                                },
                            },
                            hasTextNode: false,
                            selfClosed: true,
                            tag: "log",
                        },
                    ],
                    range: {
                        start: {
                            line: 62,
                            character: 16,
                        },
                        end: {
                            line: 64,
                            character: 27,
                        },
                    },
                    hasTextNode: false,
                    selfClosed: false,
                    tag: "onReject",
                },
                id: "t1",
                range: {
                    start: {
                        line: 61,
                        character: 12,
                    },
                    end: {
                        line: 69,
                        character: 23,
                    },
                },
                hasTextNode: false,
                selfClosed: false,
                tag: "throttle",
            },
            {
                initAxis2ClientOptions: false,
                range: {
                    start: {
                        line: 70,
                        character: 12,
                    },
                    end: {
                        line: 70,
                        character: 128,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "callout",
            },
            {
                scope: "default",
                range: {
                    start: {
                        line: 71,
                        character: 12,
                    },
                    end: {
                        line: 71,
                        character: 92,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "header",
            },
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 72,
                        character: 12,
                    },
                    end: {
                        line: 72,
                        character: 34,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log",
            },
            {
                range: {
                    start: {
                        line: 73,
                        character: 12,
                    },
                    end: {
                        line: 73,
                        character: 19,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "drop",
            },
            {
                range: {
                    start: {
                        line: 74,
                        character: 12,
                    },
                    end: {
                        line: 74,
                        character: 22,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "respond",
            },
            {
                range: {
                    start: {
                        line: 75,
                        character: 12,
                    },
                    end: {
                        line: 75,
                        character: 23,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "loopback",
            },
        ],
        range: {
            start: {
                line: 3,
                character: 8,
            },
            end: {
                line: 76,
                character: 21,
            },
        },
        hasTextNode: false,
        selfClosed: false,
        tag: "inSequence",
    },
    outSequence: {
        mediatorList: [
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 78,
                        character: 12,
                    },
                    end: {
                        line: 78,
                        character: 34,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log",
            },
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 79,
                        character: 12,
                    },
                    end: {
                        line: 79,
                        character: 34,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log",
            },
            {
                property: [],
                level: "simple",
                range: {
                    start: {
                        line: 80,
                        character: 12,
                    },
                    end: {
                        line: 80,
                        character: 34,
                    },
                },
                hasTextNode: false,
                selfClosed: true,
                tag: "log",
            },
        ],
        range: {
            start: {
                line: 77,
                character: 8,
            },
            end: {
                line: 81,
                character: 22,
            },
        },
        hasTextNode: false,
        selfClosed: false,
        tag: "outSequence",
    },
    methods: ["GET"],
    uriTemplate: "/resource",
    range: {
        start: {
            line: 2,
            character: 4,
        },
        end: {
            line: 82,
            character: 15,
        },
    },
    hasTextNode: false,
    selfClosed: false,
    tag: "APIResource",
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
