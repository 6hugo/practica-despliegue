import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './episodes.html',
  styleUrl: './episodes.css',
})
export class Episodes implements OnInit {
  private allEpisodes$ = new BehaviorSubject<any[]>([]);
  private seasonFilter$ = new BehaviorSubject<string>('');
  private yearFilter$ = new BehaviorSubject<string>('');
  private nameFilter$ = new BehaviorSubject<string>('');

  public favorites$ = new BehaviorSubject<any[]>([]);
  public processingFavorites = new Set<number>();
  public showFavoritesOnly$ = new BehaviorSubject<boolean>(false);
  public loadingFavorites$ = new BehaviorSubject<boolean>(false); // Arregla TS2339

  filteredEpisodes$!: Observable<any[]>;
  seasonFilter: string = '';
  yearFilter: string = '';
  nameFilter: string = '';
  showFavoritesOnly: boolean = false;
  availableSeasons: number[] = [];
  availableYears: number[] = [];
  selectedEpisode: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.authService.favorites$.subscribe(favs => this.favorites$.next(favs));
    this.authService.episodes$.subscribe(eps => {
      this.allEpisodes$.next(eps);
      this.extractFilters(eps);
    });

    this.authService.getEpisodes().subscribe();

    if (isPlatformBrowser(this.platformId) && this.authService.isLoggedIn()) {
      // Evita mostrar el spinner si ya hay caché
      if (!this.authService.favoritesLoaded) this.loadingFavorites$.next(true);
      
      this.authService.getFavorites().subscribe({
        next: () => this.loadingFavorites$.next(false),
        error: () => this.loadingFavorites$.next(false)
      });
    }

    this.filteredEpisodes$ = combineLatest([
      this.allEpisodes$, this.seasonFilter$, this.yearFilter$, this.nameFilter$, this.favorites$, this.showFavoritesOnly$
    ]).pipe(
      map(([episodes, season, year, name, favorites, showFavs]) => {
        let result = episodes;
        if (showFavs) {
          // Buscamos el ID en characterId por el truco del service
          const favIds = favorites.map(f => f.characterId);
          result = result.filter(e => favIds.includes(e.id));
        }
        return result.filter(episode => {
          if (season && episode.season.toString() !== season) return false;
          if (year && this.getYearFromDate(episode.airdate).toString() !== year) return false;
          if (name && !episode.name.toLowerCase().includes(name.toLowerCase())) return false;
          return true;
        });
      })
    );
  }

  isProcessing(episodeId: number): boolean { // Re-añadido para arreglar TS2339
    return this.processingFavorites.has(episodeId);
  }

  isFavorite(episode: any): boolean {
    return this.favorites$.value.some(f => f.characterId === episode.id);
  }

  toggleFavorite(episode: any, event: Event): void {
    event.stopPropagation();
    if (this.isProcessing(episode.id)) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/sign-up']); return; }

    this.processingFavorites.add(episode.id);
    const existingFav = this.favorites$.value.find(f => f.episodeId === episode.id);

    if (existingFav) {
      this.authService.removeFavorite(existingFav.id).subscribe({
        next: () => this.processingFavorites.delete(episode.id),
        error: () => this.processingFavorites.delete(episode.id)
      });
    } else {
      this.authService.addEpisodeFavorite(episode).subscribe({
        next: () => this.processingFavorites.delete(episode.id),
        error: () => this.processingFavorites.delete(episode.id)
      });
    }
  }

  updateSeasonFilter(): void { this.seasonFilter$.next(this.seasonFilter); }
  updateYearFilter(): void { this.yearFilter$.next(this.yearFilter); }
  updateNameFilter(): void { this.nameFilter$.next(this.nameFilter); }
  toggleShowFavorites(): void { this.showFavoritesOnly = !this.showFavoritesOnly; this.showFavoritesOnly$.next(this.showFavoritesOnly); }
  private extractFilters(episodes: any[]): void {
    const seasons = new Set<number>(); const years = new Set<number>();
    episodes.forEach(ep => { if (ep.season) seasons.add(ep.season); const y = this.getYearFromDate(ep.airdate); if (y) years.add(y); });
    this.availableSeasons = Array.from(seasons).sort((a, b) => a - b);
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }
  private getYearFromDate(dateStr: string): number { if (!dateStr) return 0; const d = new Date(dateStr); return !isNaN(d.getFullYear()) ? d.getFullYear() : 0; }
  openModal(episode: any): void { this.selectedEpisode = episode; document.body.style.overflow = 'hidden'; }
  closeModal(): void { this.selectedEpisode = null; document.body.style.overflow = 'auto'; }
}