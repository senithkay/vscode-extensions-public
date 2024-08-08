/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DbMediator, DbMediatorConnectionPool } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getDBLookupMustacheTemplate() {
    return `
    <dblookup {{#description}}description="{{description}}"{{/description}} >
        <connection>
            <pool>
                {{#isDbConnection}}
                {{#isRegistryBasedDriverConfig}}
                {{#registryBasedConnectionDBDriver}}<driver key="{{registryBasedConnectionDBDriver}}" />{{/registryBasedConnectionDBDriver}}
                {{/isRegistryBasedDriverConfig}}
                {{^isRegistryBasedDriverConfig}}
                {{#connectionDBDriver}}<driver>{{connectionDBDriver}}</driver>{{/connectionDBDriver}}
                {{/isRegistryBasedDriverConfig}}
                {{#isRegistryBasedURLConfig}}
                {{#registryBasedURLConfigKey}}<url key="{{registryBasedURLConfigKey}}" />{{/registryBasedURLConfigKey}}
                {{/isRegistryBasedURLConfig}}
                {{^isRegistryBasedURLConfig}}
                {{#connectionURL}}<url>{{connectionURL}}</url>{{/connectionURL}}
                {{/isRegistryBasedURLConfig}}
                {{#isRegistryBasedUserConfig}}
                {{#registryBasedUserConfigKey}}<user key="{{registryBasedUserConfigKey}}" />{{/registryBasedUserConfigKey}}
                {{/isRegistryBasedUserConfig}}
                {{^isRegistryBasedUserConfig}}
                {{#connectionUsername}}<user>{{connectionUsername}}</user>{{/connectionUsername}}
                {{/isRegistryBasedUserConfig}}
                {{#isRegistryBasedPassConfig}}
                {{#registryBasedPassConfigKey}}<password key="{{registryBasedPassConfigKey}}" />{{/registryBasedPassConfigKey}}
                {{/isRegistryBasedPassConfig}}
                {{^isRegistryBasedPassConfig}}
                {{#connectionPassword}}<password>{{connectionPassword}}</password>{{/connectionPassword}}
                {{/isRegistryBasedPassConfig}}
                {{/isDbConnection}}
                {{^isDbConnection}}
                {{#connectionDSName}}<dsName>{{connectionDSName}}</dsName>{{/connectionDSName}}
                {{#connectionDSInitialContext}}<icClass>{{connectionDSInitialContext}}</icClass>{{/connectionDSInitialContext}}
                {{^isCarbonDs}}
                {{#isRegistryBasedURLConfig}}
                {{#registryBasedURLConfigKey}}<url>{{registryBasedURLConfigKey}}</url>{{/registryBasedURLConfigKey}}
                {{/isRegistryBasedURLConfig}}
                {{^isRegistryBasedURLConfig}}
                {{#connectionURL}}<url>{{connectionURL}}</url>{{/connectionURL}}
                {{/isRegistryBasedURLConfig}}
                {{#isRegistryBasedUserConfig}}
                {{#registryBasedUserConfigKey}}<user>{{registryBasedUserConfigKey}}</user>{{/registryBasedUserConfigKey}}
                {{/isRegistryBasedUserConfig}}
                {{^isRegistryBasedUserConfig}}
                {{#connectionUsername}}<user>{{connectionUsername}}</user>{{/connectionUsername}}
                {{/isRegistryBasedUserConfig}}
                {{#isRegistryBasedPassConfig}}
                {{#registryBasedPassConfigKey}}<password>{{registryBasedPassConfigKey}}</password>{{/registryBasedPassConfigKey}}
                {{/isRegistryBasedPassConfig}}
                {{^isRegistryBasedPassConfig}}
                {{#connectionPassword}}<password>{{connectionPassword}}</password>{{/connectionPassword}}
                {{/isRegistryBasedPassConfig}}
                {{/isCarbonDs}}
                {{/isDbConnection}}
                {{#properties}}
                <property name="{{propertyName}}" value="{{propertyValue}}" />
                {{/properties}}
            </pool>
        </connection>
        {{#sqlStatements}}
        <statement>
            <sql><![CDATA[{{{queryString}}}]]></sql>
            {{#parameters}}
            <parameter {{#valueExpression}}expression="{{valueExpression}}"{{/valueExpression}} {{#valueLiteral}}value="{{valueLiteral}}"{{/valueLiteral}} type="{{dataType}}"/>
            {{/parameters}}
            {{#results}}
            <result column="{{columnId}}" name="{{propertyName}}"/>
            {{/results}}
        </statement>
        {{/sqlStatements}}
    </dblookup>
    `;

}

