import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './home/home';
import { authGuard } from './auth-guard';
import { Panel } from './panel/panel';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'panel', component: Panel, canActivate: [authGuard] },
];