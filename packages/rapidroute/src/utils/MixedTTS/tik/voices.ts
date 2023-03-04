/* eslint-disable max-lines */

const voices = [
  {
    id: "en_us_001",
    lang: "en-US",
    name: "Jennifer",
    langLabel: "US",
  },
  {
    id: "en_us_006",
    lang: "en-US",
    name: "Male 1",
    langLabel: "US",
  },
  {
    id: "en_us_007",
    lang: "en-US",
    name: "Male 2",
    langLabel: "US",
  },
  {
    id: "en_us_009",
    lang: "en-US",
    name: "Male 3",
    langLabel: "US",
  },
  {
    id: "en_us_010",
    lang: "en-US",
    name: "Male 4",
    langLabel: "US",
  },
  {
    id: "en_uk_001",
    lang: "en-UK",
    name: "Male 1",
    langLabel: "UK",
  },
  {
    id: "en_uk_003",
    lang: "en-UK",
    name: "Male 2",
    langLabel: "UK",
  },
  {
    id: "en_au_001",
    lang: "en-AU",
    name: "Female",
    langLabel: "AU",
  },
  {
    id: "en_au_002",
    lang: "en-AU",
    name: "Male",
    langLabel: "AU",
  },
  {
    id: "fr_001",
    lang: "fr",
    name: "Male 1",
    langLabel: "French",
  },
  {
    id: "fr_002",
    lang: "fr",
    name: "Male 2",
    langLabel: "French",
  },
  {
    id: "de_001",
    lang: "de",
    name: "Female",
    langLabel: "German",
  },
  {
    id: "de_002",
    lang: "de",
    name: "Male",
    langLabel: "German",
  },
  {
    id: "es_001",
    lang: "es",
    name: "Male",
    langLabel: "Spanish",
  },
  {
    id: "es_mx_002",
    lang: "es-MX",
    name: "Male",
    langLabel: "Spanish (MX)",
  },
  {
    id: "br_001",
    lang: "pt-BR",
    name: "Female 1",
    langLabel: "Portuguese (BR)",
  },
  {
    id: "br_003",
    lang: "pt-BR",
    name: "Female 2",
    langLabel: "Portuguese (BR)",
  },
  {
    id: "br_004",
    lang: "pt-BR",
    name: "Female 3",
    langLabel: "Portuguese (BR)",
  },
  {
    id: "br_005",
    lang: "pt-BR",
    name: "Male",
    langLabel: "Portuguese (BR)",
  },
  {
    id: "id_001",
    lang: "id",
    name: "Female",
    langLabel: "Indonesian",
  },
  {
    id: "jp_001",
    lang: "ja",
    name: "Female 1",
    langLabel: "Japanese",
  },
  {
    id: "jp_003",
    lang: "ja",
    name: "Female 2",
    langLabel: "Japanese",
  },
  {
    id: "jp_005",
    lang: "ja",
    name: "Female 3",
    langLabel: "Japanese",
  },
  {
    id: "jp_006",
    lang: "ja",
    name: "Male",
    langLabel: "Japanese",
  },
  {
    id: "kr_002",
    lang: "ko",
    name: "Male 1",
    langLabel: "Korean",
  },
  {
    id: "kr_004",
    lang: "ko",
    name: "Male 2",
    langLabel: "Korean",
  },
  {
    id: "kr_003",
    lang: "ko",
    name: "Female",
    langLabel: "Korean",
  },
  {
    id: "en_us_ghostface",
    lang: "en-US",
    name: "Ghostface (Scream)",
    langLabel: "Characters",
  },
  {
    id: "en_us_chewbacca",
    lang: "en-US",
    name: "Chewbacca (Star Wars)",
    langLabel: "Characters",
  },
  {
    id: "en_us_c3po",
    lang: "en-US",
    name: "C3PO (Star Wars)",
    langLabel: "Characters",
  },
  {
    id: "en_us_stitch",
    lang: "en-US",
    name: "Stitch (Lilo & Stitch)",
    langLabel: "Characters",
  },
  {
    id: "en_us_stormtrooper",
    lang: "en-US",
    name: "Stormtrooper (Star Wars)",
    langLabel: "Characters",
  },
  {
    id: "en_us_rocket",
    lang: "en-US",
    name: "Rocket (Guardians of the Galaxy)",
    langLabel: "Characters",
  },
  {
    id: "en_female_madam_leota",
    lang: "en",
    name: "Madame Leota",
    langLabel: "Characters",
  },
  {
    id: "en_female_f08_salut_damour",
    lang: "en",
    name: "Alto",
    langLabel: "Singing",
  },
  {
    id: "en_male_m03_lobby",
    lang: "en",
    name: "Tenor",
    langLabel: "Singing",
  },
  {
    id: "en_male_m03_sunshine_soon",
    lang: "en",
    name: "Sunshine Soon",
    langLabel: "Singing",
  },
  {
    id: "en_female_f08_warmy_breeze",
    lang: "en",
    name: "Warmy Breeze",
    langLabel: "Singing",
  },
  {
    id: "en_female_ht_f08_glorious",
    lang: "en",
    name: "Glorious",
    langLabel: "Singing",
  },
  {
    id: "en_male_sing_Extrany_it_goes_up",
    lang: "en",
    name: "It Goes Up",
    langLabel: "Singing",
  },
  {
    id: "en_male_m2_xhxs_m03_silly",
    lang: "en",
    name: "Chipmunk",
    langLabel: "Singing",
  },
  {
    id: "en_female_ht_f08_wonderful_world",
    lang: "en",
    name: "Dramatic",
    langLabel: "Singing",
  },
  {
    id: "en_female_ht_f08_halloween",
    lang: "en",
    name: "Opera",
    langLabel: "Singing",
  },
  {
    id: "en_male_grinch",
    lang: "en",
    name: "Trickster",
    langLabel: "Extra",
  },
  {
    id: "en_male_wizard",
    lang: "en",
    name: "Wizard",
    langLabel: "Extra",
  },
  {
    id: "en_male_ghosthost",
    lang: "en",
    name: "Ghost Host",
    langLabel: "Extra",
  },
  {
    id: "en_male_pirate",
    lang: "en",
    name: "Pirate",
    langLabel: "Extra",
  },
  {
    id: "en_female_samc",
    lang: "en",
    name: "Empathetic",
    langLabel: "Extra",
  },
  {
    id: "en_male_cody",
    lang: "en",
    name: "Serious",
    langLabel: "Extra",
  },
  {
    id: "en_male_Extrany",
    lang: "en",
    name: "Wacky",
    langLabel: "Extra",
  },
  {
    id: "en_female_emotional",
    lang: "en",
    name: "Peaceful",
    langLabel: "Extra",
  },
  {
    id: "en_male_narration",
    lang: "en",
    name: "Story Teller",
    langLabel: "Extra",
  },
] as const

export default voices
