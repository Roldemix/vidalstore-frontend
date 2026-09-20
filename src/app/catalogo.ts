import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const GATEWAY_URL = 'http://localhost:8080/v1';

export interface Juego {
  id: string;
  nombre: string;
  precio: number;
}

export interface Licencia {
  id: string;
  juegoId: string;
  usuarioId: string;
  fecha: string;
  revocada: boolean;
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
}