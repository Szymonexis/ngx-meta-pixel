import { filter, take } from 'rxjs/operators';

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  Optional,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  META_PIXEL_NOSCRIPT_ID,
  META_PIXEL_SCRIPT_ID,
  NgxMetaPixelConfiguration,
  NgxMetaPixelEventName,
  NgxMetaPixelEventProperties,
} from './ngx-meta-pixel.models';

// fbq function loaded by the Facebook Pixel script
declare const fbq: any;

@Injectable()
export class NgxMetaPixelService {
  private readonly _renderer: Renderer2;

  constructor(
    private readonly _rendererFactory: RendererFactory2,
    private readonly _http: HttpClient,
    @Optional() readonly router: Router,
    @Inject('config') private readonly _config: NgxMetaPixelConfiguration,
    @Inject(DOCUMENT) private readonly _document: Document,
    @Inject(PLATFORM_ID) private readonly _platformId: object
  ) {
    this._renderer = _rendererFactory.createRenderer(null, null);

    if (router) {
      // Log page views after router navigation ends
      router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          if (this._isLoaded()) {
            this.track('PageView');
          }
        });
    }
  }

  /**
   * @description
   * Initialize the Pixel tracking script
   * - Adds the script to page's head
   * - Tracks first page view
   */
  initialize(pathToMetaPixelHtml = this._config.pathToMetaPixelHtml): void {
    if (this._isLoaded()) {
      return;
    }

    this._verifyPixelPath(pathToMetaPixelHtml);

    this._config.enabled = true;
    this._addPixelScript(pathToMetaPixelHtml as string);
  }

  /**
   * @description
   * Remove the Pixel tracking script */
  remove(): void {
    this._removePixelScript();
    this._config.enabled = false;
  }

  /**
   * @description
   * Track a Standard Event as predefined by Facebook
   *
   * See {@link https://developers.facebook.com/docs/facebook-pixel/reference Facebook Pixel docs - reference}
   * @param eventName The name of the event that is being tracked
   * @param properties Optional properties of the event
   */
  track(
    eventName: NgxMetaPixelEventName,
    properties?: NgxMetaPixelEventProperties
  ): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    if (!this._isLoaded()) {
      console.warn(
        'Tried to track an event without initializing a Pixel instance. Call `initialize()` first.'
      );
      return;
    }

    if (properties) {
      fbq('track', eventName, properties);
    } else {
      fbq('track', eventName);
    }
  }

  /**
   * @description
   * Track a custom Event
   *
   * See {@link https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking#custom-conversions Facebook Pixel docs - custom conversions}
   * @param eventName The name of the event that is being tracked
   * @param properties Optional properties of the event
   */
  trackCustom(eventName: string, properties?: object): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    if (!this._isLoaded()) {
      console.warn(
        'Tried to track an event without initializing a Pixel instance. Call `initialize()` first.'
      );
      return;
    }

    if (properties) {
      fbq('trackCustom', eventName, properties);
    } else {
      fbq('trackCustom', eventName);
    }
  }

  /**
   * @description
   * Adds the Facebook Pixel tracking script to the application
   * @param pathToMetaPixelHtml The Facebook Pixel html file path (will be fetched via HttpClient)
   */
  private _addPixelScript(pathToMetaPixelHtml: string): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const sub = this._http
      .get(pathToMetaPixelHtml, { responseType: 'text' })
      .pipe(take(1))
      .subscribe((html) => {
        if (!this._isLoaded()) {
          const modifiedHtml = html.replace(/<\/?noscript/gi, (match) =>
            match.replace('noscript', 'temp-noscript')
          );

          const parser = new DOMParser();
          const doc = parser.parseFromString(modifiedHtml, 'text/html');

          // Replace all <noscript> elements with <temp-noscript> to prevent them from being executed
          doc.querySelectorAll('temp-noscript').forEach((tempElem) => {
            const noscript = doc.createElement('noscript');

            // Copy attributes
            Array.from(tempElem.attributes).forEach((attr) => {
              noscript.setAttribute(attr.name, attr.value);
            });

            // Copy child nodes
            Array.from(tempElem.childNodes).forEach((child) => {
              noscript.appendChild(child.cloneNode(true));
            });

            // Replace the temporary element with the new <noscript>
            tempElem.replaceWith(noscript);
          });

          const dynamicScriptElement = doc.getElementById(META_PIXEL_SCRIPT_ID);
          const noscriptElement = doc.getElementById(META_PIXEL_NOSCRIPT_ID);

          if (!!dynamicScriptElement && !!noscriptElement) {
            this._renderer.setAttribute(
              dynamicScriptElement,
              'type',
              'text/javascript'
            );

            const scriptElement = this._document.createElement('script');

            // This bulshittery is needed to actually execute the script
            Array.from(dynamicScriptElement.attributes).forEach((attr) => {
              scriptElement.setAttribute(attr.name, attr.value);
            });
            scriptElement.text = dynamicScriptElement.innerHTML;

            this._renderer.appendChild(this._document.head, scriptElement);
            this._renderer.appendChild(this._document.head, noscriptElement);
          }
        }

        sub.unsubscribe();
      });
  }

  /**
   * @description
   * Remove Facebook Pixel tracking script from the application
   */
  private _removePixelScript(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const pixelScriptElement =
      this._document.getElementById(META_PIXEL_SCRIPT_ID);
    if (pixelScriptElement) {
      pixelScriptElement.remove();
    }

    const pixelNoScriptElement = this._document.getElementById(
      META_PIXEL_NOSCRIPT_ID
    );
    if (pixelNoScriptElement) {
      pixelNoScriptElement.remove();
    }
  }

  /**
   * @description
   * Checks if the script element is present
   */
  private _isLoaded(): boolean {
    if (isPlatformBrowser(this._platformId)) {
      const pixelScriptElement =
        this._document.getElementById(META_PIXEL_SCRIPT_ID);
      const pixelNoScriptElement = this._document.getElementById(
        META_PIXEL_NOSCRIPT_ID
      );

      return !!pixelScriptElement && !!pixelNoScriptElement;
    }
    return false;
  }

  /**
   * @description
   * Verifies the Pixel file path that was passed into the configuration.
   * - Checks if Pixel was initialized
   * @param pathToMetaPixelHtml path to the meta pixel html file
   */
  private _verifyPixelPath(
    pathToMetaPixelHtml: string | undefined | null
  ): void {
    if (
      pathToMetaPixelHtml === null ||
      pathToMetaPixelHtml === undefined ||
      typeof pathToMetaPixelHtml !== 'string' ||
      pathToMetaPixelHtml.length === 0
    ) {
      throw Error(
        'Invalid Facebook Pixel file path. Did you pass the `pathToMetaPixelHtml` property to the `NgxMetaPixelModule.forRoot()` function or did you invoke the `initalize` function properly if no path was provided for the `NgxMetaPixelModule.forRoot()`?'
      );
    }
  }
}
