import {
  NGX_META_PIXEL_CONFIG,
  NgxMetaPixelConfiguration,
} from './ngx-meta-pixel.models';
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  inject,
  Injector,
  PLATFORM_ID,
  RendererFactory2,
  DOCUMENT
} from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { NgxMetaPixelService } from './ngx-meta-pixel.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Provides the NgxMetaPixel service as a standalone provider.
 *
 * @param config The configuration for the Meta Pixel service.
 * @returns An array of environment providers to be used in the application's provider list.
 */
export function provideNgxMetaPixel(
  config: NgxMetaPixelConfiguration
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    { provide: NGX_META_PIXEL_CONFIG, useValue: config },
    {
      provide: NgxMetaPixelService,
      useFactory: () => {
        const injector = inject(Injector);

        const rendererFactory = injector.get(RendererFactory2);
        const http = injector.get(HttpClient);
        const router = injector.get(Router);
        const document = injector.get(DOCUMENT);
        const platformId = injector.get(PLATFORM_ID);
        const injectedConfig = injector.get(NGX_META_PIXEL_CONFIG);

        const metaPixelService = new NgxMetaPixelService(
          rendererFactory,
          http,
          router,
          injectedConfig,
          document,
          platformId
        );

        if (injectedConfig.enabled && isPlatformBrowser(platformId)) {
          metaPixelService.initialize();
        }

        return metaPixelService;
      },
    },
  ]);
}
