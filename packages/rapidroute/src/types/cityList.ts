// Generated by https://quicktype.io

export interface City {
  "Town Name": number | string
  "Town Rank": TownRank
  Mayor: string
  "Deputy Mayor": string
  X: number
  Y: number
  Z: number
  "/tppos": string
  "MRT Station(s)": string
  "Former Mayors": string
  Notes: string
}

export enum TownRank {
  Community = "Community",
  Councillor = "Councillor",
  Governor = "Governor",
  Mayor = "Mayor",
  Premier = "Premier",
  Senator = "Senator",
  Unranked = "Unranked",
}
