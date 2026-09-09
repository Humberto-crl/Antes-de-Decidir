import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
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

@NgModule({
  declarations: [
    App,
    Header,
    Footer,
    Home,
    Login,
    Register,
    Situaciones,
    MiCamino,
    Analisis,
    Comparador,
    Checklist,
    Escenarios,
    Perfil,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
