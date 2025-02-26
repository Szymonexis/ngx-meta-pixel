import { NgxMetaPixelService } from "../lib/ngx-meta-pixel.service";
import { TestBed } from "@angular/core/testing";
import { NgxMetaPixelModule } from "../lib/ngx-meta-pixel.module";
import { PLATFORM_ID } from "@angular/core";
import { NgxMetaPixelConfiguration } from "../lib/ngx-meta-pixel.models";

class MockNgxMetaPixelService {
  initialize = jasmine.createSpy('initialize');
}

describe('NgxMetaPixelModule', () => {
  let metaPixelService: NgxMetaPixelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxMetaPixelModule],
      providers: [
        { provide: NgxMetaPixelService, useClass: MockNgxMetaPixelService },
        { provide: PLATFORM_ID, useValue: 'browser' }, // Simulate browser environment
      ],
    });
    metaPixelService = TestBed.inject(NgxMetaPixelService);
  });

  it('should create the module', () => {
    expect(NgxMetaPixelModule).toBeTruthy();
  });

  it('should store the configuration in forRoot', () => {
    const config: NgxMetaPixelConfiguration = { enabled: true, pathToMetaPixelHtml: 'test-path.html' };
    const moduleWithProviders = NgxMetaPixelModule.forRoot(config);

    expect(moduleWithProviders.providers).toContain({ provide: 'config', useValue: config });
  });

  it('should provide the NgxMetaPixelService', () => {
    expect(metaPixelService).toBeTruthy();
  });
});
