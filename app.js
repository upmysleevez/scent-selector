/**
 * FRAGRANCE SOMMELIER v93
 * Logic: Merged Schedule, Shuffle Button, Fixed Syntax
 */

const APP_ID = "scentApp_v93_stable"; 
const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

let state = {
    context: { season: 'winter', weather: 'sunny', temperature: 50, situation: 'office', suspense: false },
    data: { fragrances: [], decants: [], combos: [], history: [] },
    ui: { collectionMode: 'bottles' }
};

// --- DATA: ACQUISITION ROADMAP (v93) ---
const ACQUISITION_ROADMAP = [
    { phase: "PHASE 1", date: "Jan 2026", target: "Emanuel New York", brand: "The Elemental (Extrait)", role: "The Grail Leather", reason: "Honey/Oud notes prevent leather from cracking in <20°F wind chill.", source: "Emanuel NYC", icon: "snowflake" },
    { phase: "JAN SUB", date: "Jan 2026", target: "African Leather", brand: "Memo Paris", role: "The Winter King", reason: "Highest quality spicy leather. Replaces La Nuit 2011.", source: "Scentbird", icon: "crown" },
    { phase: "JAN SUB", date: "Jan 2026", target: "Oddity", brand: "Rag & Bone", role: "Shop Floor Signature", reason: "Licorice & Pepper match the smell of hot ink/machinery.", source: "Scentbird", icon: "factory" },
    { phase: "PHASE 2", date: "Feb 2026", target: "Pasha de Cartier", brand: "Cartier (Parfum)", role: "Manager Aura", reason: "Creamy Sandalwood/Fir Balsam. Authority in a bottle.", source: "Jomashop", icon: "briefcase" },
    { phase: "FEB SUB", date: "Feb 2026", target: "Great Lord", brand: "Vilhelm Parfumerie", role: "Brooklyn Jazz Upgrade", reason: "Dark Plum/Leather. Diversifies palette from Tea scents.", source: "Scentbird", icon: "wine" },
    { phase: "FEB SUB", date: "Feb 2026", target: "Cherry Punk", brand: "Room 1015", role: "Lost Cherry Killer", reason: "Edgy, punk-rock cherry leather. No layering required.", source: "Scentbird", icon: "zap" },
    { phase: "MAR SUB", date: "Mar 2026", target: "Cedrat Boise", brand: "Mancera", role: "Spring Workhorse", reason: "10-Hour daily driver. Replaces the need for Hacienda.", source: "Scentbird", icon: "sun" },
    { phase: "MAR SUB", date: "Mar 2026", target: "Espíritu Parfum", brand: "House of Bō", role: "The Green Element", reason: "Sage & Oakwood fill the Herbal gap for rising humidity.", source: "Scentbird", icon: "leaf" },
    { phase: "PHASE 4", date: "May 2026", target: "Torino 2021", brand: "Montagne", role: "The Ice Bath", reason: "Mint & Basil provide physical cooling effect in 90%+ humidity.", source: "Montagne", icon: "droplets" },
    { phase: "PHASE 5", date: "June 2026", target: "Galilean", brand: "Montagne", role: "Industrial Professional", reason: "Mineral/Suede/Ink notes match the print shop environment perfectly.", source: "Montagne", icon: "printer" },
    { phase: "PHASE 6", date: "Aug 2026", target: "Torino 2022", brand: "Montagne", role: "Transition Ace", reason: "Eucalyptus freshness meets Saffron sweetness.", source: "Montagne", icon: "wind" },
    { phase: "PHASE 7", date: "Sept 2026", target: "Ambre Musc", brand: "Montagne", role: "The Ghost Layer", reason: "Cetalox projects a warm, clean aura. Perfect for 'False Fall'.", source: "Montagne", icon: "ghost" },
    { phase: "PHASE 8", date: "Oct 2026", target: "Scandinavian Crime", brand: "LM Parfums", role: "The Villain", reason: "Dark Pepper, Incense, Woods. Replaces Sainte Fumée.", source: "Emanuel NYC", icon: "skull" },
    { phase: "PHASE 9", date: "Nov 2026", target: "Bobcat", brand: "Montagne", role: "Winter Upgrade", reason: "Incense and Suede Vanilla. Replaces Vanille Absolute.", source: "Montagne", icon: "flame" }
];

const KEYWORDS = {
    winter: ["oud", "vanilla", "tobacco", "leather", "chocolate", "coffee", "rum", "cinnamon", "spice", "amber", "chestnut", "smoke", "incense"],
    summer: ["lime", "lemon", "bergamot", "citrus", "sea", "salt", "aquatic", "marine", "coconut", "mint", "ginger", "fresh"],
    fall: ["iris", "sandalwood", "fig", "tea", "cardamom", "cedar", "vetiver"],
    date: ["rose", "jasmine", "musk", "patchouli", "saffron", "sweet", "boozy", "gourmand"],
    office: ["soap", "clean", "white musk", "lavender", "neroli", "cotton"]
};

let tempSmartObj = null; 
let currentNoteId = null; 
let editingHistoryIndex = null; 
let toastTimeout = null;

// --- V93 DATASET (Restored) ---

