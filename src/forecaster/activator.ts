/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { log } from "../utils";
import { commands, ExtensionContext, languages, Range } from "vscode";
import { BallerinaExtension, LANGUAGE } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
const https = require('https');

export const FORECAST_PERFORMANCE_COMMAND = "ballerina.forecast.performance";
export const SHOW_GRAPH_COMMAND = "ballerina.forecast.performance.showGraph";

const CHOREO_API = "app.dv.choreo.dev";
const CHOREO_API_PATH = "/get_estimations/2.0";

export enum ANALYZETYPE {
    ADVANCED = "advanced",
}

export class DataLabel {
    private file: String;
    private range: Range;
    private label: String;

    constructor(file: String, range: Range, name: String) {
        this.file = file;
        this.range = range;
        this.label = name;
    }

    public get getFile(): String {
        return this.file;
    }

    public get getRange(): Range {
        return this.range;
    }

    public get getLabel(): String {
        return this.label;
    }

}

/**
 * Endpoint performance analyzer.
 */
export async function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;

    const getEndpoints = commands.registerCommand(FORECAST_PERFORMANCE_COMMAND, async (...args: any[]) => {
        if (args.length == 2) {
            await getPerformance(args[0], args[1]).then(graphData => {
                addPerformanceLabels(graphData);
            }).catch(error => {
                // Error
            });

        }
    });
    context.subscriptions.push(getEndpoints);

    if ((ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled())) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }],
            new ExecutorCodeLensProvider(ballerinaExtInstance));
    }
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function getPerformance(data: string, analyzeType: ANALYZETYPE): Promise<JSON> {
    return new Promise((resolve, reject) => {

        var jsonData = JSON.parse(data);
        jsonData["analyzeType"] = analyzeType;
        data = JSON.stringify(jsonData)
        const options = {
            hostname: CHOREO_API,
            port: 443,
            path: CHOREO_API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': 'Bearer eyJ4NXQiOiJOVGd5TTJabE9XVTJOV00zWlRVeFpESTRNamsyTWpoa1pEVTFOak15TjJZMlpHRTBPV1ExTVRFek9HVmtabVl4WlRVMU9Ea3dOekV6TnpjNU9EVXpaZyIsImtpZCI6Ik5UZ3lNMlpsT1dVMk5XTTNaVFV4WkRJNE1qazJNamhrWkRVMU5qTXlOMlkyWkdFME9XUTFNVEV6T0dWa1ptWXhaVFUxT0Rrd056RXpOemM1T0RVelpnX1JTMjU2IiwiYWxnIjoiUlMyNTYifQ.eyJhdF9oYXNoIjoiZVc0RTdGWGg2RFBKdHlVM1dJbXRpZyIsInN1YiI6IjBhYjQ2ODM0LTE4YjktNDA4OC1hY2RlLWM1MzQwNmRkMGMwYSIsImFtciI6WyJHb29nbGVPSURDQXV0aGVudGljYXRvciJdLCJpc3MiOiJodHRwczpcL1wvaWQuZHYuY2hvcmVvLmRldjo0NDNcL29hdXRoMlwvdG9rZW4iLCJub25jZSI6ImF1dGgiLCJzaWQiOiI4MzIyNGRjOS0zY2Q4LTRkMDQtYTMwZi1kYzU4MjE5MjEyNzEiLCJhdWQiOlsiY2hvcmVvcG9ydGFsYXBwbGljYXRpb24iLCJodHRwczpcL1wvaWQuZHYuY2hvcmVvLmRldjo0NDNcL29hdXRoMlwvdG9rZW4iLCJodHRwczpcL1wvaWQtcHJlZGV2LmR2LmNob3Jlby5kZXY6NDQzXC9vYXV0aDJcL3Rva2VuIl0sImNfaGFzaCI6IlZUUTh2Y01uYUpQMDdfTTJfMWtXTXciLCJuYmYiOjE2MzMzMTk3OTgsImF6cCI6ImNob3Jlb3BvcnRhbGFwcGxpY2F0aW9uIiwibmFtZSI6IkNoYW11cGF0aGkgR2lnYXJhIEhldHRpZ2UiLCJleHAiOjE2MzMzMzA1OTgsImdvb2dsZV9waWNfdXJsIjoiaHR0cHM6XC9cL2xoMy5nb29nbGV1c2VyY29udGVudC5jb21cL2EtXC9BT2gxNEdnZkE3blVrdGY5T2dMNk1LUGZNeWtPVDN3clFyU0oyRXBNWWYxbj1zOTYtYyIsImlhdCI6MTYzMzMxOTc5OCwiZW1haWwiOiJjaGFtdXBhdGhpQHdzbzIuY29tIn0',
                'Cookie': '_ga_3VHSXCWY7J=GS1.1.1633319786.11.1.1633319874.0; _ga=GA1.2.602192426.1632500203; _vis_opt_s=4%7C; _vwo_uuid=D5CC52CBD6AC2DBD8B36D8EC396D15717; _vwo_ds=3%3Aa_0%2Ct_0%3A0%241632500208%3A26.47808838%3A%3A%3A15_0%2C5_0%3A2; _vis_opt_exp_31_combi=1; _gaexp=GAX1.2.0yOzh_W4SnWZq-1-B7ULuw.18976.0; _gid=GA1.2.618768812.1633317915; _vis_opt_test_cookie=1; _vwo_sn=819569%3A3; cwatf=h2Z4-_KTsIkIEzxIRtqZTLjBI30yhqh_7f5qjXOg58EHQKdTju25C6sg3EuorJ0Gmblkn40kzIKyaIX4OsOUQtGZ8ZkH51eLv2bjyFajKB2wgWsmbFnR5nRsIDP-sa3YJqPNIlnDbEdyF7ypIj4TQ0PYv3OeohbviffdiSsWY__dJL5QnUWPS-wKtPK4Y4oGwzzrNZHV8EZJk_4Rbzct-c79aGZbRY2RHskKuvlFWF2Ptxlyj3Br7F27hI1LzAUu_oDtq6TlKl8TbS4Q_t8ZZVEPH6h5T0TTH0jkmp7mYZZ3FpKErahX1n_ZONqZIndTlF2WhRV0iDxAtH8L0_x8CQ'
            }
        }

        const req = https.request(options, res => {

            res.on('data', data => {
                var jsonObject = JSON.parse(data);
                log(jsonObject);
                resolve(jsonObject);
            })
        })

        req.on('error', error => {
            console.error(error);
            reject();
        })

        req.write(data);
        req.end();

    });
}

function addPerformanceLabels(graphData: JSON) {
    const sequenceDiagramData = graphData["sequenceDiagramData"];
    const last = sequenceDiagramData[sequenceDiagramData.length - 1];
    const values = last["values"];

    let dataLabels: DataLabel[] = [];
    for (let i = 0; i < values.length; i++) {
        const name = values[i]["name"].replace("(", "").replace(")", "").split("/");
        const latency = values[i]["latency"];
        const file = name[0];
        const pos = name[1].split(",");
        const start = pos[0].split(":");
        const end = pos[1].split(":");
        const range = new Range(parseInt(start[0]), parseInt(start[1]), parseInt(end[0]), parseInt(end[1]));
        const dataLabel = new DataLabel(file, range, latency)
        dataLabels.push(dataLabel);

    }
    ExecutorCodeLensProvider.addDataLabels(dataLabels);
}
