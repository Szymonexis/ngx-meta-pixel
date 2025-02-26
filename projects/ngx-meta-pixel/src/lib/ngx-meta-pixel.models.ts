import { InjectionToken } from "@angular/core";

/**
 * selector for the `<script></script>` tag that contains the pixel code
 */
export const META_PIXEL_SCRIPT_ID = 'meta-pixel-script' as const;

/**
 * selector for the `<noscript></noscript>` tag that contains the pixel
 */
export const META_PIXEL_NOSCRIPT_ID = 'meta-pixel-noscript' as const;

export interface NgxMetaPixelConfiguration {
  /** Whether to start tracking immediately. Default is `false` */
  enabled?: boolean;
  /**
   * Path to your pixel html code - can be absolute or relative
   * (`http://some.domain/pixel-script.html` or `assets/pixel-script.html`)
   *
   * If no path is provided it must be provided to the `initialize()` method of the NgxMetaPixelService
   */
  pathToMetaPixelHtml?: string;
}

export interface NgxMetaPixelEventProperties {
  /** Category of the page/product. */
  content_category?: string;

  /**
   * Product IDs associated with the event, such as SKUs.
   * @example ['ABC123', 'XYZ789']
   */
  content_ids?: string[] | number[];

  /** Name of the page/product. */
  content_name?: string;

  /**
   * If the IDs being passed in `content_ids`or `contents` parameter are IDs of products, then the value should be '**product**'.
   * Either '**product**' or '**product_group**' base on the `content_ids` or `contents` being passed.
   * If product group IDs are being passed, then the value should be '**product_group**'.
   */
  content_type?: 'product' | 'product_group';

  // tslint:disable-next-line: max-line-length
  /** An array of JSON objects that contains the quantity and the International Article Number (EAN) when applicable, or other product or content identifier(s).
   * id and quantity are the required fields.
   * @example [{'id': 'ABC123', 'quantity': 2}, {'id': 'XYZ789', 'quantity': 2}]
   */
  contents?: object[];

  /**
   * Used with `InitiateCheckout` event.
   * The number of items when checkout was initiated.
   */
  num_items?: number;

  /** Predicted lifetime value of a subscriber as defined by the advertiser and expressed as an exact value. */
  predicted_ltv?: number;

  /**
   * Used with the `Search` event.
   * The string entered by the user for the search.
   */
  search_string?: string;

  /** Used with the `CompleteRegistration` event, to show the status of the registration. */
  status?: boolean;

  /** The value of a user performing this event to the business. */
  value?: number;

  /**
   * The currency for the `value` specified.
   *
   * See {@link https://developers.facebook.com/docs/marketing-api/currencies Facebook Pixel docs - currency codes}
   */
  currency?:
    | 'AED'
    | 'ARS'
    | 'AUD'
    | 'BDT'
    | 'BOB'
    | 'BRL'
    | 'CAD'
    | 'CHF'
    | 'CLP'
    | 'CNY'
    | 'COP'
    | 'CRC'
    | 'CZK'
    | 'DKK'
    | 'DZD'
    | 'EGP'
    | 'EUR'
    | 'GBP'
    | 'GTQ'
    | 'HKD'
    | 'HNL'
    | 'HUF'
    | 'IDR'
    | 'ILS'
    | 'INR'
    | 'ISK'
    | 'JPY'
    | 'KES'
    | 'KRW'
    | 'MOP'
    | 'MXN'
    | 'MYR'
    | 'NGN'
    | 'NIO'
    | 'NOK'
    | 'NZD'
    | 'PEN'
    | 'PHP'
    | 'PKR'
    | 'PLN'
    | 'PYG'
    | 'QAR'
    | 'RON'
    | 'RUB'
    | 'SAR'
    | 'SEK'
    | 'SGD'
    | 'THB'
    | 'TRY'
    | 'TWD'
    | 'USD'
    | 'UYU'
    | 'VEF'
    | 'VND'
    | 'ZAR';
}

export type NgxMetaPixelEventName =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'PageView'
  | 'Purchase'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent';

/**
 * Injection token for the environment provider configuration
 */
export const NGX_META_PIXEL_CONFIG = new InjectionToken<NgxMetaPixelConfiguration>('config');
