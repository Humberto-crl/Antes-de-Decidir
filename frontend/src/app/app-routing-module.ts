import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Situaciones } from './features/situaciones/situaciones';
import { MiCamino } from './features/mi-camino/mi-camino';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
