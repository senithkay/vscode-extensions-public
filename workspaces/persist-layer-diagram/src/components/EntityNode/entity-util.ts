/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

export function extractAttributeType(retrievedType: string) {
    let attributeType: string = '';

    if (retrievedType) {
        if (retrievedType.includes(':') && retrievedType.includes('|')) {
            let types: string[] = retrievedType.split('|');
            types.forEach((type, index) => {
                attributeType = attributeType + type.slice(type.lastIndexOf(':') + 1);
    
                if (index != types.length - 1) {
                    attributeType = attributeType + '|';
                }
            })
        } else {
            attributeType = retrievedType.slice(retrievedType.lastIndexOf(':') + 1);
        }
    }

    return attributeType;
}
