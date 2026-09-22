import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuideProgressiveImageDirective } from './guide-progressive-image.directive';

@Component({
  imports: [GuideProgressiveImageDirective],
  template: '<p>Readable before images load</p><img knProgressiveImage="/example.jpg" width="1600" height="700" alt="">',
})
class TestPage {}

describe('Guide progressive images', () => {
  it('keeps text available and requests an image only as it approaches the viewport', () => {
    let notify!: IntersectionObserverCallback;
    const observer = { observe: jasmine.createSpy(), disconnect: jasmine.createSpy() };
    spyOn(window, 'IntersectionObserver').and.callFake((callback: IntersectionObserverCallback) => {
      notify = callback;
      return observer as unknown as IntersectionObserver;
    });
    const fixture = TestBed.createComponent(TestPage);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(fixture.nativeElement.textContent).toContain('Readable before images load');
    expect(image.hasAttribute('src')).toBeFalse();
    notify([{ isIntersecting: false } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    expect(image.hasAttribute('src')).toBeFalse();
    notify([{ isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    expect(image.getAttribute('src')).toBe('/example.jpg');
    expect(image.decoding).toBe('async');
    expect(observer.disconnect).toHaveBeenCalled();
    fixture.destroy();
  });
});
