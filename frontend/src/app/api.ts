import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private url = 'https://thesimpsonsapi.com/api';
  constructor(private http: HttpClient) { }

  getCharacters(): Observable<any> {
    return this.http.get<any>(`${this.url}/characters`).pipe(
      switchMap((firstPage: any) => {
        const totalPages = firstPage.pages;
        if (totalPages <= 1) {
          return of(firstPage);
        }

        const requests: Observable<any>[] = [];
        for (let i = 2; i <= totalPages; i++) {
          requests.push(this.http.get<any>(`${this.url}/characters?page=${i}`));
        }

        return forkJoin(requests).pipe(
          map((responses: any[]) => {
            const allResults = [...firstPage.results];
            responses.forEach(res => {
              allResults.push(...res.results);
            });

            // Deduplicate by ID
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

            return { ...firstPage, results: uniqueResults };
          })
        );
      })
    );
  }

  getCharactersById(id: number): Observable<any> {
    return this.http.get(`${this.url}/characters/${id}`);
  }

  getEpisodes(): Observable<any> {
    return this.http.get<any>(`${this.url}/episodes`).pipe(
      switchMap((firstPage: any) => {
        const totalPages = firstPage.pages;
        if (totalPages <= 1) {
          return of(firstPage);
        }

        const requests: Observable<any>[] = [];
        for (let i = 2; i <= totalPages; i++) {
          requests.push(this.http.get<any>(`${this.url}/episodes?page=${i}`));
        }

        return forkJoin(requests).pipe(
          map((responses: any[]) => {
            const allResults = [...firstPage.results];
            responses.forEach(res => {
              allResults.push(...res.results);
            });

            // Deduplicate by ID
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

            return { ...firstPage, results: uniqueResults };
          })
        );
      })
    );
  }

  getLocationById(id: number): Observable<any> {
    return this.http.get(`${this.url}/locations/${id}`);
  }

  getLocations(): Observable<any> {
    return this.http.get<any>(`${this.url}/locations`).pipe(
      switchMap((firstPage: any) => {
        const totalPages = firstPage.pages;
        if (totalPages <= 1) {
          return of(firstPage);
        }

        const requests: Observable<any>[] = [];
        for (let i = 2; i <= totalPages; i++) {
          requests.push(this.http.get<any>(`${this.url}/locations?page=${i}`));
        }

        return forkJoin(requests).pipe(
          map((responses: any[]) => {
            const allResults = [...firstPage.results];
            responses.forEach(res => {
              allResults.push(...res.results);
            });

            // Deduplicate by ID
            const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

            return { ...firstPage, results: uniqueResults };
          })
        );
      })
    );
  }
} 
