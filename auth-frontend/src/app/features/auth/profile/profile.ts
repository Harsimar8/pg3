import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  isLoading = true;

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
