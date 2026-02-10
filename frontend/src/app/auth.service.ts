import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs/operators';
import { Api } from './api'; 

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://kinematical-unbelonging-hildred.ngrok-free.dev/api';
    
    // --- ESTADO DE USUARIO Y ROLES ---
    private userSubject = new BehaviorSubject<string | null>(null);
    public user$ = this.userSubject.asObservable();
    
    private isAdminSubject = new BehaviorSubject<boolean>(false);
    public isAdmin$ = this.isAdminSubject.asObservable();

    private userId: number | null = null;

    // --- CACHÉ DE DATOS (Navegación instantánea) ---
    private favoritesSubject = new BehaviorSubject<any[]>([]);
    public favorites$ = this.favoritesSubject.asObservable();
    public favoritesLoaded = false; 

    private charactersSubject = new BehaviorSubject<any[]>([]);
    public characters$ = this.charactersSubject.asObservable();
    private charactersLoaded = false;

    private episodesSubject = new BehaviorSubject<any[]>([]);
    public episodes$ = this.episodesSubject.asObservable();
    private episodesLoaded = false;

    private locationsSubject = new BehaviorSubject<any[]>([]);
    public locations$ = this.locationsSubject.asObservable();
    private locationsLoaded = false;

    // CACHÉ DE USUARIOS PARA ADMIN
    private usersSubject = new BehaviorSubject<any[]>([]);
    public users$ = this.usersSubject.asObservable();
    public usersLoaded = false;

    constructor(
        private http: HttpClient,
        private api: Api,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('auth_token');
            if (token) { this.decodeAndSetUser(token); }
        }
    }

    private decodeAndSetUser(token: string) {
        try {
            const decoded: any = jwtDecode(token);
            this.userId = decoded.id ? Number(decoded.id) : null;
            const name = decoded.name || decoded.username || 'Usuario';
            
            // Detectar rol de administrador del JWT
            const roles = decoded.roles || [];
            this.isAdminSubject.next(roles.includes('ROLE_ADMIN'));
            
            this.userSubject.next(name);
        } catch (error) { this.logout(); }
    }

    // --- GESTIÓN DE USUARIOS (ADMIN) ---
    getUsers(): Observable<any[]> {
        if (this.usersLoaded) return of(this.usersSubject.value);
        return this.http.get<any>(`${this.apiUrl}/users`).pipe(
            map(res => res['member'] || res['hydra:member'] || res || []),
            tap(users => {
                this.usersSubject.next(users);
                this.usersLoaded = true;
            })
        );
    }

    deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`).pipe(
        tap({
            next: () => {
                // Solo si el servidor responde con éxito (204 No Content), 
                // lo quitamos de la memoria local
                const currentUsers = this.usersSubject.value.filter(u => u.id !== id);
                this.usersSubject.next(currentUsers);
                console.log(`Usuario ${id} eliminado correctamente del servidor.`);
            },
            error: (err) => {
                console.error("El servidor rechazó el borrado:", err);
            }
        })
    );
}

    getCurrentUserId(): number | null { return this.userId; }

    // --- MÉTODOS DE CACHÉ PÚBLICA ---
    getCharacters() {
        if (this.charactersLoaded) return of(this.charactersSubject.value);
        return this.api.getCharacters().pipe(
            tap((data: any) => { 
                this.charactersSubject.next(data.results || []); 
                this.charactersLoaded = true; 
            }),
            map((data: any) => data.results || [])
        );
    }

    getEpisodes() {
        if (this.episodesLoaded) return of(this.episodesSubject.value);
        return this.api.getEpisodes().pipe(
            tap((data: any) => { 
                this.episodesSubject.next(data.results || []); 
                this.episodesLoaded = true; 
            }),
            map((data: any) => data.results || [])
        );
    }

    getLocations() {
        if (this.locationsLoaded) return of(this.locationsSubject.value);
        return this.api.getLocations().pipe(
            tap((data: any) => { 
                this.locationsSubject.next(data.results || []); 
                this.locationsLoaded = true; 
            }),
            map((data: any) => data.results || [])
        );
    }

    getFavorites(): Observable<any[]> {
        if (this.favoritesLoaded) return of(this.favoritesSubject.value);
        if (!this.userId) { const t = this.getToken(); if (t) this.decodeAndSetUser(t); }
        if (!this.userId) return of([]);
        return this.http.get<any>(`${this.apiUrl}/favorites?user=/api/users/${this.userId}`).pipe(
            map(res => res['member'] || res['hydra:member'] || []),
            tap(favs => { this.favoritesSubject.next(favs); this.favoritesLoaded = true; })
        );
    }

    // --- ACCIONES DE FAVORITOS (Unificadas con characterId para evitar errores 500) ---
    addFavorite(character: any) {
        return this.http.post<any>(`${this.apiUrl}/favorites`, {
            characterId: character.id,
            name: character.name,
            portraitPath: character.portrait_path || '/img/placeholder.png',
            user: `/api/users/${this.userId}`
        }).pipe(tap(newFav => this.favoritesSubject.next([...this.favoritesSubject.value, newFav])));
    }

    addEpisodeFavorite(episode: any) {
        return this.http.post<any>(`${this.apiUrl}/favorites`, {
            characterId: episode.id, // Unificado
            name: episode.name,
            portraitPath: episode.thumbnail_url || episode.image_url || '/img/placeholder.png',
            user: `/api/users/${this.userId}`
        }).pipe(tap(newFav => this.favoritesSubject.next([...this.favoritesSubject.value, newFav])));
    }

    addLocationFavorite(location: any) {
        return this.http.post<any>(`${this.apiUrl}/favorites`, {
            characterId: location.id, // Unificado
            name: location.name,
            portraitPath: location.thumbnail_url || location.image_url || '/img/placeholder.png',
            user: `/api/users/${this.userId}`
        }).pipe(tap(newFav => this.favoritesSubject.next([...this.favoritesSubject.value, newFav])));
    }

    removeFavorite(favoriteId: number) {
        return this.http.delete(`${this.apiUrl}/favorites/${favoriteId}`).pipe(
            tap(() => this.favoritesSubject.next(this.favoritesSubject.value.filter(f => f.id !== favoriteId)))
        );
    }

    // --- AUTENTICACIÓN ---
    login(email: string, password: string) {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login_check`, { username: email, password }).pipe(
            tap(res => { if (res.token) { localStorage.setItem('auth_token', res.token); this.decodeAndSetUser(res.token); }})
        );
    }

    signup(u: string, e: string, p: string) { 
        return this.http.post<any>(`${this.apiUrl}/users`, { username: u, email: e, password: p }); 
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) { localStorage.removeItem('auth_token'); }
        this.userSubject.next(null);
        this.isAdminSubject.next(false);
        this.userId = null;
        
        // Limpiar todas las cachés
        this.favoritesSubject.next([]); this.favoritesLoaded = false;
        this.charactersSubject.next([]); this.charactersLoaded = false;
        this.episodesSubject.next([]); this.episodesLoaded = false;
        this.locationsSubject.next([]); this.locationsLoaded = false;
        this.usersSubject.next([]); this.usersLoaded = false;
    }

    getToken() { return isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null; }
    isLoggedIn() { return !!this.getToken(); }
}
