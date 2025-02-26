import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgxMetaPixelService } from '../lib/ngx-meta-pixel.service';
import { DOCUMENT } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { META_PIXEL_NOSCRIPT_ID, META_PIXEL_SCRIPT_ID } from "../lib/ngx-meta-pixel.models";

describe('NgxMetaPixelService', () => {
  const MOCK_HTML = `
    <!-- Meta Pixel Code -->
    <script id="${META_PIXEL_SCRIPT_ID}">
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
      }(window, document, 'script',
        'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'TEST_ID');
    </script>
    <noscript id="${META_PIXEL_NOSCRIPT_ID}">
      <img height="1"
           src="https://www.facebook.com/tr?id=TEST_ID&ev=PageView&noscript=1"
           style="display:none"
           width="1"
      />
    </noscript>
    <!-- End Meta Pixel Code-->
  `;

  const MOCK_FILE_PATH = 'path/to/meta-pixel.html';

  let service: NgxMetaPixelService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NgxMetaPixelService,
        {
          provide: 'config',
          useValue: { pathToMetaPixelHtml: MOCK_FILE_PATH }
        },
        {
          provide: DOCUMENT,
          useValue: document
        },
        {
          provide: PLATFORM_ID,
          useValue: 'browser'
        }
      ]
    });

    service = TestBed.inject(NgxMetaPixelService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();

    // Cleanup possible leftover scripts to avoid race conditions between tests
    document.getElementById(META_PIXEL_SCRIPT_ID)?.remove();
    document.getElementById(META_PIXEL_NOSCRIPT_ID)?.remove();
  });

  it('should initialize and add the meta pixel scripts to the document', () => {
    service.initialize();

    // Mock HTML file response requested in initialization
    const req = httpTestingController.expectOne(MOCK_FILE_PATH);
    req.flush(MOCK_HTML);

    expect(document.getElementById(META_PIXEL_SCRIPT_ID)).toBeTruthy();
    expect(document.getElementById(META_PIXEL_NOSCRIPT_ID)).toBeTruthy();
  });

  it('should remove the meta pixel scripts from the document', () => {
    service.initialize();

    // Mock HTML file response requested in initialization
    const req = httpTestingController.expectOne(MOCK_FILE_PATH);
    req.flush(MOCK_HTML);

    service.remove();

    expect(document.getElementById(META_PIXEL_SCRIPT_ID)).toBeNull();
    expect(document.getElementById(META_PIXEL_NOSCRIPT_ID)).toBeNull();
  });
});
