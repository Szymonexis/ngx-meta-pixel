import {
  Inject,
  ModuleWithProviders,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxMetaPixelConfiguration } from './ngx-meta-pixel.models';
import { NgxMetaPixelService } from './ngx-meta-pixel.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ imports: [CommonModule], providers: [provideHttpClient()] })
export class NgxMetaPixelModule {
  private static _config: NgxMetaPixelConfiguration | null = null;

  constructor(
    @Inject(PLATFORM_ID) private readonly _platformId: object,
    private readonly _metaPixelService: NgxMetaPixelService
  ) {
    if (
      NgxMetaPixelModule?._config?.enabled &&
      isPlatformBrowser(_platformId)
    ) {
      this._metaPixelService.initialize();
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

    return {
      ngModule: NgxMetaPixelModule,
      providers: [NgxMetaPixelService, { provide: 'config', useValue: config }],
    };
  }
}
