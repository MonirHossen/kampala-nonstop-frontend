import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocalKnowledgePopupComponent } from './local-knowledge/local-knowledge-popup.component';
import { ToasterComponent } from './shared/toaster.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToasterComponent, LocalKnowledgePopupComponent],
  template: `
    <router-outlet />
    <kn-toaster />
    <kn-local-knowledge-popup />
  `,
})
export class App {}
