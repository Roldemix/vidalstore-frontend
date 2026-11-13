import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { Catalogo, PanelEnVivo } from '../catalogo';

@Component({
  selector: 'app-panel',
  imports: [CommonModule],
  templateUrl: './panel.html',
})
export class Panel implements OnInit, OnDestroy {
  private readonly catalogo = inject(Catalogo);
  private actualizacion?: Subscription;
  readonly datos = signal<PanelEnVivo | null>(null);
  readonly error = signal('');

  ngOnInit(): void {
    this.actualizacion = interval(5000)
      .pipe(startWith(0), switchMap(() => this.catalogo.getPanel()))
      .subscribe({
        next: (datos) => {
          this.datos.set(datos);
          this.error.set('');
        },
        error: () => this.error.set('No se pudo actualizar el panel'),
      });
  }

  ngOnDestroy(): void {
    this.actualizacion?.unsubscribe();
  }
}
