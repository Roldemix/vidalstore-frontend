import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Catalogo, Juego, Licencia } from '../catalogo';
import { Router } from '@angular/router';

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
  comprando = signal<string | null>(null); // id del juego que se está comprando

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

      this.catalogoService.getCatalogo().subscribe((juegos) => this.juegos.set(juegos));
      this.catalogoService.getBiblioteca().subscribe((licencias) => this.biblioteca.set(licencias));
    } catch (err) {
      console.error('Error cargando usuario:', err);
      this.router.navigate(['/login']);
    } finally {
      this.loading.set(false);
    }
  }

  yaComprado(juegoId: string): boolean {
    return this.biblioteca().some((l) => l.juegoId === juegoId && !l.revocada);
  }

  comprar(juegoId: string) {
    this.comprando.set(juegoId);
    this.catalogoService.comprar(juegoId).subscribe({
      next: () => {
        this.catalogoService.getBiblioteca().subscribe((licencias) => this.biblioteca.set(licencias));
        this.comprando.set(null);
      },
      error: (err) => {
        console.error('Error al comprar:', err);
        this.comprando.set(null);
      },
    });
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}