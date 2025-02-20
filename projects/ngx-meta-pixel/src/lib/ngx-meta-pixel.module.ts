import {
  Inject,
  ModuleWithProviders,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxMetaPixelConfiguration } from './ngx-meta-pixel.models';
import { NgxMetaPixelService } from './ngx-meta-pixel.service';

@NgModule()
export class NgxMetaPixelModule {
  private static _config: NgxMetaPixelConfiguration | null = null;

  constructor(
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private readonly _metaPixel: NgxMetaPixelService
  ) {
    if (!NgxMetaPixelModule._config) {
      throw Error(
        ' not configured correctly. Pass the `pathToMetaPixelHtml` property to the `forRoot()` function'
      );
    }
    if (NgxMetaPixelModule._config.enabled && isPlatformBrowser(_platformId)) {
      this._metaPixel.initialize();
    }
  }

  /**
   * @description
   * Initiale the Facebook Pixel Module
   * Add your Pixel file path as parameter (pathToMetaPixelHtml)
   *
   * @warning
   * The meta pixel file needs to be modified. Add `id="meta-pixel-script"` to the `<script></script>` tag,
   * `id="meta-pixel-noscript"` to the `<noscript></noscript>` tag and delete any `fbq()`
   * calls apart from the `fbq('init', 'your-pixel-id')` call.
   */
  static forRoot(
    config: NgxMetaPixelConfiguration
  ): ModuleWithProviders<NgxMetaPixelModule> {
    this._config = config;
    const pathToMetaPixelHtml = config.pathToMetaPixelHtml;
    this._verifyPixelPath(pathToMetaPixelHtml);

    return {
      ngModule: NgxMetaPixelModule,
      providers: [NgxMetaPixelService, { provide: 'config', useValue: config }],
    };
  }

  /**
   * @description
   * Verifies the Pixel file path that was passed into the configuration.
   * - Checks if Pixel was initialized
   * @param pathToMetaPixelHtml path to the meta pixel html file
   */
  private static _verifyPixelPath(pathToMetaPixelHtml: string): void {
    if (
      pathToMetaPixelHtml === null ||
      pathToMetaPixelHtml === undefined ||
      pathToMetaPixelHtml.length === 0
    ) {
      throw Error(
        'Invalid Facebook Pixel file path. Did you pass the path into the forRoot() function?'
      );
    }
  }
}
