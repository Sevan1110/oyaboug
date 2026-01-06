import { MerchantType, FoodCategory } from "../../types";

export interface MockFoodItem {
  name: string;
  description: string;
  category: FoodCategory;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  quantity_available: number;
  quantity_initial: number;
  pickup_start_hours: number; // Offset from current time or fixed hour
  pickup_end_hours: number;
  expiry_hours: number; // Hours from now
  is_available: boolean;
  badges: string[];
}

export interface MockMerchant {
  business_name: string;
  business_type: MerchantType;
  description: string;
  address: string;
  city: string;
  quartier: string;
  phone: string;
  email: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_active: boolean;
  items: MockFoodItem[];
}

export const MOCK_MERCHANTS: MockMerchant[] = [
  {
    business_name: "Boulangerie de Libreville",
    business_type: "bakery",
    description: "Les meilleurs pains et viennoiseries de la ville.",
    address: "Avenue de l'Indépendance",
    city: "Libreville",
    quartier: "Centre-ville",
    phone: "+241 77 11 22 33",
    email: "contact@boulangerielibreville.ga",
    rating: 4.5,
    total_reviews: 120,
    is_verified: true,
    is_active: true,
    items: [
      {
        name: "Panier Surprise Viennoiseries",
        description: "Assortiment de croissants, pains au chocolat et brioches de la veille.",
        category: "bread_pastry",
        original_price: 5000,
        discounted_price: 2500,
        discount_percentage: 50,
        quantity_available: 5,
        quantity_initial: 10,
        pickup_start_hours: 1, // In 1 hour
        pickup_end_hours: 4,   // Until 4 hours from now
        expiry_hours: 24,
        is_available: true,
        badges: ["Bio", "Frais"],
      },
      {
        name: "Baguettes Tradition",
        description: "Lot de 3 baguettes tradition.",
        category: "bread_pastry",
        original_price: 1500,
        discounted_price: 750,
        discount_percentage: 50,
        quantity_available: 10,
        quantity_initial: 20,
        pickup_start_hours: 2,
        pickup_end_hours: 6,
        expiry_hours: 12,
        is_available: true,
        badges: [],
      }
    ]
  },
  {
    business_name: "Le Gourmet Gabonais",
    business_type: "restaurant",
    description: "Cuisine locale raffinée et plats internationaux.",
    address: "Quartier Louis",
    city: "Libreville",
    quartier: "Louis",
    phone: "+241 66 44 55 66",
    email: "reservation@gourmetgabonais.ga",
    rating: 4.8,
    total_reviews: 85,
    is_verified: true,
    is_active: true,
    items: [
      {
        name: "Plat du jour - Poulet Nyembwe",
        description: "Portion restante du service de midi. Délicieux poulet sauce noix de palme.",
        category: "prepared_meals",
        original_price: 8000,
        discounted_price: 4000,
        discount_percentage: 50,
        quantity_available: 3,
        quantity_initial: 15,
        pickup_start_hours: 3,
        pickup_end_hours: 5,
        expiry_hours: 8,
        is_available: true,
        badges: ["Local", "Chaud"],
      }
    ]
  },
  {
    business_name: "Supermarché Mbolo",
    business_type: "supermarket",
    description: "Tout pour vos courses quotidiennes.",
    address: "Boulevard Triomphal",
    city: "Libreville",
    quartier: "Mbolo",
    phone: "+241 11 76 54 32",
    email: "service@mbolo.ga",
    rating: 4.2,
    total_reviews: 300,
    is_verified: true,
    is_active: true,
    items: [
      {
        name: "Panier Fruits & Légumes",
        description: "Mélange de fruits et légumes de saison à consommer rapidement.",
        category: "fruits_vegetables",
        original_price: 6000,
        discounted_price: 2000,
        discount_percentage: 66,
        quantity_available: 8,
        quantity_initial: 20,
        pickup_start_hours: 0,
        pickup_end_hours: 10,
        expiry_hours: 48,
        is_available: true,
        badges: ["Vitamines"],
      },
      {
        name: "Produits Laitiers - Date Courte",
        description: "Yaourts et fromages proches de la date limite.",
        category: "dairy",
        original_price: 4000,
        discounted_price: 1500,
        discount_percentage: 62,
        quantity_available: 12,
        quantity_initial: 30,
        pickup_start_hours: 0,
        pickup_end_hours: 12,
        expiry_hours: 72,
        is_available: true,
        badges: ["Frais"],
      }
    ]
  },
  {
    business_name: "Chez Tantine Marie",
    business_type: "caterer",
    description: "Service traiteur pour événements et plats à emporter.",
    address: "Akanda",
    city: "Libreville",
    quartier: "Akanda",
    phone: "+241 07 98 76 54",
    email: "marie@traiteur.ga",
    rating: 4.6,
    total_reviews: 45,
    is_verified: true,
    is_active: true,
    items: [
      {
        name: "Buffet Restant",
        description: "Assortiment de salades et viandes froides.",
        category: "mixed_basket",
        original_price: 10000,
        discounted_price: 3000,
        discount_percentage: 70,
        quantity_available: 2,
        quantity_initial: 5,
        pickup_start_hours: 1,
        pickup_end_hours: 3,
        expiry_hours: 6,
        is_available: true,
        badges: ["Grande quantité"],
      }
    ]
  }
];
