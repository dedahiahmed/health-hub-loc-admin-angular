// src/app/app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: 'SERVER_CONFIG',
      useValue: {
        apiUrl: environment.apiUrl,
        environment: environment.production ? 'production' : 'development',
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
