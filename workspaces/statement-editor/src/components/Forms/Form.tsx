/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FunctionForm } from "./FunctionForm/FunctionForm";
import { GraphqlClassForm } from "./GraphqlForms/GraphqlClassForm";
import { GraphqlMutationForm } from "./GraphqlForms/GraphqlMutationForm";
import { GraphqlResourceForm } from "./GraphqlForms/GraphqlResourceForm";
import { GraphqlSubscriptionForm } from "./GraphqlForms/GraphqlSubscriptionForm";
import { ServiceClassResourceForm } from "./GraphqlForms/ServiceClassResource";
import { ListenerForm } from "./ListenerForm/ListenerForm";
import { ResourceForm } from "./ResourceForm/ResourceForm";
import { ServiceConfigForm } from "./ServiceForm/SeviceForm";

export { FunctionForm as Function };
export { ServiceConfigForm as Service };
export { ListenerForm as Listener };
export { ListenerForm as GraphqlListener };
export { FunctionForm as Main };
export { ResourceForm as Resource };
export { GraphqlClassForm as GraphqlClass };
export { GraphqlResourceForm as GraphqlResource };
export { GraphqlMutationForm as GraphqlMutation };
export { GraphqlSubscriptionForm as GraphqlSubscription };
export { ServiceClassResourceForm as ServiceClassResource };
