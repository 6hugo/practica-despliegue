import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
})
export class Characters implements OnInit {
  private allCharacters$ = new BehaviorSubject<any[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');
  public favorites$ = new BehaviorSubject<any[]>([]); 
  private showFavoritesOnly$ = new BehaviorSubject<boolean>(false);
  public loadingFavorites$ = new BehaviorSubject<boolean>(false); // Arregla TS2339

  filteredCharacters$!: Observable<any[]>;
  searchTerm: string = '';
  selectedCharacter: any = null;
  showFavoritesOnly: boolean = false;
  processingFavorites = new Set<number>();

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // 1. Conectamos la memoria local a la global del Service
    this.authService.favorites$.subscribe(favs => this.favorites$.next(favs));
    this.authService.characters$.subscribe(chars => this.allCharacters$.next(chars));

    // 2. Pedimos la carga (el Service sabrá si usar caché o internet)
    this.authService.getCharacters().subscribe();

    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      // 3. SOLO mostramos el spinner si no hay nada en la memoria
      if (!this.authService.favoritesLoaded) this.loadingFavorites$.next(true);
      
      this.authService.getFavorites().subscribe({
        next: () => this.loadingFavorites$.next(false),
        error: () => this.loadingFavorites$.next(false)
      });
    }

    this.filteredCharacters$ = combineLatest([
      this.allCharacters$, this.searchTerm$, this.favorites$, this.showFavoritesOnly$
    ]).pipe(
      map(([characters, term, favorites, showFavs]) => {
        let result = [...characters];
        if (showFavs) {
          const favIds = favorites.map(f => f.characterId);
          result = result.filter(c => favIds.includes(c.id));
        }
        if (term.trim()) {
          const lowerTerm = term.toLowerCase();
          result = result.filter(char => char.name.toLowerCase().includes(lowerTerm));
        }
        return result;
      })
    );
  }

  isProcessing(characterId: number): boolean { return this.processingFavorites.has(characterId); }
  isFavorite(character: any): boolean { return this.favorites$.value.some(f => f.characterId === character.id); }

  toggleFavorite(character: any, event: Event): void {
    event.stopPropagation();
    if (this.isProcessing(character.id)) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/sign-up']); return; }

    this.processingFavorites.add(character.id);
    const existingFav = this.favorites$.value.find(f => f.characterId === character.id);

    if (existingFav) {
      this.authService.removeFavorite(existingFav.id).subscribe({
        next: () => this.processingFavorites.delete(character.id),
        error: () => this.processingFavorites.delete(character.id)
      });
    } else {
      this.authService.addFavorite(character).subscribe({
        next: () => this.processingFavorites.delete(character.id),
        error: () => this.processingFavorites.delete(character.id)
      });
    }
  }

  filterCharacters(): void { this.searchTerm$.next(this.searchTerm); }
  toggleShowFavorites(): void { this.showFavoritesOnly = !this.showFavoritesOnly; this.showFavoritesOnly$.next(this.showFavoritesOnly); }
  openModal(character: any) { this.selectedCharacter = character; document.body.style.overflow = 'hidden'; }
  closeModal() { this.selectedCharacter = null; document.body.style.overflow = 'auto'; }
  trackById(index: number, character: any): number { return character.id; }
}