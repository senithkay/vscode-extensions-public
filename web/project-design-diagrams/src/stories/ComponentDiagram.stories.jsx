import React from 'react';
import { DesignDiagram } from "../DesignDiagram";

let components = {
    "aneesha/checkout:0.1.0": {
        "packageId": {
            "name": "checkout",
            "org": "aneesha",
            "version": "0.1.0"
        },
        "services": {
            "checkout": {
                "annotation": {
                    "id": "checkout",
                    "label": ""
                },
                "lineRange": {},
                "path": "CheckoutService",
                "serviceId": "checkout",
                "serviceType": "ballerina/grpc:1.4.0",
                "resources": [],
                "remoteFunctions": [
                    {
                        "name": "PlaceOrder",
                        "lineRange": {},
                        "parameters": [
                            {
                            "type": ["aneesha/checkout:0.1.0:PlaceOrderRequest"],
                            "name": "value",
                            "isRequired": true
                            }
                        ],
                        "returns": ["aneesha/checkout:0.1.0:PlaceOrderResponse", "error"],
                        "interactions": [
                            {
                                "resourceId": {
                                    "serviceId": "0002",
                                    "path": "fare/[string]/[string]",
                                    "action": "get"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/http:2.4.0"
                            }
                        ]
                    }
                ]
            }
        },
        "entities": {}
    },
    "aneesha/fares_api:0.1.0": {
        "packageId": {
            "name": "fares_api",
            "org": "aneesha",
            "version": "0.1.0"
        },
        "services": {
            "0002": {
                "annotation": {
                    "id": "0002",
                    "label": "farest"
                },
                "lineRange": {},
                "path": "/",
                "serviceId": "0002",
                "serviceType": "ballerina/http:2.4.0",
                "remoteFunctions": [],
                "resources": [
                    {
                        "identifier": "fare/[string]/[string]",
                        "lineRange": {},
                        "resourceId": {
                            "serviceId": "0002",
                            "path": "fare/[string flightNumber]/[string flightDate]",
                            "action": "get"
                        },
                        "parameters": [
                            {
                                "type": [
                                    "string"
                                ],
                                "name": "name",
                                "in": "query",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "aneesha/fares_api:fares_api:0.1.0:Fare",
                            "error"
                        ],
                        "interactions": [

                        ]
                    }
                ]
            }
        },
        "entities": {
            "aneesha/fares_api:fares_api:0.1.0:Fare": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "flightNo",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [

                        ]
                    },
                    {
                        "name": "flightDate",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [

                        ]
                    },
                    {
                        "name": "fare",
                        "type": "float",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            }
        }
    },
    "aneesha/inventory_api:0.1.0": {
        "packageId": {
            "name": "inventory_api",
            "org": "aneesha",
            "version": "0.1.0"
        },
        "services": {
            "0001": {
                "annotation": {
                    "id": "0001",
                    "label": ""
                },
                "lineRange": {},
                "path": "inventory",
                "serviceId": "0001",
                "serviceType": "ballerina/http:2.4.0",
                "remoteFunctions": [],
                "resources": [
                    {
                        "identifier": "flights/[string]",
                        "resourceId": {
                            "serviceId": "0001",
                            "path": "flights/[string flightNumber]",
                            "action": "get"
                        },
                        "lineRange": {},
                        "parameters": [
                            {
                                "type": [
                                    "string",
                                    "null"
                                ],
                                "name": "flightDate",
                                "in": "query",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "aneesha/inventory_api:0.1.0:Flight"
                        ],
                        "interactions": [

                        ]
                    },
                    {
                        "identifier": "flights",
                        "resourceId": {
                            "serviceId": "0001",
                            "path": "flights",
                            "action": "post"
                        },
                        "lineRange": {},
                        "parameters": [
                            {
                                "type": [
                                    "aneesha/inventory_api:0.1.0:SeatAllocation"
                                ],
                                "name": "payload",
                                "in": "body",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "aneesha/inventory_api:0.1.0:SeatAllocation",
                            "error"
                        ],
                        "interactions": [

                        ]
                    }
                ]
            }
        },
        "entities": {
            "aneesha/inventory_api:0.1.0:SeatAllocation": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "flightNumber",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "flightDate",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "seats",
                        "type": "int",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "owner",
                        "type": "aneesha/inventory_api:0.1.0:Personnel",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/inventory_api:0.1.0:Personnel",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/inventory_api:0.1.0:Flight": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "flightNumber",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "flightDate",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "available",
                        "type": "int",
                        "optional": false,
                        "lineRange": {},
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "totalCapacity",
                        "type": "int",
                        "lineRange": {},
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/inventory_api:0.1.0:FareFlight": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "fare",
                        "type": "aneesha/fares_api:fares_api:0.1.0:Fare",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [
                            {
                                "associate": "aneesha/fares_api:fares_api:0.1.0:Fare",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    },
                    {
                        "name": "flight",
                        "type": "aneesha/inventory_api:0.1.0:Flight",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/inventory_api:0.1.0:Flight",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/inventory_api:0.1.0:Personnel": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "name",
                        "type": "string",
                        "lineRange": {},
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "id",
                        "type": "int",
                        "lineRange": {},
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "contact",
                        "type": "int",
                        "optional": false,
                        "lineRange": {},
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            }
        }
    },
    "aneesha/booking_api:0.1.0": {
        "packageId": {
            "name": "booking_api",
            "org": "aneesha",
            "version": "0.1.0"
        },
        "services": {
            "0003": {
                "annotation": {
                    "id": "0003",
                    "label": ""
                },
                "lineRange": {},
                "path": "bookings",
                "serviceId": "0003",
                "serviceType": "ballerina/http:2.4.0",
                "remoteFunctions": [],
                "resources": [
                    {
                        "identifier": "booking",
                        "resourceId": {
                            "serviceId": "0003",
                            "path": "booking",
                            "action": "post"
                        },
                        "lineRange": {},
                        "parameters": [
                            {
                                "type": [
                                    "aneesha/booking_api:0.1.0:Booking"
                                ],
                                "name": "payload",
                                "in": "body",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "aneesha/booking_api:0.1.0:BookingRecord",
                            "error",
                            "null"
                        ],
                        "interactions": [
                            {
                                "resourceId": {
                                    "serviceId": "0001",
                                    "path": "flights/sds",
                                    "action": "post"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/http:2.4.0"
                            },
                            {
                                "resourceId": {
                                    "serviceId": "0002",
                                    "path": "fare/[string]/[string]",
                                    "action": "get"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/http:2.4.0"
                            }
                        ]
                    },
                    {
                        "identifier": "booking/[int]",
                        "resourceId": {
                            "serviceId": "0003",
                            "path": "booking/[int id]",
                            "action": "get"
                        },
                        "lineRange": {},
                        "parameters": [

                        ],
                        "returns": [
                            "aneesha/booking_api:0.1.0:BookingRecord",
                            "error",
                            "null"
                        ],
                        "interactions": [

                        ]
                    },
                    {
                        "identifier": "booking/[int]",
                        "resourceId": {
                            "serviceId": "0003",
                            "path": "booking/[int id]",
                            "action": "delete"
                        },
                        "lineRange": {},
                        "parameters": [

                        ],
                        "returns": [
                            "aneesha/booking_api:0.1.0:BookingRecord",
                            "error",
                            "null"
                        ],
                        "interactions": [

                        ]
                    },
                    {
                        "identifier": "booking/[int]",
                        "resourceId": {
                            "serviceId": "0003",
                            "path": "booking/[int id]",
                            "action": "put"
                        },
                        "lineRange": {},
                        "parameters": [
                            {
                                "type": [
                                    "aneesha/booking_api:0.1.0:BookingRecord"
                                ],
                                "name": "bookingInfo",
                                "in": "body",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "ballerina/http:http:2.4.0:Response"
                        ],
                        "interactions": [
                            {
                                "resourceId": {
                                    "serviceId": "checkout",
                                    "action": "PlaceOrder"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/grpc:1.4.0"
                            }
                        ]
                    },
                    {
                        "identifier": "changestatus/[int]/status/[string]",
                        "resourceId": {
                            "serviceId": "0003",
                            "path": "changestatus/[int id]/status/[string bookingStatus]",
                            "action": "post"
                        },
                        "lineRange": {},
                        "parameters": [

                        ],
                        "returns": [
                            "error",
                            "null"
                        ],
                        "interactions": [

                        ]
                    }
                ]
            }
        },
        "entities": {
            "aneesha/booking_api:0.1.0:Customer": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "name",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "address",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:Passenger": {
                "attributes": [
                    {
                        "name": "firstName",
                        "type": "string",
                        "optional": false,
                        "lineRange": {},
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "lastName",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "passportNumber",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:BookingRecord": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "origin",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "destination",
                        "type": "string",
                        "optional": false,
                        "lineRange": {},
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "bookingDate",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "id",
                        "type": "int",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "seats",
                        "type": "int",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [

                        ]
                    },
                    {
                        "name": "status",
                        "type": "aneesha/booking_api:0.1.0:BookingStatus",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/booking_api:0.1.0:BookingStatus",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    }
                ],
                "inclusions": [
                    "aneesha/fares_api:fares_api:0.1.0:Fare"
                ]
            },
            "aneesha/booking_api:0.1.0:Order": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "date",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "status",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [

                        ]
                    },
                    {
                        "name": "customer",
                        "type": "aneesha/booking_api:0.1.0:Customer",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/booking_api:0.1.0:Customer",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    },
                    {
                        "name": "items",
                        "type": "aneesha/booking_api:0.1.0:LineItemOrder[]",
                        "optional": false,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [
                            {
                                "associate": "aneesha/booking_api:0.1.0:LineItemOrder",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-m"
                                }
                            }
                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:ApiCredentials": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "clientId",
                        "type": "string",
                        "optional": false,
                        "lineRange": {},
                        "nillable": false,
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "clientSecret",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:Booking": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "flightNumber",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "origin",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "destination",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "flightDate",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "seats",
                        "type": "int",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:PassengerFare": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "passenger",
                        "type": "aneesha/booking_api:0.1.0:Passenger",
                        "optional": true,
                        "nillable": false,
                        "defaultValue": "",
                        "lineRange": {},
                        "associations": [
                            {
                                "associate": "aneesha/booking_api:0.1.0:Passenger",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "1-1"
                                }
                            }
                        ]
                    },
                    {
                        "name": "fare",
                        "type": "aneesha/fares_api:fares_api:0.1.0:Fare[]",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/fares_api:fares_api:0.1.0:Fare",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-m"
                                }
                            }
                        ]
                    },
                    {
                        "name": "bookingRec",
                        "type": "aneesha/booking_api:0.1.0:BookingRecord?",
                        "optional": false,
                        "nillable": true,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [
                            {
                                "associate": "aneesha/booking_api:0.1.0:BookingRecord",
                                "cardinality": {
                                    "self": "1-1",
                                    "associate": "0-1"
                                }
                            }
                        ]
                    }
                ],
                "inclusions": [

                ]
            },
            "aneesha/booking_api:0.1.0:LineItemOrder": {
                "attributes": [

                ],
                "inclusions": [

                ]
            }
        }
    },
    "aneesha/reservation_api:0.1.0": {
        "packageId": {
            "name": "reservation_api",
            "org": "aneesha",
            "version": "0.1.0"
        },
        "services": {
            "0004": {
                "annotation": {
                    "id": "0004",
                    "label": ""
                },
                "lineRange": {},
                "path": "flights",
                "serviceId": "0004",
                "serviceType": "ballerina/http:2.4.0",
                "remoteFunctions": [],
                "resources": [
                    {
                        "identifier": "reservation",
                        "resourceId": {
                            "serviceId": "0004",
                            "path": "reservation",
                            "action": "post"
                        },
                        "lineRange": {},
                        "parameters": [
                            {
                                "type": [
                                    "aneesha/reservation_api:0.1.0:Reservation"
                                ],
                                "name": "reservation",
                                "in": "body",
                                "isRequired": true
                            }
                        ],
                        "returns": [
                            "aneesha/reservation_api:0.1.0:Reservation",
                            "error",
                            "null"
                        ],
                        "interactions": [
                            {
                                "resourceId": {
                                    "serviceId": "0003",
                                    "path": "booking",
                                    "action": "post"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/http:2.4.0"
                            },
                            {
                                "resourceId": {
                                    "serviceId": "0003",
                                    "path": "booking/[int]",
                                    "action": "get"
                                },
                                "lineRange": {},
                                "connectorType": "ballerina/http:2.4.0"
                            },
                            {
                                "resourceId": {
                                    "serviceId": "",
                                    "action": "sendSms"
                                },
                                "lineRange": {},
                                "connectorType": "ballerinax/twilio:3.0.0"
                            }
                        ]
                    }
                ]
            }
        },
        "entities": {
            "aneesha/reservation_api:0.1.0:Reservation": {
                "lineRange": {},
                "attributes": [
                    {
                        "name": "origin",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "destination",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    },
                    {
                        "name": "contactNo",
                        "type": "string",
                        "optional": false,
                        "nillable": false,
                        "lineRange": {},
                        "defaultValue": "",
                        "associations": [

                        ]
                    }
                ],
                "inclusions": [
                    "aneesha/inventory_api:inventory_api:0.1.0:SeatAllocation"
                ]
            }
        }
    }
}

async function retrieveResources() {
    return components;
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/DesignDiagram',
    component: DesignDiagram,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <DesignDiagram fetchProjectResources={args.retrieveResources} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    retrieveResources: retrieveResources
};
