export interface HTTPServiceConfigState {
    serviceBasePath: string;
    listenerConfig: ListenerConfigFormState,
    hasInvalidConfig?: boolean
}

export interface ListenerConfigFormState {
    createNewListener?: boolean;
    fromVar?: boolean,
    listenerName?: string,
    listenerPort?: string,
}

export interface ServiceConfigState {
    serviceBasePath: string;
    listenerConfig: ListenerConfigFormState,
    serviceType?: string
}