export function getDblookupXml(data: { [key: string]: any }) {

    let isDbConnection = false;
    if (data.connectionType === 'DB_CONNECTION') {
        isDbConnection = true;
    }

    let isCarbonDs = false;
    if (data.connectionType === 'CARBON') {
        isCarbonDs = true;
    }

    const properties = getProperties(data);

    data.sqlStatements = data.sqlStatements.map((statement: any[]) => {
        return {
            queryString: statement[0],
            parameters: statement[1].map((parameter: any) => {
                return {
                    dataType: parameter[0],
                    valueLiteral: parameter[1] == "LITERAL" ? parameter[2] : undefined,
                    valueExpression: parameter[1] == "EXPRESSION" ? parameter[3]?.value : undefined
                }
            }),
            results: statement[2].map((result: any) => {
                return {
                    propertyName: result[0],
                    columnId: result[1]
                }
            })
        }
    });

    const modifiedData = {
        ...data,
        isDbConnection: isDbConnection,
        isCarbonDs: isCarbonDs,
        properties: properties
    }

    const output = Mustache.render(getDBLookupMustacheTemplate(), modifiedData);
    return output;
}

function getProperties(data: { [key: string]: any }) {
    let properties = [];
    if (data.propertyAutocommit !== "DEFAULT") {
        properties.push({
            propertyName: "autocommit",
            propertyValue: data.propertyAutocommit
        })
    }
    if (data.propertyIsolation !== "DEFAULT") {
        properties.push({
            propertyName: "isolation",
            propertyValue: data.propertyIsolation
        })
    }
    if (data.propertyMaxActive !== "-1") {
        properties.push({
            propertyName: "maxactive",
            propertyValue: data.propertyMaxActive
        })
    }
    if (data.propertyMaxIdle !== "-1") {
        properties.push({
            propertyName: "maxidle",
            propertyValue: data.propertyMaxIdle
        })
    }
    if (data.propertyMaxOpenStatements !== "-1") {
        properties.push({
            propertyName: "maxopenstatements",
            propertyValue: data.propertyMaxOpenStatements
        })
    }
    if (data.propertyMaxWait !== "-1") {
        properties.push({
            propertyName: "maxwait",
            propertyValue: data.propertyMaxWait
        })
    }
    if (data.propertyMinIdle !== "-1") {
        properties.push({
            propertyName: "minidle",
            propertyValue: data.propertyMinIdle
        })
    }
    if (data.propertyPoolStatements !== "DEFAULT") {
        properties.push({
            propertyName: "poolstatements",
            propertyValue: data.propertyPoolStatements
        })
    }
    if (data.propertyTestOnBorrow !== "DEFAULT") {
        properties.push({
            propertyName: "testonborrow",
            propertyValue: data.propertyTestOnBorrow
        })
    }
    if (data.propertyTestWhileIdle !== "DEFAULT") {
        properties.push({
            propertyName: "testwhileidle",
            propertyValue: data.propertyTestWhileIdle
        })
    }
    if (data.propertyValidationQuery) {
        properties.push({
            propertyName: "validationquery",
            propertyValue: data.propertyValidationQuery
        })
    }
    if (data.propertyInitialSize !== "-1") {
        properties.push({
            propertyName: "initialsize",
            propertyValue: data.propertyInitialSize
        })
    }
    return properties;
}

