import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = '';
  password = '';
  confirmationCode = '';
  errorMessage = '';
  loading = false;
  step: 'register' | 'confirm' = 'register';

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    this.errorMessage = '';
    this.loading = true;
    try {
      await this.authService.register(this.email, this.password);
      this.step = 'confirm';
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al registrar la cuenta';
      console.error('Register error:', err);
    } finally {
      this.loading = false;
    }
  }

  async onConfirm() {
    this.errorMessage = '';
    this.loading = true;
    try {
      await this.authService.confirmRegistration(this.email, this.confirmationCode);
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Código de confirmación inválido';
      console.error('Confirm error:', err);
    } finally {
      this.loading = false;
    }
  }
}