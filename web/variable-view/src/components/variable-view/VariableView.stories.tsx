import { storiesOf } from '@storybook/react';
import { VariableView } from './VariableView';

const getVariableValues = (): Promise<Object[]> => {
    return Promise.resolve([{
        name: "a",
        type: "int",
        value: 10
    },
    {
        name: "b",
        type: "string",
        value: "hello world"
    },
    {
        name: "result",
        type: "int|error",
        value: "error(\"{ballerina}DivisionByZero\",message=\" / by zero\")"
    },
    {
        name: "tableData",
        type: "table<Employee> key(username)",
        value: "table key(username) [{\"username\":\"John\",\"salary\":100,\"fullname\":{\"firstname\":\"John\",\"lastname\":\"Doe\"}},{\"username\":\"Adam\",\"salary\":300,\"fullname\":{\"firstname\":\"Adam\",\"lastname\":\"Smith\"}},{\"username\":\"Jake\",\"salary\":100,\"fullname\":{\"firstname\":\"jake\",\"lastname\":\"Peralta\"}}]"
    }]);
}

storiesOf("Variable view", module)
  .add("Variable view table", () => (
    <VariableView getVariableValues={getVariableValues} />
  ));
