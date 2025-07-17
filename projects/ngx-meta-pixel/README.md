# NgxMetaPixel

This package enables you to setup Meta Pixel for your Angular application.

## Versioning

| ngx-meta-pixel version | supported Angular version |
| ---------------------- | ------------------------- |
| ^16.0.0                | ^16.0.0                   |
| ^17.0.0                | ^17.0.0                   |
| ^18.0.0                | ^18.0.0                   |

## Installation

```bash
npm install --save ngx-meta-pixel
```

## Quickstart

### Standalone applications (Angular >= 17.0.0)

If you are using standalone components, import the service and provide NgxMetaPixel providers with `provideNgxMetaPixel` environment provider function.

In your application-level configuration file (`app.config.ts` or `main.ts` in older Angular versions), add the `provideNgxMetaPixel` environment provider:

```typescript
import { provideNgxMetaPixel } from "ngx-meta-pixel";

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other environment providers

    provideNgxMetaPixel({
      pathToMetaPixelHtml: "assets/meta-pixel.html",
    }),
  ],
};
```

You need to provide the function with the path of the html file containing the script and noscript tags for configuring through the `pathToMetaPixelHtml` attribute from the `NgxMetaPixelConfiguration` parameter.

```typescript
export interface NgxMetaPixelConfiguration {
  enabled?: boolean;
  pathToMetaPixelHtml?: string;
}
```

**Tracking is enabled at application start by default**, if you want to enable it manually, set the `enabled` attribute to false in the configuration parameter. See more about GDPR compliant code in a section below.

### Modular applications (Angular < 17.0.0)

Add the `NgxMetaPixelModule` the the `AppModule` of your app:

```typescript
import { NgxMetaPixelModule } from "ngx-meta-pixel";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxMetaPixelModule.forRoot({ enabled: true, pathToMetaPixelHtml: 'assets/meta-pixel.html'  }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Standalone with module (Angular >= 17.0.0)

Using standalone components, you can still import `NgxMetaPixelModule` the old way with Modules:

```typescript
import { NgxMetaPixelModule } from "ngx-meta-pixel";

@Component({
  // ...
  imports: [
    NgxMetaPixelModule.forRoot({
      enabled: true,
      pathToMetaPixelHtml: "assets/meta-pixel.html",
    }),
  ],
})
export class AppComponent {
  // ...
}
```

## Usage

### Changes within the Meta provided Pixel code

Meta provides users with pixel code similar to this:

```html
<!-- Meta Pixel Code -->
<script>
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", "<YOUR_PIXEL_ID_HERE>");
  fbq("PageView");
</script>
<noscript>
  <img height="1" width="1" style="display: none" src="https://www.facebook.com/tr?id=<YOUR_PIXEL_ID_HERE>&ev=PageView&noscript=1" />
</noscript>
<!-- End Meta Pixel Code -->
```

You will need to do a total of three changes within this code:

1. Add an `id="meta-pixel-script"` attribute to the `script` tag
2. Add an `id="meta-pixel-noscript"` attribute to the `noscript` tag
3. Delete any `fbq` function calls except the `fbq("init", "<YOUR_PIXEL_ID_HERE>")` from the `script` tag

Then place the resulting html code in your assets directory or host it somewhere and provide relevant link to the `ngx-meta-pixel` as shown below.

### Standard events

```typescript
import { NgxMetaPixelService, NgxMetaPixelEventProperties, NgxMetaPixelEventName } from "ngx-meta-pixel";

@Component({
  // ...
})
export class SomeComponent {
  constructor(private readonly _ngxMetaPixelService: NgxMetaPixelService) {}
  // ...

  onSomeAction() {
    const eventName: NgxMetaPixelEventName = "PageView";
    const properties: NgxMetaPixelEventProperties = {
      // ...
    };

    this._ngxMetaPixelService.track(eventName, properties);
  }
}
```

### Custom events

```typescript
import { NgxMetaPixelService } from "ngx-meta-pixel";

@Component({
  // ...
})
export class SomeComponent {
  constructor(private readonly _ngxMetaPixelService: NgxMetaPixelService) {}
  // ...

  onSomeAction() {
    const eventName: string = "MyCustomEvent";
    const properties: object = {
      foo: "bar",
      baz: 42,
    };

    this._ngxMetaPixelService.trackCustom(eventName, properties);
  }
}
```

### Removing the script

```typescript
import { NgxMetaPixelService } from "ngx-meta-pixel";

@Component({
  // ...
})
export class SomeComponent {
  constructor(private readonly _ngxMetaPixelService: NgxMetaPixelService) {}
  // ...

  onSomeAction() {
    this._ngxMetaPixelService.remove();
  }
}
```

### Flow for GDPR compliant applications

First initialize the `NgxMetaPixelModule` with the `enabled` fprop set to `false`:

```typescript
import { NgxMetaPixelModule } from "ngx-meta-pixel";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxMetaPixelModule.forRoot({ enabled: false, pathToMetaPixelHtml: 'assets/meta-pixel.html'  }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Then ask user for permission to track their activity using the Meta Pixel:

```typescript
import { NgxMetaPixelService } from "ngx-meta-pixel";

@Component()
// ...
export class AppComponent {
  constructor(private readonly _ngxMetaPixelService: NgxMetaPixelService) {}

  onUserAgreement() {
    this._ngxMetaPixelService.initialize();

    // you can also call this function with the path provided - this will
    // overwrite the `NgxMetaPixelModule.forRoot()` path, if provided
    this._ngxMetaPixelService.initialize("assets/meta-pixel.html");
  }
}
```

## Credits

Based on the [ngx-multi-pixel](https://www.npmjs.com/package/ngx-multi-pixel) package by [Abhinav Akhil (abhinavakhil)](https://www.npmjs.com/~abhinavakhil)

- [tiagosantini](https://github.com/tiagosantini) for help with v18
