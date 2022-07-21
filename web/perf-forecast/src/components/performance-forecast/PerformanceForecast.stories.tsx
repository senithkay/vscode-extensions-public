
import { Meta } from '@storybook/react';
import React from 'react';

import { PerformanceForecast }  from './PerformanceForecast';

const data = [
  {
      "concurrency": 1,
      "latency": 144.214,
      "thinkTime": 0,
      "tps": 6.934125
  },
  {
      "concurrency": 25,
      "latency": 1755.582,
      "thinkTime": 0,
      "tps": 14.240292
  },
  {
      "concurrency": 50,
      "latency": 3454.103,
      "thinkTime": 0,
      "tps": 14.475538
  },
  {
      "concurrency": 75,
      "latency": 5153.569,
      "thinkTime": 0,
      "tps": 14.553022
  },
  {
      "concurrency": 100,
      "latency": 6853.281,
      "thinkTime": 0,
      "tps": 14.591552
  }
];

export default {
  component: PerformanceForecast,
  title: 'Components/PerformanceForecast',
} as Meta;

export const Primary: React.VFC<{}> = () => <PerformanceForecast name={"test"} data={data}></PerformanceForecast>;
