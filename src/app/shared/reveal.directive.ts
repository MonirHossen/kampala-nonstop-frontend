import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';

/** Fades/slides the host in the first time it enters the viewport. */
@Directive({
  selector: '[knReveal]',
  host: { class: 'reveal' },
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('knReveal') delay: number | '' = 0;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.host.nativeElement as HTMLElement;

    if (typeof IntersectionObserver === 'undefined') {
      this.show(node);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.show(node);
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private show(node: HTMLElement): void {
    const delay = typeof this.delay === 'number' ? this.delay : 0;
    if (delay > 0) this.renderer.setStyle(node, 'animation-delay', `${delay}ms`);
    this.renderer.addClass(node, 'reveal-in');
  }
}
