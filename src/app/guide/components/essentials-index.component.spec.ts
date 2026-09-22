import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EssentialsIndexComponent } from './essentials-index.component';

@Component({
  imports: [EssentialsIndexComponent],
  template: `
    <kn-essentials-index [items]="items" />
    <section id="about" tabindex="-1">About</section>
    <section id="cost-of-living" tabindex="-1">Currency</section>
    <section id="languages-communication" tabindex="-1">Languages</section>
  `,
})
class TestPage {
  readonly items = [
    { id: 'about', code: 'ABOUT', label: 'About Uganda' },
    { id: 'cost-of-living', code: 'COST_OF_LIVING', label: 'Cost of Living & Currency' },
    { id: 'languages-communication', code: 'LANGUAGES_COMMUNICATION', label: 'Languages' },
  ];
}

describe('Essentials continuous navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestPage],
      providers: [provideRouter([]), provideLocationMocks()],
    });
  });

  it('preserves sections and unrelated query parameters when selecting an anchor', fakeAsync(() => {
    const location = TestBed.inject(Location);
    location.replaceState('/ug/guide/essentials?campaign=guide');
    const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView');
    const fixture = TestBed.createComponent(TestPage);
    fixture.detectChanges();
    tick(50);
    const sections = [...fixture.nativeElement.querySelectorAll('section')];
    fixture.nativeElement.querySelector('nav a[href$="#cost-of-living"]').click();
    fixture.detectChanges();
    expect(location.path(true)).toBe('/ug/guide/essentials?campaign=guide#cost-of-living');
    expect([...fixture.nativeElement.querySelectorAll('section')]).toEqual(sections);
    expect(scroll).toHaveBeenCalled();
    fixture.destroy();
  }));

  for (const suffix of ['?section=money', '#money', '?section=cost-of-living', '?section=money#unknown', '?section=about#money']) {
    it(`restores the supported deep link ${suffix} after rendering`, fakeAsync(() => {
      const location = TestBed.inject(Location);
      location.replaceState('/ug/guide/essentials' + suffix);
      const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView');
      const fixture = TestBed.createComponent(TestPage);
      fixture.detectChanges();
      tick(100);
      expect(location.path(true)).toBe('/ug/guide/essentials#cost-of-living');
      expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
      expect((scroll.calls.mostRecent().object as HTMLElement).id).toBe('cost-of-living');
      fixture.destroy();
    }));
  }

  it('uses instant scrolling when reduced motion is requested', fakeAsync(() => {
    const original = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake(query => query.includes('prefers-reduced-motion')
      ? { ...original(query), matches: true } as MediaQueryList : original(query));
    TestBed.inject(Location).replaceState('/ug/guide/essentials');
    const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView');
    const fixture = TestBed.createComponent(TestPage);
    fixture.detectChanges();
    tick(50);
    fixture.nativeElement.querySelector('nav a[href$="#cost-of-living"]').click();
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    fixture.destroy();
  }));

  it('leaves modified link clicks to the browser', fakeAsync(() => {
    const location = TestBed.inject(Location);
    location.replaceState('/ug/guide/essentials');
    const fixture = TestBed.createComponent(TestPage);
    fixture.detectChanges();
    tick(50);
    const link = fixture.nativeElement.querySelector('nav a[href$="#cost-of-living"]');
    const event = new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true });
    // Capture the handler result without allowing the test browser to open a tab.
    let preventedByComponent = true;
    link.addEventListener('click', (received: MouseEvent) => {
      preventedByComponent = received.defaultPrevented;
      received.preventDefault();
    });
    link.dispatchEvent(event);
    expect(preventedByComponent).toBeFalse();
    expect(location.path(true)).toBe('/ug/guide/essentials');
    fixture.destroy();
  }));
});
