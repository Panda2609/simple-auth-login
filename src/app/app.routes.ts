import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';
import { authGuard, publicGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
