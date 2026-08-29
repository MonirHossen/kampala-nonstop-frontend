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
import { LucideCheck, LucideChevronsUpDown, LucideSearch } from '@lucide/angular';
import { COUNTRIES, type Country } from '../core/lib/countries';

@Component({
  selector: 'kn-country-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck, LucideChevronsUpDown, LucideSearch],
  host: { class: 'relative block' },
  template: `
    <button
      type="button"
      role="combobox"
      aria-label="Country"
      [attr.aria-expanded]="open()"
      (click)="toggleOpen()"
      class="flex h-13 w-full items-center justify-between border-b bg-transparent px-0 py-3 text-left text-[1rem] transition-colors"
      [class]="invalid() ? 'border-destructive' : 'border-input hover:border-foreground'"
    >
      <span class="truncate">
        {{ value().name }} <span class="text-muted-foreground">({{ value().dial }})</span>
      </span>
      <svg lucideChevronsUpDown class="ml-2 h-4 w-4 shrink-0 text-muted-foreground"></svg>
    </button>

    @if (open()) {
      <div
        class="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-[min(92vw,26rem)] border border-hairline bg-popover text-popover-foreground shadow-[0_24px_50px_-28px_oklch(0.2_0.02_47/0.55)]"
      >
        <div class="flex items-center gap-2 border-b border-hairline px-3">
          <svg lucideSearch class="h-4 w-4 text-muted-foreground"></svg>
          <input
            #search
            [value]="query()"
            (input)="query.set(searchValue($event))"
            placeholder="Search country or code"
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
                  class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  [class.bg-accent]="selected"
                >
                  <span class="truncate">{{ country.name }}</span>
                  <span class="ml-3 flex items-center gap-2 text-muted-foreground">
                    {{ country.dial }}
                    @if (selected) {
                      <svg lucideCheck class="h-3.5 w-3.5 text-primary"></svg>
                    }
                  </span>
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
  readonly changed = output<Country>();

  protected readonly open = signal(false);
  protected readonly query = signal('');

  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase() === q,
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
