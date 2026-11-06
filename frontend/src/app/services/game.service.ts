import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateGame, GameDetails, GameSummary, UpdateGame } from '../models/game.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/games`;

  getGames(): Observable<GameSummary[]> {
    return this.http.get<GameSummary[]>(this.apiUrl);
  }

  getGame(id: number): Observable<GameDetails> {
    return this.http.get<GameDetails>(`${this.apiUrl}/${id}`);
  }

  createGame(game: CreateGame): Observable<GameDetails> {
    return this.http.post<GameDetails>(this.apiUrl, game);
  }

  updateGame(id: number, game: UpdateGame): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, game);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
