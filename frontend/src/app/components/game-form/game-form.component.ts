import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GenreService } from '../../services/genre.service';
import { Genre } from '../../models/game.model';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.css'
})
export class GameFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private genreService = inject(GenreService);
  private cdr = inject(ChangeDetectorRef);

  gameForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    genreId: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
    price: ['', [Validators.required, Validators.min(1), Validators.max(200)]],
    releaseDate: ['', [Validators.required]]
  });

  genres: Genre[] = [];
  isEditMode = false;
  gameId: number | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadGenres();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.gameId = Number(idParam);
      this.isEditMode = true;
      this.loadGame(this.gameId);
    }
  }

  loadGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load genres:', err);
        this.errorMessage = 'Failed to load genres from backend.';
        this.cdr.markForCheck();
      }
    });
  }

  loadGame(id: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.gameService.getGame(id).subscribe({
      next: (game) => {
        this.gameForm.patchValue({
          name: game.name,
          genreId: game.genreId,
          price: game.price,
          releaseDate: game.releaseDate
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to fetch game details:', err);
        this.errorMessage = `Could not load game with ID ${id}.`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.gameForm.invalid) {
      this.gameForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const formValue = this.gameForm.value;
    const payload = {
      name: formValue.name.trim(),
      genreId: Number(formValue.genreId),
      price: Number(formValue.price),
      releaseDate: formValue.releaseDate
    };

    if (this.isEditMode && this.gameId !== null) {
      this.gameService.updateGame(this.gameId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.cdr.markForCheck();
          this.router.navigate(['/games']);
        },
        error: (err) => {
          console.error('Failed to update game:', err);
          this.isSaving = false;
          this.errorMessage = this.extractErrorMessage(err) || 'Failed to update game. Please check your inputs.';
          this.cdr.markForCheck();
        }
      });
    } else {
      this.gameService.createGame(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.cdr.markForCheck();
          this.router.navigate(['/games']);
        },
        error: (err) => {
          console.error('Failed to create game:', err);
          this.isSaving = false;
          this.errorMessage = this.extractErrorMessage(err) || 'Failed to create game. Please check your inputs.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.gameForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private extractErrorMessage(err: any): string | null {
    if (err.error?.errors) {
      // ASP.NET ValidationProblemDetails
      const errorMap = err.error.errors;
      const messages: string[] = [];
      for (const key of Object.keys(errorMap)) {
        messages.push(...errorMap[key]);
      }
      return messages.join(' ');
    }
    if (err.error?.title) {
      return err.error.title;
    }
    return null;
  }
}
