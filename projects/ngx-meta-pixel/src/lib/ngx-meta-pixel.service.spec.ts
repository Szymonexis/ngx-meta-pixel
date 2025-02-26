import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgxMetaPixelService } from './ngx-meta-pixel.service';
import { DOCUMENT } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";

describe('NgxMetaPixelService', () => {
  let service: NgxMetaPixelService;
  let httpTestingController: HttpTestingController;
  const mockHtml = `
    <!-- Meta Pixel Code -->
    <script id="meta-pixel-script">
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
    <noscript id="meta-pixel-noscript">
      <img height="1"
           src="https://www.facebook.com/tr?id=TEST_ID&ev=PageView&noscript=1"
           style="display:none"
           width="1"
      />
    </noscript>
    <!-- End Meta Pixel Code-->
  `;
  const mockFilePath = 'path/to/meta-pixel.html';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NgxMetaPixelService,
        {
          provide: 'config',
          useValue: { pathToMetaPixelHtml: mockFilePath }
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
  });

  it('should initialize and add the meta pixel script to the document', () => {
    service.initialize();

    // Mock HTML file response requested in initialization
    const req = httpTestingController.expectOne(mockFilePath);
    expect(req.request.method).toBe('GET');
    req.flush(mockHtml);

    // Check if script and noscript element have been correctly configured by user and loaded in file
    const scriptElement = document.getElementById('meta-pixel-script');
    const noscriptElement = document.getElementById('meta-pixel-noscript');

    expect(scriptElement).toBeTruthy();
    expect(noscriptElement).toBeTruthy();
  });

  it('should remove the meta pixel script from the document', () => {
    service.initialize();

    // Mock HTML file response requested in initialization
    const req = httpTestingController.expectOne(mockFilePath);
    expect(req.request.method).toBe('GET');
    req.flush(mockHtml);

    // Check if scripts have been removed after the method call
    service.remove();

    expect(document.getElementById('meta-pixel-script')).toBeNull();
    expect(document.getElementById('meta-pixel-noscript')).toBeNull();
  });
});
