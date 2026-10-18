import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Catalogo, Juego, Licencia, LicenciaAdmin } from '../catalogo';
import { Router } from '@angular/router';

function mensajeDe(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const m = err.error?.message;
    if (Array.isArray(m)) return m.join('; ');
    if (typeof m === 'string') return m;
    if (err.status === 0) return 'No se pudo contactar el servidor';
    return `Error ${err.status}`;
  }
  return 'Error inesperado';
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private catalogoService = inject(Catalogo);
  private router = inject(Router);

  email = signal('');
  groups = signal<string[]>([]);
  loading = signal(true);

  juegos = signal<Juego[]>([]);
  biblioteca = signal<Licencia[]>([]);
  licencias = signal<LicenciaAdmin[]>([]);
  comprando = signal<string | null>(null); // id del juego que se está comprando
  revocando = signal<string | null>(null); // id de la licencia que se está revocando
  error = signal('');
  aviso = signal('');

  get esEditor() {
    return this.groups().includes('editores') || this.groups().includes('administradores');
  }

  get esAdmin() {
    return this.groups().includes('administradores');
  }

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      const groups = await this.authService.getUserGroups();
      this.email.set(user.signInDetails?.loginId || user.username);
      this.groups.set(groups);

      this.catalogoService.getCatalogo().subscribe({
        next: (juegos) => this.juegos.set(juegos),
        error: (err) => this.error.set(mensajeDe(err)),
      });
      this.cargarBiblioteca();
      if (this.esAdmin) this.cargarLicencias();
    } catch (err) {
      console.error('Error cargando usuario:', err);
      this.router.navigate(['/login']);
    } finally {
      this.loading.set(false);
    }
  }

  private cargarBiblioteca() {
    this.catalogoService.getBiblioteca().subscribe({
      next: (licencias) => this.biblioteca.set(licencias),
      error: (err) => this.error.set(mensajeDe(err)),
    });
  }

  cargarLicencias() {
    this.catalogoService.getLicencias().subscribe({
      next: (l) => this.licencias.set(l),
      error: (err) => this.error.set(mensajeDe(err)),
    });
  }

  yaComprado(juegoId: string): boolean {
    return this.biblioteca().some((l) => l.juegoId === juegoId && l.estado === 'activa');
  }

  comprar(juegoId: string) {
    this.error.set('');
    this.aviso.set('');
    this.comprando.set(juegoId);
    this.catalogoService.comprar(juegoId).subscribe({
      next: () => {
        this.cargarBiblioteca();
        this.comprando.set(null);
        this.aviso.set('Compra realizada');
      },
      error: (err) => {
        this.error.set(mensajeDe(err));
        this.comprando.set(null);
      },
    });
  }

  revocar(licenciaId: string) {
    this.error.set('');
    this.aviso.set('');
    this.revocando.set(licenciaId);
    this.catalogoService.revocar(licenciaId, 'Revocada desde el panel de administración').subscribe({
      next: () => {
        this.revocando.set(null);
        this.aviso.set('Licencia revocada');
        this.cargarLicencias();
        this.cargarBiblioteca();
      },
      error: (err) => {
        this.revocando.set(null);
        this.error.set(mensajeDe(err));
      },
    });
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}