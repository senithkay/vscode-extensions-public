/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { ConditionConfigForm } from "../../../ConfigForms/ConditionConfigForms";
import { EndConfigForm } from "../../../ConfigForms/EndConfigForms";
import { ProcessConfigForm } from "../../../ConfigForms/ProcessConfigForms";

import { APIConfigForm } from "./APIConfigForm";
import { ConnectorInitForm } from "./ConnectorInitForm";
import { ScheduleConfigForm } from "./ScheduleConfigForm";
import { WebhookConfigForm } from "./WebhookConfigForm";

export { WebhookConfigForm as webhookConfig };
export { ScheduleConfigForm as scheduleConfig };
export { APIConfigForm as apiConfig };
export { ConnectorInitForm as connectorInit };
export { ConditionConfigForm as If };
export { ConditionConfigForm as ForEach };
export { ProcessConfigForm as Variable };
export { ProcessConfigForm as Log };
export { EndConfigForm as Return };
export { EndConfigForm as Respond };
