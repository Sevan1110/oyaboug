// ============================================
// GabonMap Component - Interactive Leaflet Map
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Store, Star } from "lucide-react";
import type { FoodItem, GabonCity } from "@/types";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Gabon city coordinates
const GABON_CITIES_COORDS: Record<GabonCity, [number, number]> = {
  Libreville: [0.4162, 9.4673],
  "Port-Gentil": [-0.7193, 8.7815],
  Franceville: [-1.6333, 13.5833],
  Oyem: [1.6167, 11.5833],
  Moanda: [-1.5333, 13.2],
  Mouila: [-1.8667, 11.05],
  Lambaréné: [-0.7, 10.2167],
  Tchibanga: [-2.85, 11.0333],
  Koulamoutou: [-1.1333, 12.4667],
  Makokou: [0.5667, 12.8667],
};

// Gabon center and bounds
const GABON_CENTER: [number, number] = [-0.8037, 11.6094];
const GABON_BOUNDS: [[number, number], [number, number]] = [
  [-4.0, 8.5],
  [2.5, 14.5],
];

// Custom marker icon
const createCustomIcon = (color: string = "#22C55E") => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 16px; height: 16px; transform: rotate(45deg);">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Merchant marker icon
const merchantIcon = createCustomIcon("hsl(145, 65%, 42%)");
const urgentIcon = createCustomIcon("hsl(0, 72%, 51%)");

interface MapItemPopupProps {
  item: FoodItem;
  onSelect?: (item: FoodItem) => void;
}

const MapItemPopup = ({ item, onSelect }: MapItemPopupProps) => {
  const discount = Math.round(
    ((item.original_price - item.discounted_price) / item.original_price) * 100
  );

  return (
    <div className="min-w-[220px]">
      <div className="flex items-start gap-3">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Store className="w-3 h-3" />
            {item.merchant?.business_name || "Commerce"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-lg font-bold text-primary">
            {item.discounted_price.toLocaleString()} XAF
          </span>
          <span className="text-xs text-muted-foreground line-through ml-2">
            {item.original_price.toLocaleString()}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          -{discount}%
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>
          {item.pickup_start} - {item.pickup_end}
        </span>
      </div>

      {item.quantity_available <= 3 && (
        <Badge variant="destructive" className="mt-2 text-xs">
          Plus que {item.quantity_available}!
        </Badge>
      )}

      {onSelect && (
        <Button
          size="sm"
          className="w-full mt-3"
          onClick={() => onSelect(item)}
        >
          Voir l'offre
        </Button>
      )}
    </div>
  );
};

// Component to recenter map
interface MapRecenterProps {
  city?: GabonCity;
}

const MapRecenter = ({ city }: MapRecenterProps) => {
  const map = useMap();

  useEffect(() => {
    if (city && GABON_CITIES_COORDS[city]) {
      map.flyTo(GABON_CITIES_COORDS[city], 13, {
        duration: 1.5,
      });
    } else {
      map.flyTo(GABON_CENTER, 6, {
        duration: 1.5,
      });
    }
  }, [city, map]);

  return null;
};

interface GabonMapProps {
  items: FoodItem[];
  selectedCity?: GabonCity | "";
  onItemSelect?: (item: FoodItem) => void;
  className?: string;
}

const GabonMap = ({
  items,
  selectedCity,
  onItemSelect,
  className = "",
}: GabonMapProps) => {
  const mapRef = useRef<L.Map>(null);

  // Generate mock coordinates for items without real coordinates
  const itemsWithCoords = useMemo(() => {
    return items.map((item) => {
      const city = (item.merchant?.city as GabonCity) || "Libreville";
      const baseCoords = GABON_CITIES_COORDS[city] || GABON_CITIES_COORDS.Libreville;

      // Add small random offset for visual separation
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lonOffset = (Math.random() - 0.5) * 0.02;

      return {
        ...item,
        coords: [baseCoords[0] + latOffset, baseCoords[1] + lonOffset] as [
          number,
          number
        ],
      };
    });
  }, [items]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <MapContainer
        ref={mapRef}
        center={GABON_CENTER}
        zoom={6}
        scrollWheelZoom={true}
        className="h-[500px] w-full z-0"
        maxBounds={GABON_BOUNDS}
        minZoom={5}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter city={selectedCity as GabonCity} />

        {/* City markers */}
        {Object.entries(GABON_CITIES_COORDS).map(([city, coords]) => {
          const cityItems = items.filter(
            (item) => item.merchant?.city === city
          );

          if (cityItems.length === 0 && !selectedCity) {
            return (
              <Marker
                key={city}
                position={coords}
                icon={L.divIcon({
                  className: "city-label",
                  html: `
                    <div style="
                      background: hsl(145, 65%, 42%);
                      color: white;
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: 600;
                      white-space: nowrap;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">
                      ${city}
                    </div>
                  `,
                  iconSize: [80, 20],
                  iconAnchor: [40, 10],
                })}
              >
                <Popup>
                  <div className="text-center p-2">
                    <h3 className="font-semibold text-foreground">{city}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aucune offre disponible
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          }

          return null;
        })}

        {/* Food item markers */}
        {itemsWithCoords.map((item) => (
          <Marker
            key={item.id}
            position={item.coords}
            icon={item.quantity_available <= 3 ? urgentIcon : merchantIcon}
          >
            <Popup>
              <MapItemPopup item={item} onSelect={onItemSelect} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "hsl(145, 65%, 42%)" }}
            />
            <span className="text-foreground">Offre disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "hsl(0, 72%, 51%)" }}
            />
            <span className="text-foreground">Derniers articles!</span>
          </div>
        </div>
      </div>

      {/* Items count */}
      {items.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg">
          {items.length} offre{items.length > 1 ? "s" : ""}
        </div>
      )}
    </Card>
  );
};

export default GabonMap;
