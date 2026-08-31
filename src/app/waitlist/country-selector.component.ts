import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  LucideCheck,
  LucideChevronDown,
  LucideChevronsUpDown,
  LucideSearch,
} from '@lucide/angular';
import { COUNTRIES, countryFlag, type Country } from '../core/lib/countries';

@Component({
  selector: 'kn-country-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck, LucideChevronDown, LucideChevronsUpDown, LucideSearch],
  host: { class: 'relative block' },
  template: `
    <button
      type="button"
      role="combobox"
      [attr.aria-label]="label()"
      [attr.aria-expanded]="open()"
      (click)="toggleOpen()"
      [class]="triggerClass()"
    >
      <span class="flex min-w-0 items-center gap-2 truncate">
        <span class="shrink-0 text-[1.05rem] leading-none" aria-hidden="true">{{
          flag(value().code)
        }}</span>
        <span class="truncate" [class]="variant() === 'boxed' ? 'text-[0.92rem]' : ''">{{
          value().name
        }}</span>
      </span>
      @if (variant() === 'boxed') {
        <svg lucideChevronDown class="ml-2 h-4 w-4 shrink-0 text-muted-foreground"></svg>
      } @else {
        <svg lucideChevronsUpDown class="ml-2 h-4 w-4 shrink-0 text-muted-foreground"></svg>
      }
    </button>

    @if (open()) {
      <div [class]="panelClass()">
        <div
          class="flex items-center gap-2 border-b px-3"
          [class]="variant() === 'boxed' ? 'border-[#ece7df]' : 'border-hairline'"
        >
          <svg lucideSearch class="h-4 w-4 text-muted-foreground"></svg>
          <input
            #search
            [value]="query()"
            (input)="query.set(searchValue($event))"
            placeholder="Search country"
            class="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul class="max-h-64 overflow-y-auto py-1" role="listbox">
          @if (results().length === 0) {
            <li class="px-4 py-6 text-center text-sm text-muted-foreground">
              No country matches &ldquo;{{ query() }}&rdquo;.
            </li>
          } @else {
            @for (country of results(); track country.code) {
              @let selected = country.code === value().code;
              <li>
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="selected"
                  (click)="select(country)"
                  class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
                  [class]="optionClass(selected)"
                >
                  <span class="flex min-w-0 items-center gap-2.5 truncate">
                    <span class="shrink-0 text-[1.05rem] leading-none" aria-hidden="true">{{
                      flag(country.code)
                    }}</span>
                    <span class="truncate">{{ country.name }}</span>
                  </span>
                  @if (selected) {
                    <svg lucideCheck class="ml-3 h-3.5 w-3.5 shrink-0 text-primary"></svg>
                  }
                </button>
              </li>
            }
          }
        </ul>
      </div>
    }
  `,
})
export class CountrySelectorComponent {
  readonly value = input.required<Country>();
  readonly invalid = input(false);
  readonly variant = input<'default' | 'boxed'>('default');
  readonly label = input('Country');
  readonly changed = output<Country>();

  protected readonly open = signal(false);
  protected readonly query = signal('');

  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase() === q,
    );
  });

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.close();
  }

  protected flag(code: string): string {
    return countryFlag(code);
  }

  protected triggerClass(): string {
    const base =
      this.variant() === 'boxed'
        ? 'flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-[0.86rem] transition-colors'
        : 'flex h-13 w-full items-center justify-between border-b bg-transparent px-0 py-3 text-left text-[1rem] transition-colors';

    if (this.invalid()) {
      return `${base} border-destructive`;
    }

    return this.variant() === 'boxed'
      ? `${base} border-[#e7e5e4] hover:border-[#d6d3d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/20`
      : `${base} border-input hover:border-foreground`;
  }

  protected panelClass(): string {
    return this.variant() === 'boxed'
      ? 'absolute left-0 top-[calc(100%+0.35rem)] z-50 w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-[#e8e2da] bg-white shadow-[0_18px_40px_-24px_rgba(27,21,18,0.45)]'
      : 'absolute left-0 top-[calc(100%+0.25rem)] z-50 w-[min(92vw,26rem)] border border-hairline bg-popover text-popover-foreground shadow-[0_24px_50px_-28px_oklch(0.2_0.02_47/0.55)]';
  }

  protected optionClass(selected: boolean): string {
    if (this.variant() === 'boxed') {
      return selected ? 'bg-[#faf7f2] hover:bg-[#faf7f2]' : 'hover:bg-[#faf7f2]';
    }
    return selected ? 'bg-accent hover:bg-accent' : 'hover:bg-accent';
  }

  protected toggleOpen(): void {
    this.open() ? this.close() : this.open.set(true);
  }

  protected select(country: Country): void {
    this.changed.emit(country);
    this.close();
  }

  protected searchValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private close(): void {
    this.open.set(false);
    this.query.set('');
  }
}
