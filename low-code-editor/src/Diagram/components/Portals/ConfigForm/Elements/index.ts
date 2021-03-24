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
import ExpressionEditor from "./ExpressionEditor";
import { FormJson } from "./Json/FormJson"
import { Record } from "./Record";
import { Union } from "./Union";
import { XML } from "./XML";

export { ExpressionEditor as string };
export { ExpressionEditor as int };
export { ExpressionEditor as boolean };
export { ExpressionEditor as float };
<<<<<<< HEAD
export { ExpressionEditor as collection };
export { ExpressionEditor as union };
export { Record as record };
=======
export { Record as record };
export { Array as collection };
export { Union as union };
>>>>>>> 7624e0e1bbff2169ca5e60f77484d046fefeb551
export { FormJson as json };
export { XML as xml };
