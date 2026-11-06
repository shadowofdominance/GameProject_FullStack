import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GenreService } from '../../services/genre.service';
import { GameSummary, Genre } from '../../models/game.model';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.css'
})
export class GameListComponent implements OnInit {
  private gameService = inject(GameService);
  private genreService = inject(GenreService);
  private cdr = inject(ChangeDetectorRef);

  games: GameSummary[] = [];
  genres: Genre[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  searchQuery = '';
  selectedGenre = 'ALL';
  sortBy = 'name-asc';
  viewMode: 'grid' | 'table' = 'grid';

  // Delete modal state
  isDeleteModalOpen = false;
  gameToDelete: GameSummary | null = null;
  isDeleting = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    forkJoin({
      games: this.gameService.getGames(),
      genres: this.genreService.getGenres()
    }).subscribe({
      next: ({ games, genres }) => {
        this.games = games;
        this.genres = genres;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load catalog data:', err);
        this.errorMessage = 'Could not load games. Please make sure the backend API is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredGames(): GameSummary[] {
    let result = [...this.games];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
    }

    // Filter by genre
    if (this.selectedGenre !== 'ALL') {
      result = result.filter(g => g.genre.toLowerCase() === this.selectedGenre.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date-desc':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'date-asc':
          return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        default:
          return 0;
      }
    });

    return result;
  }

  openDeleteModal(game: GameSummary): void {
    this.gameToDelete = game;
    this.isDeleteModalOpen = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.isDeleteModalOpen = false;
    this.gameToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.gameToDelete) return;

    this.isDeleting = true;
    this.cdr.markForCheck();

    const gameId = this.gameToDelete.id;
    const gameName = this.gameToDelete.name;

    this.gameService.deleteGame(gameId).subscribe({
      next: () => {
        this.games = this.games.filter(g => g.id !== gameId);
        this.isDeleting = false;
        this.closeDeleteModal();
        this.showSuccess(`"${gameName}" was deleted successfully.`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to delete game:', err);
        this.isDeleting = false;
        this.errorMessage = `Failed to delete "${gameName}". Please try again.`;
        this.cdr.markForCheck();
      }
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (this.successMessage === message) {
        this.successMessage = null;
        this.cdr.markForCheck();
      }
    }, 4000);
  }

  dismissAlert(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.cdr.markForCheck();
  }

  getGenreBadgeClass(genre: string): string {
    switch (genre.toLowerCase()) {
      case 'action':
        return 'bg-danger text-white';
      case 'rpg':
        return 'bg-primary text-white';
      case 'multiplayer':
        return 'bg-info text-dark';
      case 'racing':
        return 'bg-warning text-dark';
      case 'simulation':
        return 'bg-success text-white';
      case 'story':
        return 'bg-secondary text-white';
      default:
        return 'bg-dark text-white';
    }
  }
}
