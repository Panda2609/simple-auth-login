import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, User } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  user: User | null = null;
  token: string = '';

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit() {
    // Obtener datos del usuario del localStorage
    this.user = this.authService.getUser();
    this.token = this.authService.getToken() || '';

    // Si no hay usuario, redirigir a login
    if (!this.user) {
      this.router.navigate(['/login']);
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
