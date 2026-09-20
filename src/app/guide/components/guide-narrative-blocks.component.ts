import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  GuideNarrativeBlock,
  isQuoteParagraph,
  stripOuterQuotes,
} from '../guide-content-format';

@Component({
  selector: 'kn-guide-narrative-blocks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-5">
      @for (block of blocks(); track $index; let i = $index) {
        @switch (block.type) {
          @case ('paragraph') {
            @if (isQuote(block.text)) {
              <blockquote
                class="relative my-7 border-l-2 border-primary pl-6 sm:pl-8"
              >
                <span
                  class="pointer-events-none absolute -left-1 top-0 -translate-x-full font-display text-[3.4rem] leading-none text-primary/60"
                  aria-hidden="true"
                  >“</span
                >
                <p class="font-display text-xl leading-snug text-foreground sm:text-[1.35rem]">
                  {{ stripped(block.text) }}
                </p>
              </blockquote>
            } @else {
              <p [class]="paragraphClass(i)">
                @for (run of runs(block.text); track $index) {
                  @if (run.quoted) {
                    <span class="whitespace-nowrap">
                      <span class="text-primary" aria-hidden="true">{{ run.left }}</span>
                      <em class="not-italic font-semibold text-foreground">{{ run.text }}</em>
                      <span class="text-primary" aria-hidden="true">{{ run.right }}</span>
                    </span>
                  } @else {
                    {{ run.text }}
                  }
                }
              </p>
            }
          }
          @case ('subheading') {
            <h3 class="flex items-center gap-3 pt-2 font-display text-2xl text-foreground">
              <span class="h-px w-8 bg-primary" aria-hidden="true"></span>
              {{ block.text }}
            </h3>
          }
          @case ('list') {
            <div class="grid gap-3 pt-2 sm:grid-cols-2">
              @for (item of block.items; track $index) {
                <div class="rounded-xl border border-hairline bg-gradient-to-b from-paper to-sand/40 p-4">
                  <div class="flex items-start gap-3">
                    <span
                      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        class="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m3.5 8.5 3 3 6-6"></path>
                      </svg>
                    </span>
                    <p class="text-[0.95rem] leading-relaxed text-foreground/90">
                      @if (item.label) {
                        <strong class="font-display text-[0.98rem] text-foreground"
                          >{{ item.label }}</strong
                        >
                        <span class="text-muted-foreground"> — </span>
                      }
                      {{ item.text }}
                    </p>
                  </div>
                </div>
              }
            </div>
          }
          @case ('rates') {
            <dl class="grid gap-3 pt-2 sm:grid-cols-3">
              @for (row of block.rows; track row.currency) {
                <div class="rounded-xl border border-hairline bg-paper px-4 py-4">
                  <dt class="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {{ row.currency }}
                  </dt>
                  <dd class="mt-1.5 font-display text-lg tabular-nums text-foreground">
                    {{ row.range }}
                  </dd>
                </div>
              }
            </dl>
          }
        }
      }
    </div>
  `,
})
export class GuideNarrativeBlocksComponent {
  readonly blocks = input<GuideNarrativeBlock[]>([]);
  readonly leadWithDropCap = input(false);

  protected isQuote(text: string): boolean {
    return isQuoteParagraph(text);
  }

  protected stripped(text: string): string {
    return stripOuterQuotes(text);
  }

  protected runs(text: string): { text: string; quoted: boolean; left: string; right: string }[] {
    const parts: { text: string; quoted: boolean; left: string; right: string }[] = [];
    const re = /“([^”]+)”|"([^"]+)"/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const matched = match[0];
      if (match.index > last) {
        parts.push({ text: text.slice(last, match.index), quoted: false, left: '', right: '' });
      }
      const phrase = match[1] ?? match[2];
      if (phrase && phrase.trim() !== '') {
        parts.push({
          text: phrase,
          quoted: true,
          left: matched[0],
          right: matched[matched.length - 1],
        });
      } else {
        parts.push({ text: matched, quoted: false, left: '', right: '' });
      }
      last = re.lastIndex;
    }
    if (last < text.length) {
      parts.push({ text: text.slice(last), quoted: false, left: '', right: '' });
    }
    return parts.length > 0 ? parts : [{ text, quoted: false, left: '', right: '' }];
  }

  protected paragraphClass(index: number): string {
    if (this.leadWithDropCap()) {
      return index === 0
        ? 'first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[3.1rem] first-letter:leading-[0.85] first-letter:tracking-tight first-letter:text-clay text-[1.15rem] leading-[1.75]'
        : 'text-[1.02rem] leading-relaxed text-foreground/90';
    }

    return index === 0
      ? 'border-l-2 border-clay/45 pl-5 text-[1.08rem] leading-[1.8]'
      : 'text-[1.02rem] leading-relaxed text-foreground/90';
  }
}