/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect } from "react";
import { TextField, Dropdown } from "@wso2-enterprise/ui-toolkit";

export interface DataSourceRDBMSFormProps {
    renderProps: any;
    watch: any;
    setValue: any;
}

interface OptionProps {
    value: string;
}

export function DataSourceRDBMSForm(props: DataSourceRDBMSFormProps) {

    const [isInitialLoading, setIsInitialLoading] = React.useState(true);

    const databaseEngines: OptionProps[] = [
        { value: "MySQL"},
        { value: "Apache Derby"},
        { value: "Microsoft SQL Server"},
        { value: "Oracle"},
        { value: "IBM DB2"},
        { value: "HSQLDB"},
        { value: "Informix"},
        { value: "PostgreSQL"},
        { value: "Sybase ASE"},
        { value: "H2"},
        { value: "Generic"}
    ];

    const drivers = {
        mysql: {
            driverClass: "com.mysql.jdbc.Driver",
            jdbcUrl: "jdbc:mysql://[machine-name/ip]:[port]/[database-name]",
        },
        derby: {
            driverClass: "org.apache.derby.jdbc.EmbeddedDriver",
            jdbcUrl: "jdbc:derby://[HOST]:[PORT]/[database]",
        },
        microsoft: {
            driverClass: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
            jdbcUrl: "jdbc:sqlserver://[HOST]:[PORT1433];databaseName=[DB]",
        },
        oracle: {
            driverClass: "oracle.jdbc.driver.OracleDriver",
            jdbcUrl: "jdbc:oracle:[drivertype]:[username/password]@[host]:[port]/[database]",
        },
        ibm: {
            driverClass: "com.ibm.db2.jcc.DB2Driver",
            jdbcUrl: "jdbc:db2:[database]",
        },
        hsql: {
            driverClass: "org.hsqldb.jdbcDriver",
            jdbcUrl: "jdbc:hsqldb:[path]",
        },
        informix: {
            driverClass: "com.informix.jdbc.IfxDriver",
            jdbcUrl: "jdbc:informix-sqli://[HOST]:[PORT]/[database]:INFORMIXSERVER=[server-name]",
        },
        postgre: {
            driverClass: "org.postgresql.Driver",
            jdbcUrl: "jdbc:postgresql://[HOST]:[PORT5432]/[database]",
        },
        sybase: {
            driverClass: "com.sybase.jdbc3.jdbc.SybDriver",
            jdbcUrl: "jdbc:sybase:Tds:[HOST]:[PORT2048]/[database]",
        },
        h2: {
            driverClass: "org.h2.Driver",
            jdbcUrl: "jdbc:h2:tcp:[HOST]:[PORT]/[database]",
        },
        generic: {
            driverClass: "",
            jdbcUrl: "",
        }
    }

    useEffect(() => {
        if (isInitialLoading) {
            setIsInitialLoading(false);
            if (props.watch('rdbms.driverClassName') === "" && props.watch('rdbms.url') === "") {
                props.setValue('rdbms.driverClassName', drivers.mysql.driverClass);
                props.setValue('rdbms.url', drivers.mysql.jdbcUrl);
            }
            return;
        }
        if (props.watch('rdbms.databaseEngine') === 'MySQL') {
            props.setValue('rdbms.driverClassName', drivers.mysql.driverClass);
            props.setValue('rdbms.url', drivers.mysql.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'Apache Derby') {
            props.setValue('rdbms.driverClassName', drivers.derby.driverClass);
            props.setValue('rdbms.url', drivers.derby.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'Microsoft SQL Server') {
            props.setValue('rdbms.driverClassName', drivers.microsoft.driverClass);
            props.setValue('rdbms.url', drivers.microsoft.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'Oracle') {
            props.setValue('rdbms.driverClassName', drivers.oracle.driverClass);
            props.setValue('rdbms.url', drivers.oracle.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'IBM DB2') {
            props.setValue('rdbms.driverClassName', drivers.ibm.driverClass);
            props.setValue('rdbms.url', drivers.ibm.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'HSQLDB') {
            props.setValue('rdbms.driverClassName', drivers.hsql.driverClass);
            props.setValue('rdbms.url', drivers.hsql.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'Informix') {
            props.setValue('rdbms.driverClassName', drivers.informix.driverClass);
            props.setValue('rdbms.url', drivers.informix.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'PostgreSQL') {
            props.setValue('rdbms.driverClassName', drivers.postgre.driverClass);
            props.setValue('rdbms.url', drivers.postgre.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'Sybase ASE') {
            props.setValue('rdbms.driverClassName', drivers.sybase.driverClass);
            props.setValue('rdbms.url', drivers.sybase.jdbcUrl);
        } else if (props.watch('rdbms.databaseEngine') === 'H2') {
            props.setValue('rdbms.driverClassName', drivers.h2.driverClass);
            props.setValue('rdbms.url', drivers.h2.jdbcUrl);
        } else {
            props.setValue('rdbms.driverClassName', drivers.generic.driverClass);
            props.setValue('rdbms.url', drivers.generic.jdbcUrl);
        }
    }, [props.watch('rdbms.databaseEngine')]);

    return (
        <>
            <Dropdown label="Database Engine" required items={databaseEngines} {...props.renderProps('rdbms.databaseEngine')} />
            <TextField
                label="Driver Class"
                required
                size={100}
                {...props.renderProps('rdbms.driverClassName')}
            />
            <TextField
                label="URL"
                required
                size={100}
                {...props.renderProps('rdbms.url')}
            />
            <TextField
                label="Username"
                size={100}
                {...props.renderProps('rdbms.username')}
            />
            <TextField
                label="Password"
                size={100}
                {...props.renderProps('rdbms.password')}
            />
        </>
    );
}
