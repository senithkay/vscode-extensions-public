/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import axios from "axios";

interface Request {
  url: string;
  headers: any;
  method: any;
  body?: any;
}

export class HttpClient {

  async sendRequest(data: Request): Promise<JSON> {
    const headers = data.headers as unknown as Record<string, string>;
    return axios({
      method: data.method,
      headers,
      url: data.url,
      data: data.body
    })
      .then(function (response) {
        if (response.status != 200) {
          console.log(`API Error - ${response.status} Status code. ${new Date()}`);
          console.log(response);
          throw new Error();
        }

        let responseData = response.data;
        if (typeof responseData === 'object') responseData = JSON.stringify(responseData);
        try {
          const res = JSON.parse(responseData);
          console.log(`API Data received ${new Date()}`);
          console.log(res);

          return res;
        } catch (e: any) {
          console.log(`Error - Response json parsing failed.${new Date()}`);
          console.log(responseData);
          console.log(e.toString());
          throw e;
        }

      })
      .catch((error) => {
        console.log(`API call Error - ${error}. ${new Date()}`);
        throw error;
      });
  }
}
