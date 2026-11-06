import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GenreService } from '../../services/genre.service';
import { Genre } from '../../models/game.model';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './genre-list.component.html',
  styleUrl: './genre-list.component.css'
})
export class GenreListComponent implements OnInit {
  private genreService = inject(GenreService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  genres: Genre[] = [];
  isLoading = true;
  isSaving = false;
  isDeleting = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Delete modal
  isDeleteModalOpen = false;
  genreToDelete: Genre | null = null;

  genreForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(30)]]
  });

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.genreService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load genres:', err);
        this.errorMessage = 'Could not load genres from backend.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.genreForm.invalid) {
      this.genreForm.markAllAsTouched();
      return;
    }

    const genreName = this.genreForm.value.name.trim();

    // Client-side duplicate check
    const duplicate = this.genres.some(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (duplicate) {
      this.errorMessage = `A genre named "${genreName}" already exists.`;
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.genreService.createGenre({ name: genreName }).subscribe({
      next: (createdGenre) => {
        this.genres.push(createdGenre);
        this.isSaving = false;
        this.genreForm.reset();
        this.showSuccess(`Genre "${createdGenre.name || genreName}" created successfully!`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to create genre:', err);
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to create genre. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  openDeleteModal(genre: Genre): void {
    this.genreToDelete = genre;
    this.isDeleteModalOpen = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.isDeleteModalOpen = false;
    this.genreToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.genreToDelete) return;

    this.isDeleting = true;
    this.cdr.markForCheck();

    const genreId = this.genreToDelete.id;
    const genreName = this.genreToDelete.name;

    this.genreService.deleteGenre(genreId).subscribe({
      next: () => {
        this.genres = this.genres.filter(g => g.id !== genreId);
        this.isDeleting = false;
        this.closeDeleteModal();
        this.showSuccess(`Genre "${genreName}" was deleted.`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to delete genre:', err);
        this.isDeleting = false;
        this.errorMessage = err.error?.message || `Failed to delete "${genreName}".`;
        this.closeDeleteModal();
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.genreForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
