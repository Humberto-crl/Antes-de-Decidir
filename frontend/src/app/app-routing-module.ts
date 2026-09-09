import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Situaciones } from './features/situaciones/situaciones';
import { MiCamino } from './features/mi-camino/mi-camino';
import { Analisis } from './features/analisis/analisis';
import { Comparador } from './features/comparador/comparador';
import { Checklist } from './features/checklist/checklist';
import { Escenarios } from './features/escenarios/escenarios';
import { Perfil } from './features/perfil/perfil';

const routes: Routes = [
  {
    path: 'inicio',
    component: Home
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'registro',
    component: Register
  },
  {
    path: 'situaciones',
    component: Situaciones
  },
  {
    path: 'mi-camino',
    component: MiCamino
  },
  {
    path: 'analisis',
    component: Analisis
  },
  {
    path: 'comparador',
    component: Comparador
  },
  {
    path: 'checklist',
    component: Checklist
  },
  {
    path: 'escenarios',
    component: Escenarios
  },
  {
    path: 'perfil',
    component: Perfil
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
