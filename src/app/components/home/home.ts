import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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
  loading: boolean = true;
  errorMessage: string = '';
  private sessionUpdateSubscription: Subscription | null = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    // Usar setTimeout para asegurar que se ejecute después de la hidratación
    setTimeout(() => {
      // Obtener token del localStorage
      this.token = this.authService.getToken() || '';

      // Si no hay token, redirigir a login
      if (!this.token) {
        this.router.navigate(['/login']);
        return;
      }

      // Cargar datos del usuario desde el backend
      this.loadUserProfile();

      // Actualizar el tiempo de sesión cada segundo
      this.sessionUpdateSubscription = interval(1000).subscribe(() => {
        this.updateSessionTime();
      });
    }, 0);
  }

  ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.sessionUpdateSubscription) {
      this.sessionUpdateSubscription.unsubscribe();
    }
  }

  // Cargar perfil del usuario desde el backend
  loadUserProfile() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response && response.success && response.user) {
          this.user = response.user;
          this.authService.saveUser(response.user);
          this.loading = false;
          this.updateSessionTime();
          this.cdr.markForCheck();
        } else {
          this.errorMessage = response?.message || 'Error desconocido';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Error cargando el perfil';
          const userFromStorage = this.authService.getUser();
          if (userFromStorage) {
            this.user = userFromStorage;
          }
          this.cdr.markForCheck();
        }
      }
    });
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
    // Llamar al endpoint de logout del backend (opcional, pero es buena práctica)
    this.authService.logoutBackend().subscribe({
      next: () => {
        console.log('Logout exitoso en backend');
        this.performLogout();
      },
      error: (error) => {
        console.error('Error en logout del backend:', error);
        // De todas formas, hacer logout en el frontend
        this.performLogout();
      }
    });
  }

  performLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
