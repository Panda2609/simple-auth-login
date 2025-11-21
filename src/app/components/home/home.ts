import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  user = {
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    registeredDate: new Date().toLocaleDateString('es-ES')
  };
  
  token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí irían los datos del usuario logueado desde el servicio
    // this.user = this.authService.getCurrentUser();
  }

  logout() {
    // Limpiar datos y redirigir a login
    this.router.navigate(['/login']);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
