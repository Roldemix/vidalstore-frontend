import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
  this.errorMessage = '';
  this.loading = true;
  try {
    await this.authService.logout(); // 👈 cierra cualquier sesión previa
    await this.authService.login(this.email, this.password);
    const groups = await this.authService.getUserGroups();
    console.log('Grupos del usuario:', groups);
    this.router.navigate(['/']);
  } catch (err: any) {
    this.errorMessage = err.message || 'Error al iniciar sesión';
    console.error('Login error:', err);
  } finally {
    this.loading = false;
  }
}
}