/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

/**
 * @description gets the HL7v2 input message and sanitizes it
 *
 * @param hl7v2Message - HL7v2 input message
 * @returns sanitized HL7v2 input message
 */
export function sanitizeHL7v2(hl7v2Message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const window = new JSDOM("").window;
      const purify = DOMPurify(window);
      let cleanedInput: string = purify.sanitize(hl7v2Message);
      resolve(cleanedInput); // Resolve the promise with the sanitized input
    } catch (error) {
      reject(error); // Reject the promise if there's an error
    }
  });
}
