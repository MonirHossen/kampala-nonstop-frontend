import { Location } from '@angular/common';
import { afterRenderEffect, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, Scroll } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { guideNavIcon } from '../guide-topic-icons';
import { guideScrollBehavior } from './guide-picker-reveal';

export type EssentialsIndexItem = { id: string; code: string; label: string };

/** Shared index for continuous Guide pages; it never swaps page content. */
@Component({
  selector: 'kn-essentials-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  host: { class: 'sticky top-14 z-30 block self-start md:top-20' },
  template: `
    <nav aria-label="On this page" class="hidden max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-hairline bg-paper p-4 md:block">
      <p class="eyebrow mb-3 text-clay">On this page</p>
      @for (item of items(); track item.id) {
        <a [href]="link(item.id)" (click)="select($event, item.id)"
          [attr.aria-current]="active() === item.id ? 'location' : null"
          class="index-link">
          <svg lucideIcon [lucideIcon]="icon(item.code)" class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
          {{ item.label }}
        </a>
      }
    </nav>
    <button #trigger type="button" class="flex w-full items-center justify-between border-y border-hairline bg-paper px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-primary md:hidden"
      aria-haspopup="dialog" aria-controls="essentials-menu" [attr.aria-expanded]="open()" (click)="openMenu()">
      <span><span class="eyebrow block text-clay">On this page</span><span class="mt-1 block text-sm">{{ activeLabel() }}</span></span>
      <span aria-hidden="true">⌄</span>
    </button>
    <dialog #sheet id="essentials-menu" aria-labelledby="essentials-menu-title" (close)="closed()"
      class="m-0 mt-auto max-h-[80dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-hairline bg-paper p-5 text-foreground backdrop:bg-ink/60">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 id="essentials-menu-title" class="font-bold">On this page</h2>
        <button type="button" (click)="closeMenu()" class="rounded border border-hairline px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary">Close</button>
      </div>
      <nav [attr.aria-label]="menuLabel()">
        @for (item of items(); track item.id) {
          <a [href]="link(item.id)" (click)="select($event, item.id)" class="index-link"
            [attr.aria-current]="active() === item.id ? 'location' : null">
            <svg lucideIcon [lucideIcon]="icon(item.code)" class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
            {{ item.label }}
          </a>
        }
      </nav>
    </dialog>
  `,
  styles: `
    .index-link { display:flex; align-items:center; gap:.6rem; padding:.65rem .75rem; border-left:3px solid transparent; font-size:.875rem; line-height:1.45; }
    .index-link:hover, .index-link[aria-current] { color:var(--primary); background:var(--sand); border-left-color:var(--primary); }
    .index-link:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
  `,
})
export class EssentialsIndexComponent {
  readonly items = input.required<EssentialsIndexItem[]>();
  readonly menuLabel = input('Essentials sections');
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sheet = viewChild<ElementRef<HTMLDialogElement>>('sheet');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly active = signal('');
  protected readonly open = signal(false);
  protected readonly icon = guideNavIcon;
  private initialised = false;
  private frame = 0;

  constructor() {
    afterRenderEffect((cleanup) => {
      const items = this.items();
      const sections = items.map(item => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
      if (!sections.length) return;
      let observer: IntersectionObserver | undefined;
      const observe = () => {
        observer?.disconnect();
        const top = window.matchMedia('(min-width: 768px)').matches ? 88 : 152;
        observer = new IntersectionObserver(() => {
          const current = sections.filter(el => el.getBoundingClientRect().top <= top + 1).at(-1) ?? sections[0];
          this.active.set(current.id);
        }, { rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - 1)}px 0px`, threshold: 0 });
        sections.forEach(section => observer!.observe(section));
        if (window.matchMedia('(min-width: 768px)').matches && this.sheet()?.nativeElement.open) this.closeMenu();
      };
      observe();
      window.addEventListener('resize', observe);
      if (!this.initialised) {
        this.initialised = true;
        this.active.set(items[0].id);
        this.restore();
      }
      cleanup(() => { observer?.disconnect(); window.removeEventListener('resize', observe); });
    });
    // Run after the router's global scroll restoration, including Back/Forward.
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof Scroll && this.initialised) this.restore();
    });
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
  }

  protected activeLabel(): string {
    return this.items().find(item => item.id === this.active())?.label ?? this.items()[0]?.label ?? 'Sections';
  }

  protected link(id: string): string {
    const url = this.router.parseUrl(this.location.path(true));
    delete url.queryParams['section'];
    url.fragment = id;
    return this.router.serializeUrl(url);
  }

  protected openMenu(): void {
    this.sheet()?.nativeElement.showModal();
    this.open.set(true);
    this.sheet()?.nativeElement.querySelector<HTMLElement>('[aria-current]')?.focus();
  }

  protected closeMenu(): void { this.sheet()?.nativeElement.close(); }
  protected closed(): void { this.open.set(false); this.trigger()?.nativeElement.focus({ preventScroll: true }); }

  protected select(event: MouseEvent, id: string): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (this.open()) this.closeMenu();
    // Keep Angular's history state while avoiding the global scroll-to-top navigation.
    const target = this.link(id);
    if (this.location.path(true) !== target) this.location.go(target, '', this.location.getState());
    this.scroll(id, guideScrollBehavior(), true);
  }

  private restore(): void {
    const url = this.router.parseUrl(this.location.path(true));
    const aliases: Record<string, string[]> = {
      money: ['money', 'currency', 'cost-of-living'], languages: ['languages-communication'],
      time: ['time-zone', 'timezone'], electricity: ['electricity-plugs'],
      emergency: ['emergency-basics', 'safety-reassurance'],
    };
    const resolve = (requested: unknown) => {
      const key = String(requested ?? '').toLowerCase().replaceAll('_', '-');
      return this.items().find(item => item.id === key)
        ?? this.items().find(item => aliases[key]?.includes(item.id));
    };
    const item = resolve(url.fragment) ?? resolve(url.queryParams['section']);
    if (!item) return;
    if (url.queryParams['section'] || url.fragment !== item.id) {
      delete url.queryParams['section'];
      url.fragment = item.id;
      this.location.replaceState(this.router.serializeUrl(url), '', this.location.getState());
    }
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => this.scroll(item.id, 'auto', false));
    });
  }

  private scroll(id: string, behavior: ScrollBehavior, focus: boolean): void {
    const section = document.getElementById(id);
    if (!section) return;
    this.active.set(id);
    if (focus) section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior, block: 'start' });
  }
}
