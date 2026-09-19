import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './amplify-config';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

Amplify.configure(amplifyConfig);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));