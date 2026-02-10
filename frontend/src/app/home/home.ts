import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  searchTerm: string = '';

  constructor(private sanitizer: DomSanitizer) {
    this.categories.forEach(cat => {
      cat.icon = this.sanitizer.bypassSecurityTrustHtml(cat.icon) as any;
    });
  }

  categories: any[] = [
    {
      title: 'Characters',  
      route: '/characters',
      // Pink Donut with sprinkles
      icon: `<svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="#D2934D"/>
        <path d="M50 15C35 15 22 25 18 40C16 48 18 55 25 55C28 55 30 52 35 52C40 52 42 58 48 58C54 58 56 52 62 52C68 52 70 56 75 56C80 56 82 50 82 40C82 25 68 15 50 15Z" fill="#F48FB1"/>
        <circle cx="50" cy="50" r="12" fill="#87CEEB"/>
        <!-- Sprinkles -->
        <rect x="35" y="25" width="6" height="2" rx="1" transform="rotate(20 35 25)" fill="#FFD90F"/>
        <rect x="65" y="30" width="6" height="2" rx="1" transform="rotate(-45 65 30)" fill="#72C7E7"/>
        <rect x="45" y="45" width="6" height="2" rx="1" transform="rotate(60 45 45)" fill="#FFFFFF"/>
        <rect x="60" y="20" width="6" height="2" rx="1" transform="rotate(10 60 20)" fill="#93E223"/>
      </svg>`,
      description: 'From Homer to Gary Chalmers.',
      colorClass: 'card-pink'
    },
    {
      title: 'Episodes',
      route: '/episodes',
      // Old TV
      icon: `<svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         <rect x="15" y="25" width="70" height="50" rx="5" fill="#5D4037"/>
         <rect x="20" y="30" width="50" height="40" rx="2" fill="#B3E5FC"/>
         <path d="M75 35H80V40H75V35Z" fill="#3D3D3D"/>
         <path d="M75 45H80V50H75V45Z" fill="#3D3D3D"/>
         <path d="M30 25L15 10" stroke="#3D3D3D" stroke-width="3" stroke-linecap="round"/>
         <path d="M70 25L85 10" stroke="#3D3D3D" stroke-width="3" stroke-linecap="round"/>
       </svg>`,
      description: 'Guide to all seasons.',
      colorClass: 'card-pink'
    },
    {
      title: 'Locations',
      route: '/locations',
      // Kwik-E-Mart / Store
      icon: `<svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 90V40L50 15L80 40V90H20Z" fill="#81C784"/>
        <path d="M20 40H80" stroke="#388E3C" stroke-width="4"/>
        <rect x="35" y="55" width="30" height="35" fill="#64B5F6"/>
        <rect x="35" y="55" width="30" height="35" stroke="#1976D2" stroke-width="3"/>
        <path d="M50 15L20 40H80L50 15Z" fill="#AED581"/>
        <rect x="48" y="70" width="4" height="4" rx="2" fill="#1976D2"/>
      </svg>`,
      description: 'Visit the Badulaque or Moe\'s.',
      colorClass: 'card-pink'
    }
  ];

  onSearch() {
    if (this.searchTerm) {
      console.log('Searching:', this.searchTerm);
    }
  }
}
