import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.HomePage) },
  { path: 'login', loadComponent: () => import('./pages/login').then((m) => m.LoginPage) },
  { path: 'registro', loadComponent: () => import('./pages/registro').then((m) => m.RegistroPage) },
  { path: 'herramientas', loadComponent: () => import('./pages/herramientas').then((m) => m.HerramientasPage) },
  {
    path: 'mi-camino', canActivate: [authGuard],
    loadComponent: () => import('./pages/mi-camino').then((m) => m.MiCaminoPage),
  },
  {
    path: 'nueva', canActivate: [authGuard],
    loadComponent: () => import('./pages/nueva-situacion').then((m) => m.NuevaSituacionPage),
  },
  {
    path: 'situacion/:id', canActivate: [authGuard],
    loadComponent: () => import('./pages/detalle').then((m) => m.DetallePage),
  },
  {
    path: 'historial', canActivate: [authGuard],
    loadComponent: () => import('./pages/historial').then((m) => m.HistorialPage),
  },
  { path: '**', redirectTo: '' },
];
