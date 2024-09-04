/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ParamConfig } from "@wso2-enterprise/mi-diagram";

export interface OptionProps {
    value: string;
    id?: string;
}
export const engineOptions: OptionProps[] = [
    { value: "MySQL", id: "1" },
    { value: "Apache Derby", id: "2" },
    { value: "Microsoft SQL Server", id: "3" },
    { value: "Oracle", id: "4" },
    { value: "IBM DB2", id: "5" },
    { value: "HSQLDB", id: "6" },
    { value: "Informix", id: "7" },
    { value: "PostgreSQL", id: "8" },
    { value: "Sybase ASE", id: "9" },
    { value: "H2", id: "10" },
    { value: "Generic", id: "11" }
];

export const driverMap = new Map([
    ["MySQL", { driver: "com.mysql.jdbc.Driver", url: "jdbc:mysql://[HOST]:[PORT]/[DATABASE]" }],
    ["Apache Derby", { driver: "org.apache.derby.jdbc.EmbeddedDriver", url: "jdbc:derby://[HOST]:[PORT]/[DATABASE]" }],
    ["Microsoft SQL Server", { driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver", url: "jdbc:sqlserver://[HOST]:[PORT];databaseName=[DATABASE]" }],
    ["Oracle", { driver: "oracle.jdbc.driver.OracleDriver", url: "jdbc:oracle:thin:@//[HOST]:[PORT]/[DATABASE]" }],
    ["IBM DB2", { driver: "com.ibm.db2.jcc.DB2Driver", url: "jdbc:db2:[DATABASE]" }],
    ["HSQLDB", { driver: "org.hsqldb.jdbcDriver", url: "jdbc:hsqldb:[path]" }],
    ["Informix", { driver: "com.informix.jdbc.IfxDriver", url: "jdbc:informix-sqli://[HOST]:[PORT]/[DATABASE]:INFORMIXSERVER=[HOST]" }],
    ["PostgreSQL", { driver: "org.postgresql.Driver", url: "jdbc:postgresql://[HOST]:[PORT]/[DATABASE]" }],
    ["Sybase ASE", { driver: "com.sybase.jdbc3.jdbc.SybDriver", url: "jdbc:sybase:Tds:[HOST]:[PORT]/[DATABASE]" }],
    ["H2", { driver: "org.h2.Driver", url: "jdbc:h2:tcp:[HOST]:[PORT]/[DATABASE]" }],
    ["Generic", { driver: "Generic", url: "Generic" }]
]);

export const propertyParamConfigs: ParamConfig = {
    paramValues: [],
    paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Property Name",
            defaultValue: "",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Property Value",
            defaultValue: "",
            isRequired: true
        },
    ]
};