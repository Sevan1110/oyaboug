// Reusable impact calculation helpers

export const CO2_PER_MEAL_KG = 2; // kg CO2 avoided per saved meal
export const WATER_PER_MEAL_L = 500; // liters saved per meal
export const ENERGY_PER_MEAL_KWH = 4; // kWh saved per meal

export const mealsToCo2Kg = (meals: number): number => meals * CO2_PER_MEAL_KG;
export const mealsToWaterL = (meals: number): number => meals * WATER_PER_MEAL_L;
export const mealsToEnergyKwh = (meals: number): number => meals * ENERGY_PER_MEAL_KWH;

export const co2KgToTrees = (co2Kg: number): number => Math.round(co2Kg / 22);
export const co2KgToCarKm = (co2Kg: number): number => Math.round(co2Kg / 0.12);
export const co2KgToShowers = (co2Kg: number): number => Math.round(co2Kg / 0.5);
export const co2KgToPhoneCharges = (co2Kg: number): number => Math.round(co2Kg / 0.008);
