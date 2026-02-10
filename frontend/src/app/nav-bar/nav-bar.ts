import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterLink],
  templateUrl: './nav-bar.html',
  styles: `
    .simpsons-navbar {
      background-color: #FFD90F; /* Simpsons Yellow */
      font-family: 'Luckiest Guy', cursive;
    }
    .simpsons-navbar .navbar-brand, 
    .simpsons-navbar .nav-link {
      color: black !important;
      font-size: 1.5rem; /* Make it a bit bigger for that cartoon feel */
    }
  `,
})
export class NavBar {
  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
