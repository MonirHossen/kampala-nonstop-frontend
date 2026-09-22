import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';

/** Fetch figures as readers approach them, without delaying the surrounding text. */
@Directive({
  selector: 'img[knProgressiveImage]',
  host: { decoding: 'async', loading: 'lazy' },
})
export class GuideProgressiveImageDirective {
  readonly knProgressiveImage = input.required<string>();
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef);

  constructor() {
    afterRenderEffect(cleanup => {
      const source = this.knProgressiveImage();
      const image = this.element.nativeElement;
      if (typeof IntersectionObserver === 'undefined') {
        image.src = source;
        return;
      }
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          image.src = source;
          observer.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      observer.observe(image);
      cleanup(() => observer.disconnect());
    });
  }
}
