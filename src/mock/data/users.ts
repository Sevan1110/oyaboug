import { UserRole, UserPreferences } from "../../types";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone: string;
  preferences?: Partial<UserPreferences>;
  link_to_merchant?: string; // Business name to link to
}

export const MOCK_USERS: MockUser[] = [
  {
    email: "test.user@oyaboug.ga",
    password: "Password123!",
    role: "user",
    full_name: "Jean Koumba",
    phone: "+241 74 00 00 01",
    preferences: {
      notifications_enabled: true,
      email_notifications: true,
      favorite_categories: ["bread_pastry", "prepared_meals"],
      max_distance_km: 10
    }
  },
  {
    email: "test.merchant@oyaboug.ga",
    password: "Password123!",
    role: "merchant",
    full_name: "Paul le Boulanger",
    phone: "+241 74 00 00 02",
    link_to_merchant: "Boulangerie de Libreville"
  },
  {
    email: "test.admin@oyaboug.ga",
    password: "Password123!",
    role: "admin",
    full_name: "Super Admin",
    phone: "+241 74 00 00 00"
  },
  {
    email: "sarah.ndong@oyaboug.ga",
    password: "Password123!",
    role: "user",
    full_name: "Sarah Ndong",
    phone: "+241 74 00 00 03",
    preferences: {
      notifications_enabled: true,
      email_notifications: false,
      favorite_categories: ["fruits_vegetables"],
      max_distance_km: 5
    }
  }
];
