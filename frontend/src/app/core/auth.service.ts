import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './config';
import { RespuestaAuth, Usuario } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Signals: variables "reactivas". Cuando cambian, la pantalla se actualiza sola.
  token = signal<string | null>(localStorage.getItem('token'));
  usuario = signal<Usuario | null>(this.leerUsuario());
  logueado = computed(() => !!this.token());

  async login(correo: string, password: string) {
    const r = await firstValueFrom(this.http.post<RespuestaAuth>(`${API_URL}/auth/login`, { correo, password }));
    this.guardar(r);
  }

  async registro(datos: { nombre: string; apellido: string; correo: string; password: string }) {
    const r = await firstValueFrom(this.http.post<RespuestaAuth>(`${API_URL}/auth/registro`, datos));
    this.guardar(r);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.token.set(null);
    this.usuario.set(null);
  }

  private guardar(r: RespuestaAuth) {
    localStorage.setItem('token', r.token);
    localStorage.setItem('usuario', JSON.stringify(r.usuario));
    this.token.set(r.token);
    this.usuario.set(r.usuario);
  }

  private leerUsuario(): Usuario | null {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  }
}
