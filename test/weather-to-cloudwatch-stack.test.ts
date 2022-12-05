import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WeatherToCloudWatch } from '../lib/weather-to-cloudwatch-stack';
import { snapshotSerializer } from './util';

expect.addSnapshotSerializer(snapshotSerializer);

test('WeatherToCloudWatch synthetizes expected template', async () => {
  const app = new cdk.App();
  const stack = new WeatherToCloudWatch(app, 'infra');

  expect(Template.fromStack(stack)).toMatchSnapshot();
});
