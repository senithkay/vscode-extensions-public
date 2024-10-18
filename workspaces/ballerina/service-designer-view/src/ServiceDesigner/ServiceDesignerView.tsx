/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { ResourceForm } from "./components/ResourceForm/ResourceForm";
import { FunctionForm } from "./components/FunctionForm/FunctionForm";
import { ServiceDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree";
import { Resource, Service, ServiceDesigner } from "@wso2-enterprise/service-designer";
import { getService, updateServiceDecl } from "./utils/utils";
import { ServiceForm } from "./components/ServiceForm/ServiceForm";
import { ServiceDesignerAPI, CommonRPCAPI, STModification, TriggerModel } from "@wso2-enterprise/ballerina-core";
import { ContextProvider } from "./ContextProvider";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon, View, ViewHeader, ViewContent, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

const ServiceHeader = styled.div`
    padding-left: 24px;
`;

interface RPCClients {
    serviceDesignerRpcClient: ServiceDesignerAPI;
    commonRpcClient: CommonRPCAPI;
}
interface ServiceDesignerProps {
    // Model of the service. This is the ST of the service
    model?: ServiceDeclaration;
    // RPC client to communicate with the backend for ballerina
    rpcClients?: RPCClients;
    // Callback to send modifications to update source
    applyModifications?: (modifications: STModification[]) => Promise<void>;
    // Callback to send the position of the resource to navigae to code
    goToSource?: (resource: Resource) => void;
    // If the service designer is for bi
    isBI?: boolean;
    // If editing needs to be disabled
    isEditingDisabled?: boolean;
}

export function ServiceDesignerView(props: ServiceDesignerProps) {
    const { model, rpcClients, applyModifications, goToSource, isEditingDisabled } = props;

    const [serviceConfig, setServiceConfig] = useState<Service>();

    const [isResourceFormOpen, setResourceFormOpen] = useState<boolean>(false);
    const [isServiceFormOpen, setServiceFormOpen] = useState<boolean>(false);
    const [editingResource, setEditingResource] = useState<Resource>();

    const isParentBallerinaExt = !goToSource;
    const serviceDesignerRpcClient = rpcClients?.serviceDesignerRpcClient;
    const commonRpcClient = rpcClients?.commonRpcClient;

    // Callbacks for resource form
    const handleResourceFormClose = () => {
        setResourceFormOpen(false);
        setEditingResource(undefined);
    };
    const handleResourceFormOpen = () => {
        setResourceFormOpen(true);
    };
    const handleResourceEdit = async (resource: Resource) => {
        setEditingResource(resource);
        setResourceFormOpen(true);
    };
    const handleResourceDelete = async (resource: Resource) => {
        await applyModifications([{
            type: 'DELETE',
            ...resource.position
        }]);
    };
    const handleResourceFormSave = async (content: string, config: Resource, resourcePosition?: NodePosition) => {
        const position = model.closeBraceToken.position;
        position.endColumn = 0;
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": content
            },
            ...(resourcePosition ? resourcePosition : position)
        }]);
    };

    // Callbacks for service form
    const handleServiceEdit = () => {
        setServiceFormOpen(true);
    };
    const handleServiceFormClose = () => {
        setServiceFormOpen(false);
    };
    const handleServiceFormSave = async (service: Service) => {
        const content = updateServiceDecl({ BASE_PATH: service.path, PORT: `${service.port}`, SERVICE_TYPE: "http" });
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": content
            },
            ...service.position
        }]);
    };

    const handleGoToSource = (resource: Resource) => {
        if (goToSource) {
            goToSource(resource);
        } else {
            commonRpcClient.goToSource({ position: resource.position! });
        }
    };

    function getTriggersHardcoded() {
        const response: TriggerModel[] = [];
        const kafkaTriggerModel: TriggerModel = {
            name: "Kafka",
            listener: {
                bootstrapServers: {
                    required: true,
                    type: "string",
                    value: "kafka:DEFAULT_URL",
                    description: "List of remote server endpoints of Kafka brokers"
                },
                config: {
                    required: false,
                    type: "kafka:ConsumerConfiguration",
                    record: true
                }
            },
            service: {
                basePath: {
                    required: false
                },
                functions: {
                    onConsumerRecord: {
                        required: true,
                        params: {
                            records: {
                                type: "array",
                                required: true,
                                value: "anydata[]",
                                description: "Consumer records"
                            },
                            caller: {
                                type: "kafka:Caller",
                                required: false,
                                description: "Caller object"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "error?"
                        },
                        description: "Trigger function that processes consumer records"
                    },
                    onError: {
                        required: false,
                        params: {
                            err: {
                                type: "kafka:Error",
                                required: true,
                                description: "error"
                            }
                        },
                        returns: {
                            type: "error?",
                            description: "Optional error return type",
                            error: true,
                            nilable: true
                        },
                        description: "Handles errors encountered during consumption"
                    }
                }
            }
        };
        const rabbitmqTriggerModel: TriggerModel = {
            name: "RabbitMQ",
            listener: {
                host: {
                    type: "string",
                    required: true,
                    description: "The host used for establishing the connection"
                },
                port: {
                    type: "int",
                    required: true,
                    description: "The port used for establishing the connection"
                },
                qosSettings: {
                    type: "rabbitmq:QosSettings",
                    required: false,
                    description: "The consumer prefetch settings"
                },
                connectionData: {
                    type: "rabbitmq:ConnectionData",
                    required: false,
                    description: "The connection data"
                }
            },
            service: {
                basePath: {
                    required: true,
                    description: "The queue name"
                },
                functions: {
                    onMessage: {
                        required: true,
                        params: {
                            message: {
                                type: "rabbitmq:AnydataMessage",
                                required: true,
                                description: "The message"
                            },
                            caller: {
                                type: "rabbitmq:Caller",
                                required: false,
                                description: "Caller object"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "error?"
                        },
                        description: "Trigger function that processes messages"
                    },
                    onRequest: {
                        required: false,
                        params: {
                            message: {
                                type: "rabbitmq:AnydataMessage",
                                required: true,
                                description: "The message"
                            },
                            caller: {
                                type: "rabbitmq:Caller",
                                required: false,
                                description: "Caller object"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "anydata|error?"
                        },
                        description: "Trigger function that processes requests"
                    },
                    onError: {
                        required: false,
                        params: {
                            message: {
                                type: "rabbitmq:AnydataMessage",
                                required: true,
                                description: "The message"
                            },
                            err: {
                                type: "rabbitmq:Error",
                                required: true,
                                description: "error"
                            }
                        },
                        returns: {
                            type: "error?",
                            error: true,
                            nilable: true
                        },
                        description: "Handles errors encountered during consumption"
                    }
                }
            }
        };
        const natsTriggerModel: TriggerModel = {
            name: "NATS",
            listener: {
                url: {
                    type: "string|string[]",
                    required: true,
                    description: "The NATS broker URL. For a clustered use case, provide the URLs as a string array"
                },
                config: {
                    type: "nats:ConnectionConfiguration",
                    required: false,
                    description: "The connection configurations"
                }
            },
            service: {
                basePath: {
                    required: true,
                    description: "The subject name"
                },
                functions: {
                    onMessage: {
                        required: true,
                        params: {
                            message: {
                                type: "nats:AnydataMessage",
                                required: true,
                                description: "The message"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "error?"
                        },
                        description: "Trigger function that processes messages"
                    },
                    onRequest: {
                        required: false,
                        params: {
                            "message": {
                                type: "nats:AnydataMessage",
                                required: true,
                                description: "The message"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "anydata|error?"
                        },
                        description: "Trigger function that processes requests"
                    },
                    onError: {
                        required: false,
                        params: {
                            "message": {
                                type: "nats:AnydataMessage",
                                required: true,
                                description: "The message"
                            },
                            "err": {
                                type: "nats:Error",
                                required: true,
                                description: "error"
                            }
                        },
                        returns: {
                            type: "error?",
                            error: true,
                            nilable: true
                        },
                        description: "Handles errors encountered during consumption"
                    }
                }
            }
        };
        const mqttTriggerModel: TriggerModel = {
            name: "MQTT",
            listener: {
                serverUri: {
                    type: "string",
                    required: true,
                    description: "The URI of the remote MQTT server"
                },
                clientId: {
                    type: "string",
                    required: true,
                    description: "The unique client ID to identify the listener"
                },
                subscriptions: {
                    type: "string|string[]|mqtt:Subscription|mqtt:Subscription[]",
                    required: true,
                    description: "The topics to be subscribed to"
                },
                config: {
                    type: "mqtt:ListenerConfiguration",
                    required: false,
                    description: "The listener configurations"
                }
            },
            service: {
                basePath: {
                    required: false
                },
                functions: {
                    onMessage: {
                        required: true,
                        params: {
                            message: {
                                type: "mqtt:Message",
                                required: true,
                                description: "The message"
                            },
                            caller: {
                                type: "mqtt:Caller",
                                required: false,
                                description: "Caller object"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "error?"
                        },
                        description: "Trigger function that processes messages"
                    },
                    onError: {
                        required: false,
                        params: {
                            err: {
                                type: "mqtt:Error",
                                required: true,
                                description: "error"
                            }
                        },
                        returns: {
                            type: "error?",
                            error: true,
                            nilable: true
                        },
                        description: "Handles errors encountered during consumption"
                    },
                    onComplete: {
                        required: false,
                        params: {
                            token: {
                                type: "mqtt:DeliveryToken",
                                required: true,
                                description: "The delivery token"
                            }
                        },
                        returns: {
                            type: "error?",
                            error: true,
                            nilable: true
                        },
                        description: "Trigger function on message delivery completion"
                    }
                }
            }
        };
        const jmsTriggerModel: TriggerModel = {
            name: "JMS",
            listener: {
                listenerConfig: {
                    type: "jms:MessageListenerConfigurations",
                    required: true,
                    description: "Message listener configurations"
                }
            },
            service: {
                basePath: {
                    required: false
                },
                functions: {
                    onMessage: {
                        required: true,
                        params: {
                            message: {
                                type: "jms:Message",
                                required: true,
                                description: "The message"
                            },
                            caller: {
                                type: "jms:Caller",
                                required: false,
                                description: "Caller object"
                            }
                        },
                        returns: {
                            error: true,
                            nilable: true,
                            type: "error?"
                        },
                        description: "Trigger function that processes messages"
                    },
                    onError: {
                        required: false,
                        params: {
                            err: {
                                type: "jms:Error",
                                required: true,
                                description: "error"
                            }
                        },
                        returns: {
                            type: "error?",
                            error: true,
                            nilable: true
                        },
                        description: "Handles errors encountered during consumption"
                    }
                }
            }
        };
        response.push(kafkaTriggerModel);
        response.push(rabbitmqTriggerModel);
        response.push(natsTriggerModel);
        response.push(mqttTriggerModel);
        response.push(jmsTriggerModel);
        return response;
    }

    useEffect(() => {
        const fetchService = async () => {
            const res = getTriggersHardcoded();
            let selectedTrigger;
            res.forEach(val => {
                if (model.source.toLowerCase().includes(val.name.toLowerCase())) {
                    selectedTrigger = val;
                }
            })
            setServiceConfig(await getService(model, serviceDesignerRpcClient, props.isBI, handleResourceEdit, handleResourceDelete, selectedTrigger));
        };
        fetchService();
    }, [model]);

    const addNameRecord = async (source: string) => {
        const position = model.closeBraceToken.position;
        position.startColumn = position.endColumn;
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": source
            },
            ...position
        }]);
    };

    const handleExportOAS = () => {
        serviceDesignerRpcClient.exportOASFile({});
    };

    const title = serviceConfig?.triggerModel ? `${serviceConfig?.triggerModel.name} Trigger` : `Service ${serviceConfig?.path}`;

    return (
        <ContextProvider commonRpcClient={commonRpcClient} applyModifications={applyModifications} serviceEndPosition={model?.closeBraceToken.position}>
            <div data-testid="service-design-view">
                <View>
                    <ViewHeader title={title} codicon="globe" onEdit={!isEditingDisabled && !serviceConfig?.triggerModel && handleServiceEdit}>
                        {!isEditingDisabled &&
                            <VSCodeButton appearance="primary" title="Add Resource" onClick={handleResourceFormOpen}>
                                <Codicon name="add" sx={{ marginRight: 5 }} /> {serviceConfig?.triggerModel ? `Function` : 'Resource'}
                            </VSCodeButton>
                        }
                        {!serviceConfig?.triggerModel && <VSCodeButton appearance="secondary" title="Export OAS" onClick={handleExportOAS}>
                            <Codicon name="export" sx={{ marginRight: 5 }} /> Export OAS
                        </VSCodeButton>
                        }
                    </ViewHeader>
                    <ServiceHeader>
                        {isEditingDisabled && <Typography sx={{ marginBlockEnd: 10 }} variant="caption">This is generated from {serviceConfig?.path} contract</Typography>}
                        {serviceConfig?.port && <Typography sx={{ marginBlockEnd: 10 }} variant="caption">Listening on: {serviceConfig.port}</Typography>}
                        {serviceConfig?.listener && <Typography sx={{ marginBlockEnd: 10 }} variant="caption">Remote Endpoint: {serviceConfig.listener}</Typography>}
                    </ServiceHeader>
                    <ViewContent padding>
                        <ServiceDesigner
                            customTitle={serviceConfig?.triggerModel ? `Available functions` : 'Available resources'}
                            model={serviceConfig}
                            onResourceClick={handleGoToSource}
                            disableServiceHeader={props.isBI}
                        />
                    </ViewContent>
                </View>
                {isResourceFormOpen && !serviceConfig?.triggerModel &&
                    <ResourceForm
                        isOpen={isResourceFormOpen}
                        isBallerniaExt={isParentBallerinaExt}
                        resourceConfig={serviceConfig.resources.length > 0 ? editingResource : undefined}
                        onSave={handleResourceFormSave}
                        onClose={handleResourceFormClose}
                        addNameRecord={addNameRecord}
                        commonRpcClient={commonRpcClient}
                        applyModifications={applyModifications}
                    />
                }
                {isResourceFormOpen && serviceConfig?.triggerModel &&
                    <FunctionForm
                        isOpen={isResourceFormOpen}
                        isBallerniaExt={isParentBallerinaExt}
                        resourceConfig={serviceConfig.resources.length > 0 ? editingResource : undefined}
                        onSave={handleResourceFormSave}
                        onClose={handleResourceFormClose}
                        addNameRecord={addNameRecord}
                        commonRpcClient={commonRpcClient}
                        applyModifications={applyModifications}
                    />
                }
                {isServiceFormOpen &&
                    <ServiceForm
                        isOpen={isServiceFormOpen}
                        serviceConfig={serviceConfig}
                        onSave={handleServiceFormSave}
                        onClose={handleServiceFormClose}
                    />
                }
            </div>
        </ContextProvider>
    )
}
