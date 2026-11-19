import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// La API vive bajo el mismo origen que el frontend: Caddy sirve la aplicacion
// estatica en / y reenvia /v1/* al gateway. Solo en desarrollo local se apunta
// al gateway del compose, porque `ng serve` usa el puerto 4200.
const RUTA_API = '/v1';
const GATEWAY_LOCAL = 'http://localhost:8080/v1';

function baseApi(): string {
  if (typeof window === 'undefined') return GATEWAY_LOCAL;
  const { hostname, origin } = window.location;
  const esLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  return esLocal ? GATEWAY_LOCAL : `${origin}${RUTA_API}`;
}

const GATEWAY_URL = baseApi();

export interface Juego {
  id: string;
  titulo: string;
  precio: number;
}

export interface Licencia {
  id: string;
  juegoId: string;
  titulo: string | null;
  usuarioSub: string;
  adquiridaEn: string;
  estado: 'activa' | 'revocada';
}

// Lo que ve el administrador: todas las licencias, sin título compuesto.
export interface LicenciaAdmin {
  id: string;
  juegoId: string;
  usuarioSub: string;
  adquiridaEn: string;
  estado: 'activa' | 'revocada';
  revocadaEn: string | null;
  revocadaPor: string | null;
}

export interface PanelEnVivo {
  kpi: Array<{ juegoId: string; minuto: string; tipo: string; unidades: number; monto: number }>;
  alertas: Array<{ eventoId: string; juegoId: string; enError: number; terminadas: number }>;
  ventas: Array<{ juegoId: string; semana: string; tipo: string; unidades: number; monto: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class Catalogo {
  private http = inject(HttpClient);

  getCatalogo() {
    return this.http.get<Juego[]>(`${GATEWAY_URL}/catalogo`);
  }

  comprar(juegoId: string) {
    return this.http.post<Licencia>(`${GATEWAY_URL}/compras`, { juegoId });
  }

  getBiblioteca() {
    return this.http.get<Licencia[]>(`${GATEWAY_URL}/biblioteca`);
  }

  getLicencias() {
    return this.http.get<LicenciaAdmin[]>(`${GATEWAY_URL}/licencias`);
  }

  revocar(licenciaId: string, motivo: string) {
    return this.http.delete<LicenciaAdmin>(`${GATEWAY_URL}/licencias/${licenciaId}`, {
      body: { motivo },
    });
  }

  getPanel() {
    return this.http.get<PanelEnVivo>(`${GATEWAY_URL}/panel/en-vivo`);
  }
}