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
  city: string;
  age: string;
  whatsapp: string;

  // Worlds
  selectedWorlds: World[];
  otrosMundos?: string;

  // Per-world answers (categories = recall-aid multiselect, then open Qs)
  // `picks` = chips chosen from the suggestion list driven by selected
  // categories. Optional — complements (does not replace) the free-text
  // fields below.
  musica?: { categories: string[]; eras: string[]; topArtists: string; picks?: string[]; musicaOtro?: string };
  series?: { categories: string[]; seriesOtro?: string; region: string[]; favorites?: string; picks?: string[] };
  peliculas?: { categories: string[]; tipo: string[]; favorites: string; picks?: string[] };
  anime?: {
    categories: string[];
    preference: AnimeMangaPref;
    favorites: string;
    current: string;
    picks?: string[];
  };
  libros?: { categories: string[]; topBooks: string; recent: string; picks?: string[]; librosOtro?: string };
  deportes?: { selected: Sport[]; otros?: string };
  videojuegos?: { categories: string[]; favorites: string; picks?: string[]; videojuegosOtro?: string };

  // Closing preferences
  diningStyle: DiningStyle;
  dietary: Dietary;
  dietaryNote?: string;
  expPreference: ExpPreference;
  planDays?: string;
  planDaysOther?: string[];

  // Referral
  referredBy?: string;
}

export interface SubmitResult {
  slug: string;
  url: string;
  igUrl: string;
  whatsappMessage: string;
  tags: string[];
  matches?: Array<{ name: string; commonCount: number; mutualFriend?: string }>;
}
