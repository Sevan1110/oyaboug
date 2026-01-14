// ============================================
// Merchant Public Page - Public Merchant Profile
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Star, Store, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FoodCard from "@/components/FoodCard";
import * as merchantService from "@/services/merchant.service";
import * as inventoryService from "@/services/inventory.service";
import type { Merchant, FoodItem } from "@/types";
import { toast } from "sonner";

const MerchantPublicPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [items, setItems] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadMerchantData(slug);
        }
    }, [slug]);

    const loadMerchantData = async (merchantSlug: string) => {
        setIsLoading(true);
        try {
            const result = await merchantService.getMerchantBySlugName(merchantSlug);
            if (result.success && result.data) {
                setMerchant(result.data);

                // Load merchant's food items
                const itemsResult = await inventoryService.getMerchantItems(result.data.id);
                if (itemsResult.success && itemsResult.data) {
                    setItems(itemsResult.data);
                }
            } else {
                toast.error("Commerce non trouvé");
                navigate("/search");
            }
        } catch (error) {
            console.error("Error loading merchant:", error);
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!merchant) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Cover Image */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden pt-16">
                <img
                    src={merchant.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?w=1200&h=400&fit=crop"}
                    alt={merchant.business_name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-6 left-6 right-6 container mx-auto px-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mb-4 gap-2 bg-white/90"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                </div>
            </div>

            <main className="container mx-auto px-4 -mt-12 relative z-10 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Merchant Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border-2 border-white shadow-lg">
                                        <img
                                            src={merchant.logo_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop"}
                                            alt={merchant.business_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-foreground">{merchant.business_name}</h1>
                                        <Badge variant="outline" className="mt-1">
                                            {merchantService.getMerchantTypeName(merchant.business_type)}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{merchant.address}, {merchant.quartier}, {merchant.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{merchant.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{merchant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-semibold text-foreground">
                                            {merchant.rating.toFixed(1)} ({merchant.total_reviews} avis)
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Horaires d'ouverture
                                    </h3>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        {merchant.opening_hours ? (
                                            Object.entries(merchant.opening_hours).map(([day, hours]) => (
                                                <div key={day} className="flex justify-between">
                                                    <span className="capitalize">{day}</span>
                                                    <span>{hours.is_closed ? "Fermé" : `${hours.open} - ${hours.close}`}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Horaires non renseignés</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-2">À propos</h3>
                                <p className="text-sm text-muted-foreground">
                                    {merchant.description || "Aucune description disponible pour ce commerce."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Food Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Store className="w-6 h-6 text-primary" /> Offres disponibles
                            </h2>
                            <span className="text-muted-foreground">{items.length} produit(s)</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/p/${item.slug}`)}
                                >
                                    <FoodCard
                                        item={{
                                            id: item.id,
                                            name: item.name,
                                            description: item.description || "",
                                            originalPrice: item.original_price,
                                            discountedPrice: item.discounted_price,
                                            image: item.image_url || "",
                                            slug: item.slug,
                                            merchant: {
                                                name: merchant.business_name,
                                                type: merchant.business_type,
                                                distance: merchant.quartier,
                                                slug: merchant.slug
                                            },
                                            pickupTime: `${item.pickup_start} - ${item.pickup_end}`,
                                            quantity: item.quantity_available,
                                            badges: (item.badges || []) as any
                                        }}
                                    />
                                </motion.div>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-muted/30 rounded-xl border-2 border-dashed">
                                    <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">Aucune offre disponible pour le moment.</p>
                                    <p className="text-sm text-muted-foreground">Revenez plus tard !</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MerchantPublicPage;
