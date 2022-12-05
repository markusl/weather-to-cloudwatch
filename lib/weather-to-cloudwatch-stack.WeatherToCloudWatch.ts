import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cw = new CloudWatch({});

interface WeatherData {
	'coord': {
		'lon': number;
		'lat': number;
	},
	'weather': [{
		'id': number;
		'main': string;
		'description': string;
		'icon': string;
	}],
	'base': string;
	'main': {
		'temp': number;
		'feels_like': number;
		'temp_min': number;
		'temp_max': number;
		'pressure': number;
		'humidity': number;
	},
	'visibility': number;
	'wind': {
		'speed': number;
		'deg': number;
	},
	'clouds': {
		'all': number;
	},
	'dt': number;
	'sys': {
		'type': number;
		'id': number;
		'country': string;
		'sunrise': number;
		'sunset': number;
	},
	'timezone': number;
	'id': number;
	'name': string;
	'cod': number;
}

export const handler = async (event: any) => {
  console.log(JSON.stringify(event, undefined, 2));
  try {
    const appId = process.env.OPEN_WEATHER_APP_ID;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=60.192059&lon=24.945831&appid=${appId}&units=metric`;
    const weatherData = await (await fetch(weatherUrl)).json() as WeatherData;
    console.log(weatherData);

    await cw.putMetricData({
      Namespace: 'Weather',
      MetricData: [
        {
          MetricName: 'Temperature',
          Dimensions: [{
            Name: 'City',
            Value: 'Helsinki',
          }],
          Value: weatherData.main.temp,
        },
        {
          MetricName: 'Humidity',
          Dimensions: [{
            Name: 'City',
            Value: 'Helsinki',
          }],
          Value: weatherData.main.humidity,
        },
        {
          MetricName: 'Pressure',
          Dimensions: [{
            Name: 'City',
            Value: 'Helsinki',
          }],
          Value: weatherData.main.pressure,
        },
      ]
    });

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    };
  }
};
