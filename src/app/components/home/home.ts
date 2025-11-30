import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, User } from '../../services/auth';
import { FormatTimePipe } from '../../pipes/format-time.pipe';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormatTimePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  user: User | null = null;
  token: string = '';
  expirationTimeInMinutes: number | null = null;
  isSessionExpiringSoon: boolean = false;
  private sessionUpdateSubscription: Subscription | null = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: Auth,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) {
      return;
    }

    // Obtener datos del usuario del localStorage
    this.user = this.authService.getUser();
    this.token = this.authService.getToken() || '';

    // Si no hay usuario, redirigir a login
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Actualizar el tiempo de sesión inmediatamente
    this.updateSessionTime();

    // Actualizar el tiempo de sesión cada segundo
    this.sessionUpdateSubscription = interval(1000).subscribe(() => {
      this.updateSessionTime();
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.sessionUpdateSubscription) {
      this.sessionUpdateSubscription.unsubscribe();
    }
  }

  updateSessionTime() {
    this.expirationTimeInMinutes = this.authService.getTokenExpirationTime();
    this.isSessionExpiringSoon = this.authService.isTokenExpiringSoon(5);

    // Si la sesión expiró, redirigir a login
    if (this.expirationTimeInMinutes === 0) {
      this.logout();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