export function getDBLookupFormDataFromSTNode(data: { [key: string]: any }, node: DbMediator) {

    data.description = node.description;
    const pool = node.connection?.pool;
    if (pool) {
        data.connectionDBType = findConnectionType(pool);
        const driver = pool.driver;
        if (driver?.key) {
            data.isRegistryBasedDriverConfig = true;
            data.registryBasedConnectionDBDriver = driver.key;
        } else {
            data.isRegistryBasedDriverConfig = false;
            data.connectionDBDriver = driver?.textNode;
        }
        const url = pool.url;
        if (url?.key) {
            data.isRegistryBasedURLConfig = true;
            data.registryBasedURLConfigKey = url.key;
        } else {
            data.isRegistryBasedURLConfig = false;
            data.connectionURL = url?.textNode;
        }
        const user = pool.user;
        if (user?.key) {
            data.isRegistryBasedUserConfig = true;
            data.registryBasedUserConfigKey = user.key;
        } else {
            data.isRegistryBasedUserConfig = false;
            data.connectionUsername = user?.textNode;
        }
        const password = pool.password;
        if (password?.key) {
            data.isRegistryBasedPassConfig = true;
            data.registryBasedPassConfigKey = password.key;
        } else {
            data.isRegistryBasedPassConfig = false;
            data.connectionPassword = password?.textNode;
        }
        data.connectionDSName = pool.dsName?.textNode;
        data.connectionDSInitialContext = pool.icClass?.textNode;
        if (data.connectionDBDriver) {
            data.connectionType = "DB_CONNECTION";
        } else {
            data.connectionType = "DATA_SOURCE";
        }
        getPropertiesFromPool(pool.property, data);
    }

    data.sqlStatements = node.statement.map((statement: any) => {
        const match = statement?.sql?.match(/<!\[CDATA\[(.*?)]]>/);
        let sql = match ? match[1] : statement?.sql;
        return [
            sql,
            statement?.parameter?.map((parameter: any) => {
                let param = [
                    parameter.type,
                    parameter.value ? "LITERAL" : "EXPRESSION",
                    parameter.value,
                    { isExpression: true, value: parameter?.expression }
                ];
                return param;
            }) ?? [],
            statement?.result?.map((result: any) => {
                let res = [
                    result.name,
                    result.column
                ];
                return res;
            }) ?? []
        ]
    });
    return data;
}

function getPropertiesFromPool(properties: any[], data: { [key: string]: any }) {
    const defaults = {
        propertyAutocommit: "DEFAULT",
        propertyIsolation: "DEFAULT",
        propertyMaxActive: "-1",
        propertyMaxIdle: "-1",
        propertyMaxOpenStatements: "-1",
        propertyMaxWait: "-1",
        propertyMinIdle: "-1",
        propertyPoolStatements: "DEFAULT",
        propertyTestOnBorrow: "DEFAULT",
        propertyTestWhileIdle: "DEFAULT",
    };

    properties.forEach(property => {
        switch (property.name) {
            case "autocommit":
                data.propertyAutocommit = property.value;
                break;
            case "isolation":
                data.propertyIsolation = property.value;
                break;
            case "maxactive":
                data.propertyMaxActive = property.value;
                break;
            case "maxidle":
                data.propertyMaxIdle = property.value;
                break;
            case "maxopenstatements":
                data.propertyMaxOpenStatements = property.value;
                break;
            case "maxwait":
                data.propertyMaxWait = property.value;
                break;
            case "minidle":
                data.propertyMinIdle = property.value;
                break;
            case "poolstatements":
                data.propertyPoolStatements = property.value;
                break;
            case "testonborrow":
                data.propertyTestOnBorrow = property.value;
                break;
            case "testwhileidle":
                data.propertyTestWhileIdle = property.value;
                break;
            case "validationquery":
                data.propertyValidationQuery = property.value;
                break;
            case "initialsize":
                data.propertyInitialSize = property.value;
                break;
            default:
                break;
        }
    });

    Object.entries(defaults).forEach(([key, value]) => {
        if (!(key in data)) {
            data[key] = value;
        }
    });
}

function findConnectionType(pool: DbMediatorConnectionPool): any {
    let driver = pool?.driver?.textNode;
    let url = pool?.url?.textNode;
    if (driver == "com.mysql.jdbc.Driver" && url?.startsWith("jdbc:mysql://")) {
        return "MYSQL";
    } else if (driver == "oracle.jdbc.OracleDriver" && url?.startsWith("jdbc:oracle:thin:")) {
        return "ORACLE";
    } else if (driver == "com.microsoft.sqlserver.jdbc.SQLServerDriver" && url?.startsWith("jdbc:sqlserver://")) {
        return "MSSQL";
    } else if (driver == "org.postgresql.Driver" && url?.startsWith("jdbc:postgresql://")) {
        return "POSTGRESQL";
    } else {
        return "OTHER";
    }
}
