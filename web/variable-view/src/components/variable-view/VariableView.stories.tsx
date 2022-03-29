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
    }]);
}

storiesOf("Variable view", module)
  .add("Variable view table", () => (
    <VariableView getVariableValues={getVariableValues} />
  ));
