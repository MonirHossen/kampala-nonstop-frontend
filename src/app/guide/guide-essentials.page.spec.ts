import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { GuideEssential } from './guide.models';
import { GuideEssentialsPage } from './guide-essentials.page';
import { GuideApiService } from './guide-api.service';
import { UGANDA_ESSENTIALS_FALLBACK } from './content/uganda-essentials-fallback';

// Recovered from HEAD's original NARRATIVE_CODES; History belonged to About.
const originalIds = [
  'about', 'history', 'culture-traditions', 'food-drink-social',
  'languages-communication', 'geography-climate', 'major-destinations',
  'tourism-glance', 'kampala-city-life', 'safety-reassurance',
  'cost-of-living', 'public-holidays', 'local-etiquette',
];

describe('Essentials page content inventory', () => {
  it('renders all sections before the API responds, then refreshes live text', () => {
    const response = new Subject<GuideEssential[]>();
    TestBed.configureTestingModule({
      imports: [GuideEssentialsPage],
      providers: [provideRouter([]), provideLocationMocks(),
        { provide: GuideApiService, useValue: { getEssentials: () => response } }],
    });
    const fixture = TestBed.createComponent(GuideEssentialsPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-section-id]').length).toBe(14);
    response.next([{ ...UGANDA_ESSENTIALS_FALLBACK[0], value_data: { heading: 'Updated Uganda introduction' } }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Updated Uganda introduction');
    expect(fixture.nativeElement.querySelectorAll('[data-section-id]').length).toBe(14);
    response.complete();
    fixture.destroy();
  });

  for (const response of ['complete', 'partial', 'empty', 'unavailable']) {
    for (const suffix of ['?section=about', '?section=culture-traditions', '#local-etiquette']) {
      it(`keeps every original topic with ${response} API and ${suffix}`, fakeAsync(() => {
        const records = response === 'partial' ? UGANDA_ESSENTIALS_FALLBACK.slice(0, 1)
          : response === 'empty' ? [] : UGANDA_ESSENTIALS_FALLBACK;
        const api = jasmine.createSpyObj<GuideApiService>('GuideApiService', ['getEssentials']);
        api.getEssentials.and.returnValue(response === 'unavailable'
          ? throwError(() => new Error('API offline')) : of(records));
        TestBed.configureTestingModule({
          imports: [GuideEssentialsPage],
          providers: [provideRouter([]), provideLocationMocks(), { provide: GuideApiService, useValue: api }],
        });
        TestBed.inject(Location).replaceState('/ug/guide/essentials' + suffix);
        spyOn(HTMLElement.prototype, 'scrollIntoView');
        const fixture = TestBed.createComponent(GuideEssentialsPage);
        fixture.detectChanges();
        tick(100);
        const root: HTMLElement = fixture.nativeElement;
        const sections = [...root.querySelectorAll<HTMLElement>('[data-section-id]')];
        expect(sections.map(section => section.id)).toEqual([...originalIds, 'key-facts']);
        for (const nav of root.querySelectorAll('kn-essentials-index nav')) {
          const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
          expect(links.length).toBe(sections.length);
          expect(links.map(link => link.hash.slice(1))).toEqual(sections.map(section => section.id));
          for (const link of links) expect(document.getElementById(link.hash.slice(1))).not.toBeNull();
        }
        for (const item of UGANDA_ESSENTIALS_FALLBACK.filter(item => originalIds.includes(item.code!.toLowerCase().replaceAll('_', '-')))) {
          const id = item.code!.toLowerCase().replaceAll('_', '-');
          const section = document.getElementById(id)!;
          expect(section.textContent).toContain(item.name!);
          expect(section.querySelector('kn-guide-narrative-blocks')!.textContent!.trim().length).toBeGreaterThan(40);
        }
        const links = root.querySelectorAll<HTMLAnchorElement>('nav[aria-label="On this page"] a');
        for (const index of [0, 6, links.length - 1]) {
          links[index].click();
          fixture.detectChanges();
          expect([...root.querySelectorAll('[data-section-id]')]).toEqual(sections);
        }
        expect(api.getEssentials).toHaveBeenCalledTimes(1);
        fixture.destroy();
      }));
    }
  }
});