const CUSTOM_DB = [
    { id: "montagne_eau_noir", name: "Eau Noir", brand: "Montagne", inspiration: "The Noir 29", tags: ["tea", "fig", "hay", "suspense", "dark"], weatherAffinity: { winter_sunny: 4, winter_rainy: 5, summer_sunny: 2, summer_rainy: 3, spring: 4, fall: 5 }, situationRatings: { office: 5, gym: 2, casual: 5, date_night: 5, intimate: 4 }, sprayInstructions: "10 Sprays: 4 Chest, 6 Sleeves (Sleeve Trick).", description: "Black tea, fig, and tobacco. Mysterious and shifting.", wearCount: 9, userNotes: "", userRating: "S", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_gentle_silver", name: "Gentle Silver", brand: "Montagne", inspiration: "Gentle Fluidity Silver", tags: ["gin", "juniper", "fresh", "crisp", "snow_king"], weatherAffinity: { winter_sunny: 2, winter_rainy: 3, summer_sunny: 5, summer_rainy: 5, spring: 5, fall: 4 }, situationRatings: { office: 5, gym: 4, casual: 5, date_night: 3, intimate: 2 }, sprayInstructions: "12 Sprays: 6 Skin, 6 Shoulders. (Impossible to overspray).", description: "Crisp juniper. Smells like a cold Gin & Tonic.", wearCount: 5, userNotes: "", userRating: "S", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "creed_aventus", name: "Aventus", brand: "Creed", inspiration: "Original", tags: ["fresh", "smoky", "fruity", "king", "office"], weatherAffinity: { winter_sunny: 3, winter_rainy: 2, summer_sunny: 5, summer_rainy: 4, spring: 5, fall: 5 }, situationRatings: { office: 5, gym: 3, casual: 5, date_night: 4, intimate: 3 }, sprayInstructions: "6-8 Sprays.", description: "Smoky pineapple and birch. The ultimate confidence booster.", wearCount: 2, userNotes: "", userRating: "B", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_cubicle", name: "Cubicle for Men", brand: "Montagne", inspiration: "Fragrance One Office", tags: ["ambroxan", "fresh", "safe", "power"], weatherAffinity: { winter_sunny: 1, winter_rainy: 1, summer_sunny: 5, summer_rainy: 5, spring: 4, fall: 3 }, situationRatings: { office: 5, gym: 5, casual: 4, date_night: 1, intimate: 0 }, sprayInstructions: "3 Sprays MAX: Skin Only. (Biohazard).", description: "Clean, soapy, and projecting. Perfect Office scent.", wearCount: 2, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "blomb_27", name: "No. 27", brand: "BLOMB", inspiration: "Original", tags: ["woody", "tobacco", "coconut", "unique"], weatherAffinity: { winter_sunny: 4, winter_rainy: 3, summer_sunny: 3, summer_rainy: 4, spring: 5, fall: 5 }, situationRatings: { office: 3, gym: 1, casual: 5, date_night: 2, intimate: 2 }, sprayInstructions: "8 Sprays: 3 Back Neck, 5 Back Shirt (Rear Guard).", description: "Unique woody-tobacco with a coconut twist.", wearCount: 1, userNotes: "", userRating: "B", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_brooklyn_jazz", name: "Brooklyn Jazz", brand: "Montagne", inspiration: "Maison Margiela Jazz Club", tags: ["boozy", "tobacco", "rum", "smooth"], weatherAffinity: { winter_sunny: 5, winter_rainy: 4, summer_sunny: -2, summer_rainy: -1, spring: 3, fall: 5 }, situationRatings: { office: 3, gym: 0, casual: 5, date_night: 5, intimate: 4 }, sprayInstructions: "10 Sprays: 4 Chest, 6 Coat/Scarf (Wool Binder).", description: "Boozy rum and tobacco. Captures the vibe of a dim jazz bar.", wearCount: 1, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_maison_du_soir", name: "Maison du Soir", brand: "Montagne", inspiration: "By the Fireplace", tags: ["smoke", "vanilla", "chestnut", "cozy"], weatherAffinity: { winter_sunny: 5, winter_rainy: 5, summer_sunny: -5, summer_rainy: -2, spring: 2, fall: 5 }, situationRatings: { office: 2, gym: 0, casual: 5, date_night: 4, intimate: 5 }, sprayInstructions: "12 Sprays: 2 Neck, 10 Undershirt (The Wick Method).", description: "Chestnut and vanilla smoke. The ultimate 'Cozy' scent.", wearCount: 1, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_vanille_absolute", name: "Vanille Absolute", brand: "Montagne", inspiration: "Nishane Ani?", tags: ["vanilla", "spicy", "ginger", "green"], weatherAffinity: { winter_sunny: 5, winter_rainy: 5, summer_sunny: -5, summer_rainy: -5, spring: 1, fall: 5 }, situationRatings: { office: 2, gym: 0, casual: 3, date_night: 5, intimate: 4 }, sprayInstructions: "4 Sprays: 3 Chest, 1 Back Neck. (Do not spray collar).", description: "Spicy ginger and rich vanilla.", wearCount: 1, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "prada_paradigme", name: "Paradigme", brand: "Prada", inspiration: "Original", tags: ["fresh", "clean", "floral", "office"], weatherAffinity: { winter_sunny: 3, winter_rainy: 2, summer_sunny: 5, summer_rainy: 4, spring: 5, fall: 4 }, situationRatings: { office: 5, gym: 3, casual: 5, date_night: 2, intimate: 2 }, sprayInstructions: "10 Sprays: 4 Torso, 6 Shirt Front (The Soap).", description: "A modern paradigm of Prada's clean, soapy, and floral style.", wearCount: 1, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "fleurit_sainte_fumee", name: "Sainte Fumée", brand: "Fleurit Parfums", inspiration: "Original", tags: ["smoke", "incense", "dark", "intimate", "snow_beast"], weatherAffinity: { winter_sunny: 5, winter_rainy: 5, summer_sunny: -2, summer_rainy: -2, spring: 3, fall: 5 }, situationRatings: { office: 2, gym: 0, casual: 4, date_night: 5, intimate: 5 }, sprayInstructions: "5 Sprays: 2 Chest, 3 Shoulders. (Resin Limit).", description: "Holy Smoke. Deep resins and incense for intimate winter nights.", wearCount: 1, userNotes: "", userRating: "S", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "hermes_terre_intense", name: "Terre d'Hermès Eau Intense", brand: "Hermès", inspiration: "Original", tags: ["vetiver", "citrus", "classy", "office"], weatherAffinity: { winter_sunny: 3, winter_rainy: 4, summer_sunny: 4, summer_rainy: 5, spring: 5, fall: 5 }, situationRatings: { office: 5, gym: 2, casual: 4, date_night: 3, intimate: 2 }, sprayInstructions: "8 Sprays: 4 Chest, 4 Collar.", description: "Sophisticated vetiver with a bright citrus opening. A masterpiece.", wearCount: 1, userNotes: "", userRating: "B", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "dossier_ambery_saffron", name: "Ambery Saffron", brand: "Dossier", inspiration: "BR 540", tags: ["sweet", "saffron", "unisex", "date_night"], weatherAffinity: { winter_sunny: 2, winter_rainy: 1, summer_sunny: -2, summer_rainy: -1, spring: 1, fall: 2 }, situationRatings: { office: 2, gym: 0, casual: 4, date_night: 5, intimate: 4 }, sprayInstructions: "4-5 sprays (Shoulders, Neck, Back of Neck).", description: "A sweet, airy amber-saffron cloud.", wearCount: 0, userNotes: "", userRating: "B", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "lost_cherry", name: "Lost Cherry", brand: "Tom Ford", inspiration: "Original", tags: ["gourmand", "cherry", "almond", "boozy", "suspense"], weatherAffinity: { winter_sunny: 1, winter_rainy: 2, summer_sunny: -3, summer_rainy: -2, spring: 0, fall: 2 }, situationRatings: { office: 1, gym: 0, casual: 3, date_night: 5, intimate: 5 }, sprayInstructions: "6-8 sprays (All over clothes + Hair).", description: "Decadent cherry-almond liqueur.", wearCount: 0, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "victory_man", name: "Victory Man", brand: "XXIV", inspiration: "Unknown/Fresh", tags: ["fresh", "citrus", "cedar", "gym"], weatherAffinity: { winter_sunny: 2, winter_rainy: 2, summer_sunny: 5, summer_rainy: 3, spring: 4, fall: 3 }, situationRatings: { office: 4, gym: 5, casual: 5, date_night: 2, intimate: 2 }, sprayInstructions: "10 Sprays: 4 Chest, 6 Sweater.", description: "Bergamot and Cedarwood bomb. Clean, sharp, and energizing.", wearCount: 0, userNotes: "", userRating: "C", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "paco_1_million", name: "1 Million", brand: "Paco Rabanne", inspiration: "Original", tags: ["sweet", "spicy", "loud", "club"], weatherAffinity: { winter_sunny: 2, winter_rainy: 1, summer_sunny: -3, summer_rainy: -2, spring: 0, fall: 1 }, situationRatings: { office: 0, gym: 0, casual: 2, date_night: 4, intimate: 2 }, sprayInstructions: "4-5 sprays (Chest and Neck).", description: "Sweet, spicy bubblegum. Designed for loud parties.", wearCount: 0, userNotes: "", userRating: "C", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_phantom_noir", name: "Phantom Noir", brand: "Montagne", inspiration: "Black Phantom?", tags: ["coffee", "boozy", "chocolate", "dark", "suspense"], weatherAffinity: { winter_sunny: 5, winter_rainy: 5, summer_sunny: -5, summer_rainy: -3, spring: 1, fall: 5 }, situationRatings: { office: 1, gym: 0, casual: 3, date_night: 5, intimate: 5 }, sprayInstructions: "7 Sprays: 5 Stomach, 2 Wrists (Low Center).", description: "Coffee, booze, and sugar. Dark and mysterious.", wearCount: 0, userNotes: "", userRating: "A", pairingOnly: false, paused: false, reviewStatus: 'approved' },
    { id: "montagne_la_nuit_2011", name: "La Nuit 2011", brand: "Montagne", inspiration: "La Nuit de L'Homme", tags: ["cardamom", "romantic", "soft"], weatherAffinity: { winter_sunny: 4, winter_rainy: 3, summer_sunny: 1, summer_rainy: 2, spring: 4, fall: 5 }, situationRatings: { office: 4, gym: 2, casual: 4, date_night: 5, intimate: 5 }, sprayInstructions: "12 Sprays: 6 Torso, 6 Scarf (Cardamom Shield).", description: "The original 2011 Cardamom Bomb. Pure romance.", wearCount: 0, userNotes: "", userRating: "B", pairingOnly: false, paused: false, reviewStatus: 'approved' }
];

const INITIAL_DECANTS = [
    { id: "custom_1765648274151", name: "Labdanum 18", brand: "Le Labo", tags: ["powdery", "animalic", "musk"], description: "Intimate and powdery skin scent.", rating: 'like' },
    { id: "custom_1765726222017", name: "Fil d’Or No1", brand: "Laurent Mazzone", tags: ["boozy", "tobacco", "luxurious"], description: "Rich, boozy, golden tobacco.", rating: 'like' },
    { id: "black_orchid_decant", name: "Black Orchid", brand: "Tom Ford", tags: ["dark", "floral", "chocolate", "suspense"], description: "Dark, dramatic, and floral chocolate.", rating: 'like' }
];

