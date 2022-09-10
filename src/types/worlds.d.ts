export interface Worlds {
  [key: string]: World;
}

export interface World {
  uniqueId: string;
  name: string;
}
