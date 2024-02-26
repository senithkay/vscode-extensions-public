import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { Diagram, DiagramProps } from "../components/Diagram";
import { APIResource } from "@wso2-enterprise/mi-syntax-tree/src";

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
