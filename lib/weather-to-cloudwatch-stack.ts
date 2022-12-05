import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {
  aws_cloudwatch as cloudwatch,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_events as events,
  aws_events_targets as targets,
  aws_ssm as ssm,
  pipelines,
} from 'aws-cdk-lib';

const everyFiveMinutes = events.Schedule.expression('cron(0/5 * * * ? *)');

export class WeatherToCloudWatch extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use a connection created using the AWS console to authenticate to GitHub
    const input = pipelines.CodePipelineSource.connection('markusl/weather-to-cloudwatch', 'main', {
      connectionArn: `arn:aws:codestar-connections:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:connection/2176abff-fac4-4c5d-87e8-0cc53551ab98`,
    });

    new pipelines.CodePipeline(this, 'WeatherToCloudWatchPipeline', {
      crossAccountKeys: false,
      synth: new pipelines.ShellStep('Synth', {
        input,
        commands: [
          'npm ci',
          'npm run test',
          'npx cdk synth',
        ],
      }),
    });

    const updateWeatherFunction = new lambda_nodejs.NodejsFunction(this, 'WeatherToCloudWatch', {
      runtime: lambda.Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        externalModules: [
          '@aws-sdk/client-s3',
          '@aws-sdk/client-cloudwatch',
        ],
      },
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        OPEN_WEATHER_APP_ID: ssm.StringParameter.fromStringParameterName(this, 'AppId', 'OPEN_WEATHER_APP_ID').stringValue
      },
    });

    cloudwatch.Metric.grantPutMetricData(updateWeatherFunction);

    const rule = new events.Rule(this, 'Rule', { schedule: everyFiveMinutes });
    rule.addTarget(new targets.LambdaFunction(updateWeatherFunction));
  }
}
