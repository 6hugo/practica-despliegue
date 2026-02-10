import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './scroll-to-top.html',
    styleUrl: './scroll-to-top.css'
})
export class ScrollToTop {
    isVisible = false;

    @HostListener('window:scroll')
    onWindowScroll() {
        // Show button when page is scrolled down 300px
        this.isVisible = (window.pageYOffset || document.documentElement.scrollTop) > 300;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
