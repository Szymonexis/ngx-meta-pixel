import { TestBed, inject } from '@angular/core/testing';
import { PLATFORM_ID, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { NavigationStart, Router } from '@angular/router';
import { NgxMetaPixelService } from "../lib/ngx-meta-pixel.service";
import { provideNgxMetaPixel } from "../lib/ngx-meta-pixel.provider";
import { BehaviorSubject } from "rxjs";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { NGX_META_PIXEL_CONFIG, NgxMetaPixelConfiguration } from "../lib/ngx-meta-pixel.models";

class MockRendererFactory2 {
  createRenderer() {
    return { destroy: jasmine.createSpy('destroy') };
  }
}

describe('provideNgxMetaPixel', () => {
  let metaPixelService: NgxMetaPixelService;
  let rendererFactory: RendererFactory2;
  let httpClient: HttpClient;
  let router: Router;
  let documentSpy: Document;
  let platformId: object;

  beforeEach(() => {
    // Mock the router's events observable
    const routerEventsSubject = new BehaviorSubject<any>(new NavigationStart(0, '/'));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNgxMetaPixel({ pathToMetaPixelHtml: 'test-path.html' }),
        { provide: RendererFactory2, useClass: MockRendererFactory2 },
        { provide: Router, useValue: { events: routerEventsSubject.asObservable() } },
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    metaPixelService = TestBed.inject(NgxMetaPixelService);
    rendererFactory = TestBed.inject(RendererFactory2);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    documentSpy = TestBed.inject(DOCUMENT);
    platformId = TestBed.inject(PLATFORM_ID);
  });

  it('should store the configuration in the environment provider', () => {
    const config: NgxMetaPixelConfiguration = { enabled: true, pathToMetaPixelHtml: 'test-path.html' };

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideNgxMetaPixel(config)],
    });

    const injectedConfig = TestBed.inject(NGX_META_PIXEL_CONFIG);

    expect(injectedConfig).toEqual(config);
  });


  it('should provide the NgxMetaPixelService', () => {
    expect(metaPixelService).toBeTruthy();
  });

  it('should inject all required dependencies', inject(
    [RendererFactory2, HttpClient, Router, DOCUMENT, PLATFORM_ID],
    (rendererFactory: RendererFactory2, http: HttpClient, router: Router, doc: Document, pid: object) => {
      expect(rendererFactory).toBeTruthy();
      expect(http).toBeTruthy();
      expect(router).toBeTruthy();
      expect(doc).toBeTruthy();
      expect(pid).toBeTruthy();
    }
  ));
});