const COMBOS_DB = [
    { id: "c_executive", name: "The Executive Suite", parts: ["creed_aventus", "dossier_ambery_saffron"], protocol: "4x Aventus (Base) + 2x Saffron (Top)", tags: ["power", "office", "date_night"], situationRatings: { office: 3, gym: 0, casual: 5, date_night: 5, intimate: 4 }, description: "Smoky birch meets airy saffron sweetness.", instructions: "4x Aventus (Base) + 2x Saffron (Top)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, winter_rainy: 1, spring: 1, fall: 2, summer_sunny: -1 } },
    { id: "c_cleancut", name: "The Clean Cut", parts: ["montagne_cubicle", "montagne_gentle_silver"], protocol: "3x Cubicle (Skin) + 3x Silver (Clothes)", tags: ["fresh", "sterile", "office"], situationRatings: { office: 5, gym: 5, casual: 3, date_night: 1, intimate: 1 }, description: "Ambroxan power meets Juniper freshness.", instructions: "3x Cubicle (Skin) + 3x Silver (Clothes)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { summer_sunny: 2, spring: 2, fall: 1, winter_sunny: 0 } },
    { id: "c_shift", name: "Paradigm Shift", parts: ["prada_paradigme", "montagne_cubicle"], protocol: "4x Cubicle (Base) + 4x Paradigme (Shirt)", tags: ["clean", "long_lasting", "office"], situationRatings: { office: 5, gym: 1, casual: 3, date_night: 2, intimate: 1 }, description: "Soapy floral meets ambroxan power.", instructions: "4x Cubicle (Base) + 4x Paradigme (Shirt)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { spring: 2, summer_sunny: 2, fall: 1, winter_sunny: 0 } },
    { id: "c_ceo", name: "The CEO", parts: ["hermes_terre_intense", "montagne_cubicle"], protocol: "3x Cubicle (Base) + 3x Hermes (Top)", tags: ["authority", "vetiver", "office"], situationRatings: { office: 5, casual: 3, date_night: 2, gym: 2, intimate: 1 }, description: "Pure authority. Vetiver and Ambroxan.", instructions: "3x Cubicle (Base) + 3x Hermes (Top)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { spring: 2, fall: 2 } },
    { id: "c_gin_earth", name: "Gin & Earth", parts: ["hermes_terre_intense", "montagne_gentle_silver"], protocol: "4x Silver (Clothes) + 2x Hermes (Skin)", tags: ["metallic", "earthy", "casual"], situationRatings: { casual: 5, office: 3, date_night: 3, gym: 2, intimate: 2 }, description: "Earthy vetiver lifted by sparkling juniper.", instructions: "4x Silver (Clothes) + 2x Hermes (Skin)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { spring: 2, summer_sunny: 2 } },
    { id: "c_fluid_gold", name: "The Fluid Gold", parts: ["montagne_vanille_absolute", "montagne_gentle_silver"], protocol: "1x Vanille (Chest) + 6x Silver (Chest)", tags: ["mfk_hack", "luxury", "date_night"], situationRatings: { office: 2, gym: 0, casual: 5, date_night: 5, intimate: 4 }, description: "The sharp Juniper cuts the heavy Vanilla. MFK Gold vibe.", instructions: "1x Vanille (Chest) + 6x Silver (Chest)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, winter_rainy: 2, fall: 2 } },
    { id: "c_cherry_lounge", name: "Cherry Lounge", parts: ["lost_cherry", "montagne_brooklyn_jazz"], protocol: "3x Jazz (Coat) + 3x Cherry (Scarf)", tags: ["boozy", "tobacco", "intimate"], situationRatings: { office: 0, gym: 0, casual: 3, date_night: 5, intimate: 5 }, description: "Boozy rum and tobacco darkens the cherry almond.", instructions: "3x Jazz (Coat) + 3x Cherry (Scarf)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, winter_rainy: 2, fall: 1 } },
    { id: "c_smoked_vanilla", name: "Smoked Vanilla", parts: ["montagne_maison_du_soir", "montagne_vanille_absolute"], protocol: "3x Maison (Undershirt) + 2x Vanille (Skin)", tags: ["cozy", "fire", "intimate"], situationRatings: { office: 1, gym: 0, casual: 5, date_night: 4, intimate: 5 }, description: "Chestnut smoke mixed with spicy ginger vanilla.", instructions: "3x Maison (Undershirt) + 2x Vanille (Skin)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, winter_rainy: 2, fall: 2, summer_sunny: -4 } },
    { id: "c_midnight_cacao", name: "Midnight Cacao", parts: ["montagne_phantom_noir", "fleurit_sainte_fumee"], protocol: "3x Phantom (Base) + 2x Fumée (Top)", tags: ["gothic", "gourmand", "date_night"], situationRatings: { date_night: 5, intimate: 5, casual: 3, office: 0, gym: 0 }, description: "Dark chocolate and holy smoke.", instructions: "3x Phantom (Base) + 2x Fumée (Top)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, winter_rainy: 2 } },
    { id: "c_holy_saffron", name: "Holy Saffron", parts: ["fleurit_sainte_fumee", "dossier_ambery_saffron"], protocol: "3x Fumée (Shoulders) + 3x Saffron (Neck)", tags: ["incense", "sweet", "date_night"], situationRatings: { office: 0, gym: 0, casual: 3, date_night: 5, intimate: 5 }, description: "Burnt sugar and airy saffron mixed with deep church incense.", instructions: "3x Fumée (Shoulders) + 3x Saffron (Neck)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, fall: 2, spring: 1 } },
    { id: "c_dark_arch", name: "The Dark Architect", parts: ["black_orchid_decant", "hermes_terre_intense"], protocol: "3x Hermes (Chest) + 2x Orchid (Neck)", tags: ["contrast", "mystery", "date_night"], situationRatings: { date_night: 5, intimate: 4, casual: 3, office: 1, gym: 0 }, description: "Architecture in a bottle. Dark florals and earth.", instructions: "3x Hermes (Chest) + 2x Orchid (Neck)", wearCount: 1, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 2, fall: 2 } },
    { id: "c_gin_juice", name: "Gin & Juice", parts: ["montagne_gentle_silver", "creed_aventus"], protocol: "4x Silver (Clothes) + 2x Aventus (Skin)", tags: ["fresh", "gym", "casual"], situationRatings: { office: 4, gym: 4, casual: 5, date_night: 3, intimate: 2 }, description: "Juniper berry and pineapple. An explosion of freshness.", instructions: "4x Silver (Clothes) + 2x Aventus (Skin)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { summer_sunny: 2, spring: 2, fall: 0, winter_sunny: -1 } },
    { id: "c_holy_clean", name: "Holy Clean", parts: ["fleurit_sainte_fumee", "montagne_gentle_silver"], protocol: "4x Silver (Base) + 2x Fumée (Top)", tags: ["cold_incense", "unique", "casual"], situationRatings: { office: 3, gym: 0, casual: 5, date_night: 3, intimate: 2 }, description: "Clean gin meets dark incense. An interesting, artistic contrast.", instructions: "4x Silver (Base) + 2x Fumée (Top)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { fall: 2, spring: 2, winter_sunny: 1, summer_sunny: 0 } },
    { id: "c_island_noir", name: "Island Noir", parts: ["creed_aventus", "blomb_27"], protocol: "3x Blomb (Back) + 3x Aventus (Front)", tags: ["wood", "pineapple", "casual"], situationRatings: { office: 2, gym: 0, casual: 5, date_night: 4, intimate: 3 }, description: "Pineapple meets Coconut and Tobacco. A dark, smoky Piña Colada.", instructions: "3x Blomb (Back) + 3x Aventus (Front)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { summer_sunny: 2, spring: 1, fall: 0 } },
    { id: "c_midnight_tea", name: "Midnight Tea", parts: ["montagne_eau_noir", "montagne_brooklyn_jazz"], protocol: "3x Jazz (Coat) + 2x Eau Noir (Skin)", tags: ["tea", "tobacco", "casual"], situationRatings: { office: 1, gym: 0, casual: 4, date_night: 5, intimate: 4 }, description: "Black tea and Fig mixed with Rum and Tobacco.", instructions: "3x Jazz (Coat) + 2x Eau Noir (Skin)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { fall: 2, winter_sunny: 2, spring: 0, summer_sunny: -2 } },
    { id: "c_winter_hearth", name: "Winter Hearth", parts: ["fleurit_sainte_fumee", "montagne_maison_du_soir"], protocol: "3x Maison (Undershirt) + 2x Fumée (Skin)", tags: ["smoke_bomb", "winter"], situationRatings: { office: 0, gym: 0, casual: 4, date_night: 3, intimate: 5 }, description: "Chestnut fire and church incense. Maximum winter coziness.", instructions: "3x Maison (Undershirt) + 2x Fumée (Skin)", wearCount: 0, userNotes: "", userRating: 0, weatherAffinity: { winter_sunny: 3, winter_rainy: 2, summer_sunny: -5 } }
];

const INITIAL_HISTORY = [
    { date: "2025-11-29T13:35:00", id: "montagne_cubicle", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-11-30T13:45:00", id: "montagne_gentle_silver", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-01T12:39:00", id: "c_cleancut", type: "combo", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-03T20:21:00", id: "montagne_eau_noir", type: "single", context: { season: "Winter", weather: "Sunny", situation: "Casual" }, feedbackRecorded: true },
    { date: "2025-12-04T12:48:00", id: "montagne_eau_noir", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-05T12:44:00", id: "montagne_eau_noir", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-06T13:29:00", id: "c_gin_juice", type: "combo", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-07T13:30:00", id: "blomb_27", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-08T12:41:00", id: "montagne_gentle_silver", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-10T16:55:00", id: "montagne_gentle_silver", type: "single", context: { season: "Winter", weather: "Sunny", situation: "Casual" }, feedbackRecorded: true },
    { date: "2025-12-11T12:40:00", id: "prada_paradigme", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-12T12:43:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-13T13:15:00", id: "custom_1765648274151", type: "decant", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-14T13:20:00", id: "custom_1765726222017", type: "decant", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-15T14:22:00", id: "creed_aventus", type: "single", context: { season: "Winter", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-16T12:40:00", id: "c_dark_arch", type: "combo", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-19T12:31:00", id: "montagne_maison_du_soir", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-20T13:32:00", id: "montagne_brooklyn_jazz", type: "single", context: { season: "Winter", weather: "Rainy", situation: "Office" }, feedbackRecorded: true },
    { date: "2025-12-21T13:28:00", id: "montagne_vanille_absolute", type: "single", context: { season: "Winter", weather: "Sunny", situation: "Office" }, feedbackRecorded: false },
    { date: "2025-12-22T12:41:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: false },
    { date: "2025-12-23T12:41:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: false },
    { date: "2025-12-24T15:48:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Casual" }, feedbackRecorded: false },
    { date: "2025-12-25T15:48:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Casual" }, feedbackRecorded: false },
    { date: "2025-12-26T13:52:00", id: "montagne_eau_noir", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: false },
    { date: "2025-12-27T13:52:00", id: "fleurit_sainte_fumee", type: "single", context: { season: "Fall", weather: "Sunny", situation: "Office" }, feedbackRecorded: false }
];

window.addEventListener('DOMContentLoaded', () => {
     loadData(); 
     initUI(); 
     setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 100);
     document.querySelectorAll('[id$="-modal"]').forEach(el => el.classList.add('hidden'));
});

setInterval(() => { if (window.lucide) lucide.createIcons(); }, 1000);

// --- CORE FUNCTIONS ---

function loadData() {
    const raw = localStorage.getItem(APP_ID);
    if (raw) {
        try {
            let savedData = JSON.parse(raw);
            if(!savedData.decants) savedData.decants = [];
            if(!savedData.history) savedData.history = [];
            state.data.fragrances = CUSTOM_DB.map(sysF => {
                const savedF = (savedData.fragrances || []).find(f => f.id === sysF.id);
                if (savedF) {
                    return { ...sysF, wearCount: savedF.wearCount || 0, userNotes: savedF.userNotes || "", userRating: savedF.userRating || 0, pairingOnly: savedF.pairingOnly || false, paused: savedF.paused || false, reviewStatus: savedF.reviewStatus || 'approved' };
                }
                return sysF;
            });
            (savedData.fragrances || []).forEach(f => { if (!CUSTOM_DB.find(cdb => cdb.id === f.id)) state.data.fragrances.push(f); });
            state.data.combos = COMBOS_DB.map(sysC => {
                const savedC = (savedData.combos || []).find(c => c.id === sysC.id);
                if (savedC) { return { ...sysC, wearCount: savedC.wearCount || 0, userNotes: savedC.userNotes || "", userRating: savedC.userRating || 0 }; }
                return sysC;
            });
            const savedDecantIds = new Set(savedData.decants.map(d => d.id));
            const initialDecantsToAdd = INITIAL_DECANTS.filter(d => !savedDecantIds.has(d.id));
            state.data.decants = [...savedData.decants, ...initialDecantsToAdd];
            state.data.history = savedData.history.filter(h => h && h.id && h.date);
        } catch(e) { console.error("Data Corrupted", e); setDefaultData(); }
    } else { setDefaultData(); }
}

function setDefaultData() {
    state.data = { fragrances: JSON.parse(JSON.stringify(CUSTOM_DB)), decants: JSON.parse(JSON.stringify(INITIAL_DECANTS)), combos: JSON.parse(JSON.stringify(COMBOS_DB)), history: JSON.parse(JSON.stringify(INITIAL_HISTORY)) };
    saveData();
}

function saveData() { localStorage.setItem(APP_ID, JSON.stringify(state.data)); }

function initUI() { switchView('selector'); updateContextUI(); }

function switchView(viewName) {
    ['view-selector', 'view-results', 'view-collection', 'view-history', 'view-schedule'].forEach(id => { document.getElementById(id).classList.add('hidden'); });
    const target = document.getElementById(viewName === 'selector' ? 'view-selector' : 'view-' + viewName);
    if(target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('text-teal-500'));
    const navMap = { 'selector': 0, 'results': 0, 'collection': 1, 'schedule': 2, 'history': 3 };
    const idx = navMap[viewName];
    const navBtns = document.querySelectorAll('nav button');
    if(navBtns[idx]) navBtns[idx].classList.add('text-teal-500');
    if (viewName === 'collection') showCollection(); 
    if (viewName === 'history') renderHistory();
    if (viewName === 'schedule') renderSchedule();
    document.getElementById('main-content').scrollTop = 0;
    if (window.lucide) lucide.createIcons();
}

function setContext(type, value) { 
    state.context[type] = value; 
    updateContextUI(); 
    const sus = document.getElementById('suspense-section');
    if (state.context.situation === 'date_night' || state.context.situation === 'intimate') sus.classList.remove('hidden');
    else { sus.classList.add('hidden'); state.context.suspense = false; document.getElementById('suspense-toggle').checked = false; }
}

function updateTemp(val) {
    state.context.temperature = parseInt(val);
    document.getElementById('temp-display').innerText = val + "°F";
    const disp = document.getElementById('temp-display');
    if(val < 32) disp.className = "text-blue-300 font-bold text-lg";
    else if(val < 60) disp.className = "text-teal-300 font-bold text-lg";
    else if(val > 80) disp.className = "text-red-400 font-bold text-lg";
    else disp.className = "text-yellow-300 font-bold text-lg";
}

function updateContextUI() {
     document.querySelectorAll('.ctx-btn').forEach(btn => {
        const group = btn.dataset.group; const val = btn.dataset.val;
        if (state.context[group] === val) { 
            btn.classList.add('btn-active'); btn.classList.remove('glass-panel'); 
            const icon = btn.querySelector('svg'); if(icon) { icon.classList.remove('text-teal-300', 'text-yellow-400', 'text-blue-400', 'text-white'); icon.classList.add('text-white'); }
        } else { 
            btn.classList.remove('btn-active'); btn.classList.add('glass-panel'); 
            const icon = btn.querySelector('svg'); 
            if(icon) { icon.classList.remove('text-white'); 
                if(group === 'situation') icon.classList.add('text-teal-300'); 
                if(val === 'sunny') icon.classList.add('text-yellow-400'); 
                if(val === 'rainy') icon.classList.add('text-blue-400'); 
                if(val === 'snow') icon.classList.add('text-white'); 
            }
        }
    });
}

function toggleSuspense() { state.context.suspense = document.getElementById('suspense-toggle').checked; }

// --- REFRESH / SHUFFLE LOGIC ---
function refreshResults() {
    const btn = document.querySelector('button[onclick="refreshResults()"] i');
    if(btn) btn.classList.add('animate-spin');
    setTimeout(() => { generateRecommendations(); if(btn) btn.classList.remove('animate-spin'); }, 300);
}

// --- SCHEDULE LOGIC ---
function renderSchedule() {
    const list = document.getElementById('schedule-list'); list.innerHTML = '';
    ACQUISITION_ROADMAP.forEach(item => {
        const div = document.createElement('div');
        div.className = "glass-panel p-5 rounded-xl border-l-4 border-l-teal-500/50 relative overflow-hidden";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-bold tracking-widest text-teal-300 uppercase">${item.phase}</span>
                        <span class="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono">${item.date}</span>
                    </div>
                    <h3 class="text-lg font-bold text-white leading-tight">${item.target}</h3>
                    <p class="text-xs text-gray-400 uppercase tracking-wide">${item.brand}</p>
                </div>
                <div class="bg-teal-900/30 p-2 rounded-full border border-teal-500/20"><i data-lucide="${item.icon}" class="w-5 h-5 text-teal-400"></i></div>
            </div>
            <div class="bg-black/20 p-3 rounded-lg border border-white/5 relative z-10">
                <div class="flex items-start gap-2 mb-2">
                    <span class="text-[10px] font-bold text-teal-200 uppercase bg-teal-900/40 px-1.5 rounded">ROLE</span>
                    <span class="text-xs text-gray-200">${item.role}</span>
                </div>
                <p class="text-xs text-gray-400 italic leading-relaxed">"${item.reason}"</p>
            </div>
            <div class="mt-3 flex justify-between items-center relative z-10">
                <span class="text-[10px] text-gray-500 font-mono">Source: ${item.source}</span>
            </div>
        `;
        list.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
}

function calculateScore(item, isCombo) {
    const ctx = state.context; 
    let score = 0;
    const sitScore = item.situationRatings ? (item.situationRatings[ctx.situation] || 0) : 0; 
    if (sitScore < 2) return -100;
    score += sitScore * 4; 
    if (item.weatherAffinity) {
        let weatherKey = `${ctx.season}_${ctx.weather}`;
        if (ctx.weather === 'snow') {
            const rainyScore = item.weatherAffinity[`${ctx.season}_rainy`] || item.weatherAffinity['winter_rainy'] || 0;
            score += rainyScore * 2.5; 
            if(item.tags && (item.tags.includes('cozy') || item.tags.includes('incense') || item.tags.includes('smoke'))) score += 5;
            if(item.tags && item.tags.includes('fresh')) score -= 5;
        } else {
            if (item.weatherAffinity[weatherKey] !== undefined) { score += item.weatherAffinity[weatherKey] * 2; } 
            else if (item.weatherAffinity[ctx.season] !== undefined) { score += item.weatherAffinity[ctx.season] * 2; }
        }
    }
    if (ctx.temperature < 40) {
        if (item.tags.includes('vanilla') || item.tags.includes('tobacco') || item.tags.includes('incense')) score += 5;
        if (item.tags.includes('citrus') || item.tags.includes('aquatic')) score -= 5;
    } else if (ctx.temperature > 75) {
        if (item.tags.includes('citrus') || item.tags.includes('fresh') || item.tags.includes('gin')) score += 5;
        if (item.tags.includes('tobacco') || item.tags.includes('gourmand')) score -= 8;
    }
    if (!isCombo) {
        if(item.pairingOnly || item.paused) return -999;
        if (item.userRating === 'S') score += 20;
        else if (item.userRating === 'A') score += 12;
        else if (item.userRating === 'B') score += 5;
        if (item.wearCount === 0) score += 5; 
        else score -= (item.wearCount * 2);
    } else { score += 8; }
    if (ctx.suspense && item.tags && item.tags.includes('suspense')) score += 10;
    score += Math.random() * 4;
    return score;
}

function generateRecommendations() {
    const container = document.getElementById('results-container'); container.innerHTML = '';
    const scoredSingles = state.data.fragrances.map(f => ({ ...f, score: calculateScore(f, false), type: 'single' }));
    const scoredCombos = state.data.combos.map(c => ({ ...c, score: calculateScore(c, true), type: 'combo' }));
    const scoredDecants = state.data.decants.map(d => {
        let score = 0;
        if (d.rating === null) score = 15; else if (d.rating === 'like') score = 10; else score = -50;
        return { ...d, score, type: 'decant' };
    });
    const results = [...scoredSingles, ...scoredCombos, ...scoredDecants].filter(f => f.score > -50).sort((a, b) => b.score - a.score);

    if (results.length === 0) container.innerHTML = `<div class="p-6 text-center text-gray-400">No suitable fragrances found.</div>`;
    else {
        results.slice(0, 3).forEach((item, idx) => {
            if(idx===0) container.appendChild(createTierHeader("🏆 The Signature"));
            if(idx===1) container.appendChild(createTierHeader("🥈 Alternative"));
            if(idx===2) container.appendChild(createTierHeader("🃏 Wildcard"));
            if(item.type === 'single') container.appendChild(createFragranceCard(item, idx===0));
            else if(item.type === 'combo') container.appendChild(createComboCard(item, idx===0));
            else if(item.type === 'decant') {
                const div = document.createElement('div');
                div.className = "glass-panel p-4 rounded-xl border border-dashed border-teal-500/50 mb-2";
                div.innerHTML = `<div class="flex justify-between items-start"><div><h3 class="font-bold text-white">${item.name}</h3><span class="text-[10px] bg-teal-500 px-2 rounded text-white">DECANT</span></div></div><button onclick="logDecantWear('${item.id}')" class="mt-2 w-full bg-white/10 py-2 rounded text-xs font-bold text-white hover:bg-white/20">Log Wear</button>`;
                container.appendChild(div);
            }
        });
        const rotation = results.slice(3, 8);
        if(rotation.length > 0) {
             const rotHeader = document.createElement('div'); rotHeader.className = 'tier-header mt-8'; rotHeader.innerText = "Rotation Options"; container.appendChild(rotHeader);
             rotation.forEach(item => {
                const div = document.createElement('div');
                div.className = "bg-gray-800/50 p-4 rounded-xl flex justify-between items-center border border-gray-800 mb-2";
                div.innerHTML = `<div><div class="font-medium text-white">${item.name}</div><div class="text-xs text-gray-500">${item.brand || "Combo"}</div></div><button onclick="logAnyWear('${item.id}', '${item.type}')" class="p-2 bg-gray-700 rounded-full hover:bg-teal-600 transition-colors"><i data-lucide="plus" class="w-4 h-4 text-white"></i></button>`;
                container.appendChild(div);
             });
        }
    }
    switchView('results');
}

function logAnyWear(id, type) { if (type === 'single') logWear(id); else if (type === 'combo') logComboWear(id); else if (type === 'decant') logDecantWear(id); }
function createTierHeader(text) { const div = document.createElement('div'); div.className = 'tier-header'; div.innerText = text; return div; }

function createFragranceCard(f, isTop) {
     const div = document.createElement('div');
     const bgClass = isTop ? 'bg-gradient-to-br from-charcoal-700 to-teal-900/20 border-teal-500/50' : 'glass-panel border-white/5';
     const wearColor = f.wearCount > 4 ? 'text-red-400' : (f.wearCount === 0 ? 'text-green-400' : 'text-gray-400');
     div.className = `${bgClass} p-5 rounded-2xl border relative transition-all mb-3`;
     div.innerHTML = `<div class="flex justify-between items-start mb-2"><div><span class="text-[10px] font-bold tracking-widest text-teal-400 uppercase">${f.brand}</span><h3 class="text-xl font-bold text-white leading-tight">${f.name}</h3><p class="text-xs text-teal-300 italic mt-0.5">${f.inspiration || ''}</p></div><button onclick="openNote('${f.id}')" class="text-gray-400 hover:text-white"><i data-lucide="sticky-note" class="w-4 h-4"></i></button></div><div class="bg-black/20 p-3 rounded-lg my-3 border border-white/5"><p class="text-sm text-gray-200 leading-relaxed">"${f.description}"</p></div><div class="flex items-center gap-2 mb-4"><i data-lucide="spray-can" class="w-4 h-4 text-gray-400"></i><span class="text-xs text-gray-400 font-mono">${f.sprayInstructions}</span></div><div class="flex justify-between items-center pt-3 border-t border-white/5"><span class="text-xs font-mono ${wearColor}">Wears: ${f.wearCount}</span><button onclick="logWear('${f.id}')" class="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">Log Wear <i data-lucide="plus" class="w-4 h-4"></i></button></div>`;
     return div;
}

function createComboCard(c, isTop) {
    const div = document.createElement('div');
    const bgClass = isTop ? 'bg-gradient-to-br from-purple-900/30 to-teal-900/30 border-teal-500/50' : 'combo-gradient border-teal-500/20';
    const partNames = c.parts.map(pid => { const f = state.data.fragrances.find(x => x.id === pid); return f ? f.name : pid; }).join(' + ');
    div.className = `${bgClass} p-5 rounded-2xl border relative transition-all mb-3`;
    div.innerHTML = `<div class="flex justify-between items-start mb-2"><div><span class="text-[10px] font-bold tracking-widest text-teal-300 uppercase">LAYER COMBO</span><h3 class="text-xl font-bold text-white leading-tight">${c.name}</h3><p class="text-xs text-gray-300 mt-1">${partNames}</p></div><div class="flex flex-col items-end gap-1"><button onclick="openNote('${c.id}')" class="text-gray-400 hover:text-white"><i data-lucide="sticky-note" class="w-4 h-4 ${c.userNotes ? 'text-yellow-400 fill-current' : ''}"></i></button></div></div><div class="bg-black/20 p-3 rounded-lg my-3 border border-white/5"><p class="text-sm text-gray-200 leading-relaxed">"${c.description}"</p><div class="mt-2 pt-2 border-t border-white/10 flex items-start gap-2"><i data-lucide="layers" class="w-4 h-4 text-teal-300 mt-1"></i><p class="text-xs text-teal-100 font-mono">${c.instructions}</p></div></div><div class="flex justify-between items-center pt-3 border-t border-white/5"><span class="text-xs font-mono text-gray-400">Combo Wears: ${c.wearCount}</span><button onclick="logComboWear('${c.id}')" class="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">Log Pair <i data-lucide="plus" class="w-4 h-4"></i></button></div>`;
    return div;
}

function logWear(id) {
     const idx = state.data.fragrances.findIndex(f => f.id === id);
     if (idx > -1) { 
         state.data.fragrances[idx].wearCount++; 
         state.data.history.push({ id, type:'single', date: new Date().toISOString(), context: { ...state.context }, feedbackRecorded: true });
         saveData(); showToast('Wear Logged'); setTimeout(() => switchView('selector'), 500); 
    }
}

function logComboWear(id) {
     const comboIdx = state.data.combos.findIndex(c => c.id === id);
     if (comboIdx > -1) {
         const combo = state.data.combos[comboIdx]; combo.wearCount++;
         combo.parts.forEach(pid => { const fIdx = state.data.fragrances.findIndex(f => f.id === pid); if(fIdx > -1) state.data.fragrances[fIdx].wearCount++; });
         state.data.history.push({ id, type:'combo', date: new Date().toISOString(), context: { ...state.context }, feedbackRecorded: false });
         saveData(); showToast('Pair Logged'); setTimeout(() => switchView('history'), 500); 
    }
}

function logDecantWear(id) {
    let decant = state.data.decants.find(d => d.id === id);
    if (!decant && typeof id === 'number') decant = state.data.decants[id];
    if (!decant) return;
    state.data.history.push({ id: decant.id, type: 'decant', date: new Date().toISOString(), context: { ...state.context }, feedbackRecorded: false });
    saveData(); showToast("Logged Decant"); switchView('history');
}

function handleFeedback(logIndex, action) {
     const log = state.data.history[logIndex]; log.feedbackRecorded = true;
     if (action === 'dislike') {
         if (log.type === 'decant') { if(confirm("Remove this decant from collection?")) { state.data.decants = state.data.decants.filter(d => d.id !== log.id); showToast("Decant Removed"); } } 
         else if (log.type === 'combo') { showToast("Combo Disliked"); }
     } else if (action === 'like') {
         if (log.type === 'decant') { const d = state.data.decants.find(x => x.id === log.id); if(d) d.rating = 'like'; showToast("Marked as Favorite"); } 
         else { showToast("Saved to Favorites"); }
     } else { showToast("Will ask again"); }
     saveData(); renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list'); list.innerHTML = '';
    const sortedHistory = [...state.data.history].sort((a,b) => new Date(b.date) - new Date(a.date));
    if(sortedHistory.length === 0) { list.innerHTML = `<div class="text-center text-gray-500 mt-10">No wear history yet.</div>`; return; }
    sortedHistory.forEach((log, index) => {
        const realIndex = state.data.history.indexOf(log);
        let name = "Unknown"; let brand = ""; 
        if (log.type === 'single') { const f = state.data.fragrances.find(x => x.id === log.id); if(f) { name = f.name; brand = f.brand; } } 
        else if (log.type === 'combo') { const c = state.data.combos.find(x => x.id === log.id); if(c) { name = c.name; brand = "Combo"; } }
        else if (log.type === 'decant') { const d = state.data.decants.find(x => x.id === log.id); if(d) { name = d.name; brand = "Decant"; } else { name = "Deleted Decant"; } }
        const dateObj = new Date(log.date); const dateStr = dateObj.toLocaleDateString(); const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let buttonsHtml = '';
        if (!log.feedbackRecorded && (log.type === 'combo' || log.type === 'decant')) {
            buttonsHtml = `<div class="mt-3 flex gap-2 pt-2 border-t border-white/5"><button onclick="handleFeedback(${realIndex}, 'like')" class="flex-1 py-1.5 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/40 font-bold flex items-center justify-center gap-1"><i data-lucide="thumbs-up" class="w-3 h-3"></i> Like</button><button onclick="handleFeedback(${realIndex}, 'try_more')" class="flex-1 py-1.5 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/40 font-bold flex items-center justify-center gap-1"><i data-lucide="refresh-cw" class="w-3 h-3"></i> Retry</button><button onclick="handleFeedback(${realIndex}, 'dislike')" class="flex-1 py-1.5 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/40 font-bold flex items-center justify-center gap-1"><i data-lucide="thumbs-down" class="w-3 h-3"></i> Dislike</button></div>`;
        }
        const div = document.createElement('div'); div.className = "glass-panel p-4 rounded-xl border border-white/5 mb-3";
        div.innerHTML = `<div class="flex justify-between items-center"><div><div class="flex items-center gap-2 mb-1"><span class="text-[10px] text-gray-400 font-mono">${dateStr} • ${timeStr}</span><span class="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 uppercase">${log.context ? log.context.situation : 'Log'}</span></div><h4 class="font-bold text-white text-sm">${name}</h4><p class="text-[10px] text-teal-400 uppercase tracking-wider">${brand}</p></div><button onclick="openHistoryEdit(${realIndex})" class="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors relative z-10"><i data-lucide="edit-2" class="w-4 h-4"></i></button></div>${buttonsHtml}`;
        list.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
}

function setCollectionMode(mode) {
     state.ui.collectionMode = mode;
     document.getElementById('tab-bottles').className = mode === 'bottles' ? 'flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white/10 text-white' : 'flex-1 py-2 text-xs font-bold rounded-lg text-gray-500 transition-all hover:text-white';
     document.getElementById('tab-decants').className = mode === 'decants' ? 'flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white/10 text-white' : 'flex-1 py-2 text-xs font-bold rounded-lg text-gray-500 transition-all hover:text-white';
     document.getElementById('tab-combos').className = mode === 'combos' ? 'flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white/10 text-white' : 'flex-1 py-2 text-xs font-bold rounded-lg text-gray-500 transition-all hover:text-white';
     showCollection();
}

function showCollection() {
     const list = document.getElementById('collection-list'); list.innerHTML = '';
     if(state.ui.collectionMode === 'bottles') {
        state.data.fragrances.forEach(f => {
            const div = document.createElement('div'); div.className = `glass-panel p-4 rounded-xl border border-white/5 ${f.paused ? 'opacity-50' : ''}`;
            let tiersHtml = '';
            TIERS.forEach(tier => { const isActive = f.userRating === tier; const activeClass = isActive ? 'tier-active' : `tier-${tier.toLowerCase()} border border-white/10 hover:bg-white/5`; tiersHtml += `<button onclick="setRating('${f.id}', '${tier}')" class="w-6 h-6 text-[10px] rounded ${activeClass} tier-btn flex items-center justify-center">${tier}</button>`; });
            const pairingClass = f.pairingOnly ? 'text-teal-400' : 'text-gray-600 hover:text-teal-300'; const pauseClass = f.paused ? 'text-yellow-400' : 'text-gray-600 hover:text-white'; const pauseIcon = f.paused ? 'play-circle' : 'pause-circle';
            div.innerHTML = `<div class="flex justify-between items-start mb-3"><div><span class="text-[10px] text-teal-400 font-bold uppercase tracking-wider">${f.brand}</span><h3 class="font-bold text-sm text-white">${f.name}</h3></div><div class="flex items-center gap-3"><button onclick="togglePairingOnly('${f.id}')" class="${pairingClass} transition-colors" title="Toggle Pairing Only"><i data-lucide="layers" class="w-4 h-4"></i></button><button onclick="openNote('${f.id}')" class="text-gray-400"><i data-lucide="sticky-note" class="w-4 h-4 ${f.userNotes ? 'text-yellow-400 fill-current' : ''}"></i></button><button onclick="togglePause('${f.id}')" class="${pauseClass} transition-colors"><i data-lucide="${pauseIcon}" class="w-4 h-4"></i></button><button onclick="deleteFragrance('${f.id}')" class="text-gray-600 hover:text-red-500" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div><div class="flex justify-between items-center mb-2"><div class="flex gap-1">${tiersHtml}</div></div><div class="flex justify-between items-center pt-2 border-t border-white/5"><p class="text-[10px] text-gray-400 font-mono">Wears: ${f.wearCount}</p><button onclick="resetWear('${f.id}')" class="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1"><i data-lucide="rotate-ccw" class="w-3 h-3"></i> Reset</button></div>`;
            list.appendChild(div);
        });
     } else if (state.ui.collectionMode === 'decants') {
        if(state.data.decants.length === 0) list.innerHTML = `<div class="text-center text-gray-500 p-4">No decants yet. Use Smart Add to add one.</div>`;
        state.data.decants.forEach((d, idx) => {
            const div = document.createElement('div'); div.className = `glass-panel p-4 rounded-xl border border-white/5`;
            div.innerHTML = `<div class="flex justify-between items-start mb-2"><div><span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">${d.brand}</span><h3 class="font-bold text-sm text-white">${d.name}</h3></div><button onclick="deleteDecant(${idx})" class="text-gray-600 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div><div class="mt-2"><button onclick="logDecantWear('${d.id}')" class="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">Log Wear <i data-lucide="plus" class="w-3 h-3"></i></button></div>`;
            list.appendChild(div);
        });
    } else if (state.ui.collectionMode === 'combos') {
        if(state.data.combos.length === 0) list.innerHTML = `<div class="text-center text-gray-500 p-4">No combos found.</div>`;
        state.data.combos.forEach((c) => {
            const div = document.createElement('div'); div.className = `combo-gradient p-4 rounded-xl border border-teal-500/20`;
            const partNames = c.parts.map(pid => { const f = state.data.fragrances.find(x => x.id === pid); return f ? f.name : pid; }).join(' + ');
            let tiersHtml = ''; TIERS.forEach(tier => { const isActive = c.userRating === tier; const activeClass = isActive ? 'tier-active' : `tier-${tier.toLowerCase()} border border-white/10 hover:bg-white/5`; tiersHtml += `<button onclick="setRating('${c.id}', '${tier}')" class="w-6 h-6 text-[10px] rounded ${activeClass} tier-btn flex items-center justify-center">${tier}</button>`; });
            div.innerHTML = `<div class="flex justify-between items-start mb-2"><div><span class="text-[10px] text-teal-300 font-bold uppercase tracking-wider">COMBO RECIPE</span><h3 class="font-bold text-sm text-white">${c.name}</h3><p class="text-[10px] text-gray-300 mt-0.5">${partNames}</p></div><div class="flex items-center gap-2"><button onclick="openNote('${c.id}')" class="text-gray-400"><i data-lucide="sticky-note" class="w-4 h-4 ${c.userNotes ? 'text-yellow-400 fill-current' : ''}"></i></button></div></div><div class="flex justify-between items-center mb-2"><div class="flex gap-1">${tiersHtml}</div></div><div class="bg-black/30 p-2 rounded-lg mb-2"><p class="text-[10px] text-teal-100 font-mono">${c.instructions}</p></div><div class="flex justify-between items-center pt-1 border-t border-white/5"><p class="text-[10px] text-gray-400 font-mono">Wears: ${c.wearCount}</p><button onclick="logComboWear('${c.id}')" class="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded font-bold">Log</button></div>`;
            list.appendChild(div);
        });
    }
    if (window.lucide) lucide.createIcons();
}

function setRating(id, tier) {
    let f = state.data.fragrances.find(i => i.id === id); if(f) { f.userRating = tier; saveData(); showCollection(); return; }
    let c = state.data.combos.find(i => i.id === id); if(c) { c.userRating = tier; saveData(); showCollection(); }
}

function togglePairingOnly(id) { const f = state.data.fragrances.find(i => i.id === id); if(f) { f.pairingOnly = !f.pairingOnly; saveData(); showCollection(); showToast(f.pairingOnly ? "Set to Pairing Only" : "Set to Solo + Pairing"); } }
function togglePause(id) { const f = state.data.fragrances.find(i => i.id === id); if (f) { f.paused = !f.paused; saveData(); showCollection(); showToast(f.paused ? "Fragrance Paused" : "Fragrance Resumed"); } }
function deleteFragrance(id) { if(confirm("Permanently delete this fragrance from your collection?")) { state.data.fragrances = state.data.fragrances.filter(f => f.id !== id); saveData(); showCollection(); showToast("Fragrance Deleted"); } }
function resetWear(id) { const idx = state.data.fragrances.findIndex(f => f.id === id); if (idx > -1) { state.data.fragrances[idx].wearCount = 0; saveData(); showCollection(); } }
function deleteDecant(idx) { if(confirm('Remove this decant?')) { state.data.decants.splice(idx, 1); saveData(); showCollection(); } }

function copyStats() {
    let report = "--- FRAGRANCE SOMMELIER STATS ---\n\n";
    report += "== BOTTLES ==\n";
    state.data.fragrances.sort((a,b) => b.wearCount - a.wearCount).forEach(f => { report += `${f.name} [${f.userRating || '-'}]: ${f.wearCount}\n`; });
    report += "\n== COMBOS ==\n";
    state.data.combos.sort((a,b) => b.wearCount - a.wearCount).forEach(c => { if(c.wearCount > 0) report += `${c.name} [${c.userRating || '-'}]: ${c.wearCount}\n`; });
    report += `\n== TOTAL LOGS: ${state.data.history.length} ==`;
    const area = document.getElementById('backup-area'); area.value = report; area.select(); document.execCommand('copy'); showToast('Stats Copied');
}

function openSmartAdd() { document.getElementById('smart-add-modal').classList.remove('hidden'); }
function closeSmartAdd() { document.getElementById('smart-add-modal').classList.add('hidden'); }

function analyzeText() { 
    const text = document.getElementById('sa-text').value.toLowerCase(); const name = document.getElementById('sa-name').value; const brand = document.getElementById('sa-brand').value; if(!text) return alert("Paste text first");
    let tags = []; let affinity = { winter_sunny: 0, winter_rainy: 0, summer_sunny: 0, summer_rainy: 0, spring: 0, fall: 0 }; let ratings = { office: 2, gym: 1, casual: 3, date_night: 2, intimate: 2 };
    if (KEYWORDS.winter.some(k => text.includes(k))) { tags.push('winter', 'cozy'); affinity.winter_sunny += 2; affinity.winter_rainy += 2; affinity.summer_sunny -= 3; ratings.date_night += 2; ratings.intimate += 2; ratings.gym = 0; }
    if (KEYWORDS.summer.some(k => text.includes(k))) { tags.push('fresh', 'citrus'); affinity.summer_sunny += 2; affinity.summer_rainy += 1; affinity.winter_sunny -= 1; ratings.gym += 3; ratings.office += 2; ratings.date_night -= 1; }
    if (KEYWORDS.fall.some(k => text.includes(k))) { tags.push('woody', 'spicy'); affinity.fall += 2; affinity.spring += 1; ratings.casual += 2; ratings.office += 1; }
    if (KEYWORDS.office.some(k => text.includes(k))) { tags.push('clean', 'safe'); ratings.office += 3; ratings.gym += 1; }
    if(text.includes('dark') || text.includes('mysterious') || text.includes('incense')) { tags.push('suspense'); ratings.date_night += 1; }
    let comboSuggestion = "None detected"; if(tags.includes('fresh')) comboSuggestion = "Try layering with Aventus/Gentle Silver for depth."; if(tags.includes('winter')) comboSuggestion = "Try layering with Vanille Absolute for sweetness.";
    const resultsDiv = document.getElementById('sa-results'); resultsDiv.classList.remove('hidden'); 
    document.getElementById('sa-tags').innerHTML = tags.map(t => `<span class="bg-teal-900 text-teal-300 text-[10px] px-2 py-1 rounded-full">${t}</span>`).join(''); 
    document.getElementById('sa-combo').innerText = comboSuggestion;
    tempSmartObj = { id: 'custom_' + Date.now(), name: name, brand: brand, inspiration: "Imported", tags: tags, weatherAffinity: affinity, situationRatings: ratings, sprayInstructions: "4-5 sprays (Clothes/Neck)", description: "Smart-Added: " + text.substring(0, 50) + "...", wearCount: 0, userNotes: comboSuggestion, userRating: 0, pairingOnly: false, paused: false, reviewStatus: 'approved' };
}

function saveSmartAdd() { 
    if(!tempSmartObj) return alert("Please click 'Analyze' first."); 
    tempSmartObj.name = document.getElementById('sa-name').value || "New Fragrance"; tempSmartObj.brand = document.getElementById('sa-brand').value || "Unknown House"; 
    const isDecant = document.getElementById('sa-is-decant').checked;
    if(isDecant) { state.data.decants.push({ id: tempSmartObj.id, name: tempSmartObj.name, brand: tempSmartObj.brand, tags: tempSmartObj.tags, description: tempSmartObj.description, rating: null }); showToast('Decant Added'); } 
    else { state.data.fragrances.push(tempSmartObj); showToast('Bottle Added'); }
    saveData(); closeSmartAdd(); showCollection(); 
}

function openNote(id) { currentNoteId = id; let item = state.data.fragrances.find(f => f.id === id); if (!item) item = state.data.combos.find(c => c.id === id); document.getElementById('note-input').value = item.userNotes || ""; document.getElementById('notes-modal').classList.remove('hidden'); }
function closeNotesModal() { document.getElementById('notes-modal').classList.add('hidden'); }
function saveNote() {
    if(!currentNoteId) return; const val = document.getElementById('note-input').value;
    let f = state.data.fragrances.find(i => i.id === currentNoteId); if(f) { f.userNotes = val; saveData(); showCollection(); const resContainer = document.getElementById('results-container'); if(!resContainer.classList.contains('hidden')) generateRecommendations(); closeNotesModal(); return; }
    let c = state.data.combos.find(i => i.id === currentNoteId); if(c) { c.userNotes = val; saveData(); showCollection(); closeNotesModal(); }
}

function openAddLogModal() {
    const select = document.getElementById('add-log-fragrance'); select.innerHTML = '';
    const fragGroup = document.createElement('optgroup'); fragGroup.label = "Fragrances"; state.data.fragrances.forEach(f => { const opt = document.createElement('option'); opt.value = f.id; opt.text = f.name; fragGroup.appendChild(opt); }); select.appendChild(fragGroup);
    const comboGroup = document.createElement('optgroup'); comboGroup.label = "Combos"; state.data.combos.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.text = c.name + " (Combo)"; comboGroup.appendChild(opt); }); select.appendChild(comboGroup);
    if (state.data.decants.length > 0) { const decantGroup = document.createElement('optgroup'); decantGroup.label = "Decants"; state.data.decants.forEach(d => { const opt = document.createElement('option'); opt.value = d.id; opt.text = d.name + " (Decant)"; decantGroup.appendChild(opt); }); select.appendChild(decantGroup); }
    const now = new Date(); const isoString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16); document.getElementById('add-log-date').value = isoString;
    document.getElementById('add-log-modal').classList.remove('hidden');
}
function closeAddLogModal() { document.getElementById('add-log-modal').classList.add('hidden'); }
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('hidden'); }
function copyData() { const area = document.getElementById('backup-area'); area.value = JSON.stringify(state.data); area.select(); document.execCommand('copy'); alert('JSON Backup Copied!'); }
function resetView() { switchView('selector'); }

function showToast(msg) {
    const toast = document.getElementById('toast'); if (toastTimeout) { clearTimeout(toastTimeout); toastTimeout = null; }
    toast.querySelector('span').innerText = msg; toast.classList.remove('translate-y-[-150%]', 'opacity-0', 'invisible');
    toastTimeout = setTimeout(() => { toast.classList.add('translate-y-[-150%]', 'opacity-0', 'invisible'); }, 2000);
}

function openHistoryEdit(index) {
     editingHistoryIndex = index; const log = state.data.history[index]; const modal = document.getElementById('history-edit-modal'); const dateInput = document.getElementById('hist-edit-date'); const select = document.getElementById('hist-edit-fragrance');
     const d = new Date(log.date); const isoString = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16); dateInput.value = isoString;
     select.innerHTML = '';
     const optGroupFrag = document.createElement('optgroup'); optGroupFrag.label = "Fragrances"; state.data.fragrances.forEach(f => { const opt = document.createElement('option'); opt.value = f.id; opt.text = f.name; if(f.id === log.id) opt.selected = true; optGroupFrag.appendChild(opt); }); select.appendChild(optGroupFrag);
     const optGroupCombo = document.createElement('optgroup'); optGroupCombo.label = "Combos"; state.data.combos.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.text = c.name + " (Combo)"; if(c.id === log.id) opt.selected = true; optGroupCombo.appendChild(opt); }); select.appendChild(optGroupCombo);
     if (state.data.decants.length > 0) { const decantGroup = document.createElement('optgroup'); decantGroup.label = "Decants"; state.data.decants.forEach(d => { const opt = document.createElement('option'); opt.value = d.id; opt.text = d.name + " (Decant)"; if(d.id === log.id) opt.selected = true; decantGroup.appendChild(opt); }); select.appendChild(decantGroup); }
     modal.classList.remove('hidden');
}
function closeHistoryEdit() { document.getElementById('history-edit-modal').classList.add('hidden'); editingHistoryIndex = null; }
function saveHistoryEdit() {
    if (editingHistoryIndex === null) return;
    const log = state.data.history[editingHistoryIndex]; const newDate = document.getElementById('hist-edit-date').value; const newId = document.getElementById('hist-edit-fragrance').value; const oldId = log.id;
    log.date = new Date(newDate).toISOString();
    if (newId !== oldId) { 
        changeWearCount(oldId, -1); changeWearCount(newId, 1); log.id = newId; 
        const isCombo = state.data.combos.some(c => c.id === newId); const isDecant = state.data.decants.some(d => d.id === newId);
        if (isCombo) log.type = 'combo'; else if (isDecant) log.type = 'decant'; else log.type = 'single';
    }
    saveData(); closeHistoryEdit(); renderHistory(); showCollection(); showToast('Log Updated');
}
function deleteHistoryEntry() { if (editingHistoryIndex === null) return; if(!confirm("Delete this log entry?")) return; const log = state.data.history[editingHistoryIndex]; changeWearCount(log.id, -1); state.data.history.splice(editingHistoryIndex, 1); saveData(); closeHistoryEdit(); renderHistory(); showCollection(); showToast('Entry Deleted'); }
function changeWearCount(id, delta) {
    const fIdx = state.data.fragrances.findIndex(f => f.id === id); if (fIdx > -1) { state.data.fragrances[fIdx].wearCount += delta; if(state.data.fragrances[fIdx].wearCount < 0) state.data.fragrances[fIdx].wearCount = 0; return; }
    const cIdx = state.data.combos.findIndex(c => c.id === id); if (cIdx > -1) { const combo = state.data.combos[cIdx]; combo.wearCount += delta; if(combo.wearCount < 0) combo.wearCount = 0; combo.parts.forEach(pid => { const partIdx = state.data.fragrances.findIndex(f => f.id === pid); if(partIdx > -1) { state.data.fragrances[partIdx].wearCount += delta; if(state.data.fragrances[partIdx].wearCount < 0) state.data.fragrances[partIdx].wearCount = 0; } }); }
}

function saveMissedLog() {
     const dateVal = document.getElementById('add-log-date').value; const idVal = document.getElementById('add-log-fragrance').value; const situationVal = document.getElementById('add-log-situation').value;
     if(!dateVal || !idVal) return alert("Date and Fragrance required");
     const isCombo = state.data.combos.some(c => c.id === idVal); const isDecant = state.data.decants.some(d => d.id === idVal);
     let type = 'single'; if (isCombo) type = 'combo'; else if (isDecant) type = 'decant';
     changeWearCount(idVal, 1);
     state.data.history.push({ id: idVal, type: type, date: new Date(dateVal).toISOString(), context: { situation: situationVal, season: state.context.season, weather: state.context.weather, suspense: false }, feedbackRecorded: false });
     saveData(); closeAddLogModal(); renderHistory(); showCollection(); showToast('Log Added');
}
