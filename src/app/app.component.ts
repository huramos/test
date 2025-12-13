import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);

  init = false;

  async ngOnInit() {
    console.log('[AppComponent] Starting auth initialization');
    // Wait for Firebase Auth to fully initialize
    await firstValueFrom(
      this.authService.authInitialized$.pipe(
        filter(initialized => initialized === true)
      )
    );
    console.log('[AppComponent] Auth initialization complete, rendering app');
    this.init = true;
  }
}
