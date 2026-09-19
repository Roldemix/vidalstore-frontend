import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  groups = signal<string[]>([]);
  loading = signal(true);

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      const groups = await this.authService.getUserGroups();
      this.email.set(user.signInDetails?.loginId || user.username);
      this.groups.set(groups);
    } catch (err) {
      console.error('Error cargando usuario:', err);
      this.router.navigate(['/login']);
    } finally {
      this.loading.set(false);
    }
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}