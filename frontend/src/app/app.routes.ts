import { Routes } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { GenreListComponent } from './components/genre-list/genre-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'games', pathMatch: 'full' },
  { path: 'games', component: GameListComponent },
  { path: 'games/new', component: GameFormComponent },
  { path: 'games/:id/edit', component: GameFormComponent },
  { path: 'genres', component: GenreListComponent },
  { path: '**', redirectTo: 'games' }
];
