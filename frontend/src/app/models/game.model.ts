export interface GameSummary {
  id: number;
  name: string;
  genre: string;
  price: number;
  releaseDate: string;
}

export interface GameDetails {
  id: number;
  name: string;
  genreId: number;
  price: number;
  releaseDate: string;
}

export interface CreateGame {
  name: string;
  genreId: number;
  price: number;
  releaseDate: string;
}

export interface UpdateGame {
  name: string;
  genreId: number;
  price: number;
  releaseDate: string;
}

export interface Genre {
  id: number;
  name: string;
}
