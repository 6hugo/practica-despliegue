import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Api } from '../api';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
  private allLocations$ = new BehaviorSubject<any[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');

  public favorites$ = new BehaviorSubject<any[]>([]);
  public processingFavorites = new Set<number>();
  public showFavoritesOnly$ = new BehaviorSubject<boolean>(false);
  public loadingFavorites$ = new BehaviorSubject<boolean>(false);

  private selectedLocationSubject = new BehaviorSubject<any>(null);
  selectedLocation$ = this.selectedLocationSubject.asObservable();

  filteredLocations$!: Observable<any[]>;
  searchTerm: string = '';
  showFavoritesOnly: boolean = false;

  constructor(
    private api: Api,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.authService.favorites$.subscribe(favs => this.favorites$.next(favs));
    this.authService.locations$.subscribe(locs => this.allLocations$.next(locs));

    this.authService.getLocations().subscribe();

    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      if (!this.authService.favoritesLoaded) this.loadingFavorites$.next(true);
      this.authService.getFavorites().subscribe({
        next: () => this.loadingFavorites$.next(false),
        error: () => this.loadingFavorites$.next(false)
      });
    }

    this.filteredLocations$ = combineLatest([
      this.allLocations$, this.searchTerm$, this.favorites$, this.showFavoritesOnly$
    ]).pipe(
      map(([locations, term, favorites, showFavs]) => {
        let result = [...locations];
        if (showFavs) {
          // Buscamos por characterId (el campo unificado)
          const favIds = favorites.map(f => f.characterId);
          result = result.filter(l => favIds.includes(l.id));
        }
        if (term.trim()) {
          const lowerTerm = term.toLowerCase();
          result = result.filter(loc => loc.name.toLowerCase().includes(lowerTerm));
        }
        return result;
      })
    );
  }

  isProcessing(locationId: number): boolean { return this.processingFavorites.has(locationId); }
  
  // Ahora isFavorite siempre encontrará el ID porque el Service usa characterId
  isFavorite(location: any): boolean {
    return this.favorites$.value.some(f => f.characterId === location.id);
  }

  toggleFavorite(location: any, event: Event): void {
    event.stopPropagation();
    if (this.isProcessing(location.id)) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/sign-up']); return; }

    this.processingFavorites.add(location.id);
    // Buscamos el favorito usando characterId para poder borrarlo
    const existingFav = this.favorites$.value.find(f => f.characterId === location.id);

    if (existingFav) {
      this.authService.removeFavorite(existingFav.id).subscribe({
        next: () => this.processingFavorites.delete(location.id),
        error: () => this.processingFavorites.delete(location.id)
      });
    } else {
      this.authService.addLocationFavorite(location).subscribe({
        next: () => this.processingFavorites.delete(location.id),
        error: () => this.processingFavorites.delete(location.id)
      });
    }
  }

  toggleShowFavorites(): void { this.showFavoritesOnly = !this.showFavoritesOnly; this.showFavoritesOnly$.next(this.showFavoritesOnly); }
  filterLocations(): void { this.searchTerm$.next(this.searchTerm); }
  openModal(location: any): void {
    this.api.getLocationById(location.id).subscribe((fullLoc: any) => {
      this.selectedLocationSubject.next(fullLoc);
      document.body.style.overflow = 'hidden';
    });
  }
  closeModal(): void { this.selectedLocationSubject.next(null); document.body.style.overflow = 'auto'; }
}