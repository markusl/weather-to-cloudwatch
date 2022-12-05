#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { WeatherToCloudWatch } from '../lib/weather-to-cloudwatch-stack';

const app = new App();
new WeatherToCloudWatch(app, 'WeatherToCloudWatch', {
  env: {
    region: 'eu-west-1',
  }
});

app.synth();
