export type World =
  | 'musica'
  | 'series'
  | 'peliculas'
  | 'anime'
  | 'libros'
  | 'deportes'
  | 'videojuegos'
  | 'otros';

export type Sport =
  | 'futbol'
  | 'basket'
  | 'tennis'
  | 'f1'
  | 'combate'
  | 'americanos'
  | 'otros';

export type AnimeMangaPref = 'anime' | 'manga' | 'ambos';
export type DiningStyle = 'hablar' | 'escuchar' | 'depende';
export type Dietary = 'ninguna' | 'vegetariano' | 'vegano' | 'alergia';
export type ExpPreference = 'solo_amigos' | 'plus_one' | 'cualquiera';

export interface QuizResponses {
  // Personal
  firstName: string;
  lastName: string;
  age: string;
  whatsapp: string;

  // Worlds
  selectedWorlds: World[];
  otrosMundos?: string;

  // Per-world answers (categories = recall-aid multiselect, then open Qs)
  musica?: { categories: string[]; eras: string[]; topArtists: string };
  series?: { categories: string[]; seriesOtro?: string; region: string[]; netflixPick: string[] };
  peliculas?: { categories: string[]; tipo: string[]; favorites: string };
  anime?: {
    categories: string[];
    preference: AnimeMangaPref;
    favorites: string;
    current: string;
  };
  libros?: { categories: string[]; topBooks: string; recent: string };
  deportes?: { selected: Sport[]; otros?: string };
  videojuegos?: { categories: string[]; favorites: string };

  // Closing preferences
  diningStyle: DiningStyle;
  dietary: Dietary;
  dietaryNote?: string;
  expPreference: ExpPreference;

  // Referral
  referredBy?: string;
}

export interface SubmitResult {
  slug: string;
  url: string;
  igUrl: string;
  whatsappMessage: string;
  tags: string[];
}
