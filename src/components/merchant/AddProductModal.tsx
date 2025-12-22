// ============================================
// Add Product Modal - Create new products or baskets
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  ShoppingBasket,
  Package,
  Clock,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { FoodCategory, CreateFoodItemInput } from "@/types";
import { formatPrice, getCategoryName } from "@/services";

interface BasketItem {
  id: string;
  name: string;
  category: FoodCategory;
  originalPrice: number;
  quantity: number;
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void;
}

const categories: { value: FoodCategory; label: string }[] = [
  { value: "bread_pastry", label: "Pains & Viennoiseries" },
  { value: "prepared_meals", label: "Plats préparés" },
  { value: "fruits_vegetables", label: "Fruits & Légumes" },
  { value: "dairy", label: "Produits laitiers" },
  { value: "meat_fish", label: "Viandes & Poissons" },
  { value: "beverages", label: "Boissons" },
  { value: "snacks", label: "Snacks & Gourmandises" },
  { value: "mixed_basket", label: "Panier surprise" },
  { value: "other", label: "Autres" },
];

const AddProductModal = ({
  open,
  onOpenChange,
  onProductCreated,
}: AddProductModalProps) => {
  const [mode, setMode] = useState<"single" | "basket">("single");
  
  // Single product form
  const [productForm, setProductForm] = useState<CreateFoodItemInput>({
    name: "",
    description: "",
    category: "other",
    original_price: 0,
    discounted_price: 0,
    quantity_available: 1,
    pickup_start: "12:00",
    pickup_end: "14:00",
    expiry_date: "",
    image_url: "",
  });

  // Basket mode
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [basketName, setBasketName] = useState("");
  const [basketDescription, setBasketDescription] = useState("");
  const [basketQuantity, setBasketQuantity] = useState(1);
  const [basketDiscount, setBasketDiscount] = useState(30);
  const [basketPickupStart, setBasketPickupStart] = useState("12:00");
  const [basketPickupEnd, setBasketPickupEnd] = useState("14:00");

  // Temp item for basket
  const [tempItem, setTempItem] = useState<Partial<BasketItem>>({
    name: "",
    category: "other",
    originalPrice: 0,
    quantity: 1,
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      category: "other",
      original_price: 0,
      discounted_price: 0,
      quantity_available: 1,
      pickup_start: "12:00",
      pickup_end: "14:00",
      expiry_date: "",
      image_url: "",
    });
    setBasketItems([]);
    setBasketName("");
    setBasketDescription("");
    setBasketQuantity(1);
    setBasketDiscount(30);
    setTempItem({ name: "", category: "other", originalPrice: 0, quantity: 1 });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const addItemToBasket = () => {
    if (!tempItem.name || !tempItem.originalPrice) {
      toast.error("Veuillez remplir le nom et le prix");
      return;
    }

    const newItem: BasketItem = {
      id: Date.now().toString(),
      name: tempItem.name!,
      category: tempItem.category as FoodCategory,
      originalPrice: tempItem.originalPrice!,
      quantity: tempItem.quantity || 1,
    };

    setBasketItems([...basketItems, newItem]);
    setTempItem({ name: "", category: "other", originalPrice: 0, quantity: 1 });
    toast.success("Produit ajouté au panier");
  };

  const removeItemFromBasket = (id: string) => {
    setBasketItems(basketItems.filter((item) => item.id !== id));
  };

  const basketTotalOriginal = basketItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const basketTotalDiscounted = Math.round(
    basketTotalOriginal * (1 - basketDiscount / 100)
  );

  const handleSubmitSingle = () => {
    if (!productForm.name || !productForm.original_price) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    // Mock API call
    console.log("Creating single product:", productForm);
    toast.success(`Produit "${productForm.name}" créé avec succès`);
    onProductCreated?.();
    handleClose();
  };

  const handleSubmitBasket = () => {
    if (!basketName || basketItems.length === 0) {
      toast.error("Veuillez ajouter un nom et au moins un produit au panier");
      return;
    }

    const basketData = {
      name: basketName,
      description: basketDescription,
      category: "mixed_basket" as FoodCategory,
      original_price: basketTotalOriginal,
      discounted_price: basketTotalDiscounted,
      quantity_available: basketQuantity,
      pickup_start: basketPickupStart,
      pickup_end: basketPickupEnd,
      items: basketItems,
    };

    // Mock API call
    console.log("Creating basket:", basketData);
    toast.success(`Panier "${basketName}" créé avec succès`);
    onProductCreated?.();
    handleClose();
  };

  const discountPercentage =
    productForm.original_price > 0
      ? Math.round(
          ((productForm.original_price - productForm.discounted_price) /
            productForm.original_price) *
            100
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Ajouter un produit
          </DialogTitle>
          <DialogDescription>
            Créez un produit individuel ou un panier composé de plusieurs articles
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "basket")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="single" className="gap-2">
              <Package className="w-4 h-4" />
              Produit unique
            </TabsTrigger>
            <TabsTrigger value="basket" className="gap-2">
              <ShoppingBasket className="w-4 h-4" />
              Créer un panier
            </TabsTrigger>
          </TabsList>

          {/* Single Product Tab */}
          <TabsContent value="single" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Croissant au beurre"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) =>
                    setProductForm({ ...productForm, category: v as FoodCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit..."
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original_price">Prix original (XAF) *</Label>
                <Input
                  id="original_price"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={productForm.original_price || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      original_price: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discounted_price">Prix réduit (XAF) *</Label>
                <Input
                  id="discounted_price"
                  type="number"
                  min="0"
                  placeholder="2500"
                  value={productForm.discounted_price || ""}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      discounted_price: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Réduction</Label>
                <div className="h-10 flex items-center">
                  <Badge
                    variant={discountPercentage >= 30 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    -{discountPercentage}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité disponible *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={productForm.quantity_available}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      quantity_available: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_start">Début récupération *</Label>
                <Input
                  id="pickup_start"
                  type="time"
                  value={productForm.pickup_start}
                  onChange={(e) =>
                    setProductForm({ ...productForm, pickup_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_end">Fin récupération *</Label>
                <Input
                  id="pickup_end"
                  type="time"
                  value={productForm.pickup_end}
                  onChange={(e) =>
                    setProductForm({ ...productForm, pickup_end: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image_url: e.target.value })
                  }
                />
                <Button variant="outline" size="icon">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleSubmitSingle}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le produit
              </Button>
            </div>
          </TabsContent>

          {/* Basket Tab */}
          <TabsContent value="basket" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basket_name">Nom du panier *</Label>
                <Input
                  id="basket_name"
                  placeholder="Ex: Panier surprise du jour"
                  value={basketName}
                  onChange={(e) => setBasketName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basket_quantity">Nombre de paniers *</Label>
                <Input
                  id="basket_quantity"
                  type="number"
                  min="1"
                  value={basketQuantity}
                  onChange={(e) => setBasketQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basket_description">Description du panier</Label>
              <Textarea
                id="basket_description"
                placeholder="Décrivez le contenu de votre panier..."
                value={basketDescription}
                onChange={(e) => setBasketDescription(e.target.value)}
              />
            </div>

            {/* Add items to basket */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-medium">Ajouter un article au panier</Label>
                <div className="grid sm:grid-cols-4 gap-3">
                  <Input
                    placeholder="Nom de l'article"
                    value={tempItem.name}
                    onChange={(e) =>
                      setTempItem({ ...tempItem, name: e.target.value })
                    }
                  />
                  <Select
                    value={tempItem.category}
                    onValueChange={(v) =>
                      setTempItem({ ...tempItem, category: v as FoodCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Prix (XAF)"
                    value={tempItem.originalPrice || ""}
                    onChange={(e) =>
                      setTempItem({
                        ...tempItem,
                        originalPrice: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <Button onClick={addItemToBasket} className="gap-1">
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basket items list */}
            <AnimatePresence>
              {basketItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium">
                    Articles dans le panier ({basketItems.length})
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {basketItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {getCategoryName(item.category)} • x{item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">
                            {formatPrice(item.originalPrice)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItemFromBasket(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pricing & Pickup */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basket_discount">Réduction (%)</Label>
                <Input
                  id="basket_discount"
                  type="number"
                  min="10"
                  max="70"
                  value={basketDiscount}
                  onChange={(e) =>
                    setBasketDiscount(parseInt(e.target.value) || 30)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basket_pickup_start">Début récupération</Label>
                <Input
                  id="basket_pickup_start"
                  type="time"
                  value={basketPickupStart}
                  onChange={(e) => setBasketPickupStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basket_pickup_end">Fin récupération</Label>
                <Input
                  id="basket_pickup_end"
                  type="time"
                  value={basketPickupEnd}
                  onChange={(e) => setBasketPickupEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Basket Summary */}
            {basketItems.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Prix total original
                      </p>
                      <p className="font-medium line-through text-muted-foreground">
                        {formatPrice(basketTotalOriginal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Prix de vente
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(basketTotalDiscounted)}
                      </p>
                    </div>
                    <Badge className="text-lg px-3 py-1">-{basketDiscount}%</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmitBasket}
                disabled={basketItems.length === 0}
              >
                <ShoppingBasket className="w-4 h-4 mr-2" />
                Créer le panier ({basketItems.length} articles)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
