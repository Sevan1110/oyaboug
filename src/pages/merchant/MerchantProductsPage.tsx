// ============================================
// Merchant Products Page - Manage Products
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import AddProductModal from "@/components/merchant/AddProductModal";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Package,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getMerchantItems, formatPrice, isExpiringSoon, getCategoryName } from "@/services";
import type { FoodItem } from "@/types";
import { toast } from "sonner";

const MerchantProductsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const merchantId = "mock-merchant-id";

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await getMerchantItems(merchantId, true);
    if (result.success && result.data) {
      setProducts(result.data);
    }
    setIsLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && product.is_available) ||
      (activeTab === "inactive" && !product.is_available) ||
      (activeTab === "expiring" &&
        product.expiry_date &&
        isExpiringSoon(product.expiry_date));
    return matchesSearch && matchesTab;
  });

  const handleToggleVisibility = (product: FoodItem) => {
    // Mock toggle
    toast.success(
      product.is_available ? "Produit masqué" : "Produit affiché"
    );
  };

  const handleDelete = (product: FoodItem) => {
    toast.success(`Produit "${product.name}" supprimé`);
  };

  const ProductCard = ({ product }: { product: FoodItem }) => {
    const discount = Math.round(
      ((product.original_price - product.discounted_price) /
        product.original_price) *
        100
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop"
              }
              alt={product.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant="secondary" className="text-xs">
                -{discount}%
              </Badge>
              {!product.is_available && (
                <Badge variant="outline" className="bg-background/80 text-xs">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Masqué
                </Badge>
              )}
            </div>
            {product.expiry_date && isExpiringSoon(product.expiry_date) && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expire bientôt
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getCategoryName(product.category)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/merchant/products/${product.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleVisibility(product)}>
                    {product.is_available ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Afficher
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.discounted_price)}
                </span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  {formatPrice(product.original_price)}
                </span>
              </div>
              <Badge variant="outline">
                {product.quantity_available} dispo
              </Badge>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Récupération: {product.pickup_start} - {product.pickup_end}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <MerchantLayout title="Mes produits" subtitle="Gérez vos invendus">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            Tous ({products.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Actifs ({products.filter((p) => p.is_available).length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Masqués ({products.filter((p) => !p.is_available).length})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="text-warning">
            Expirent bientôt (
            {
              products.filter(
                (p) => p.expiry_date && isExpiringSoon(p.expiry_date)
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-foreground mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-sm mb-4">
              {searchQuery
                ? "Essayez une autre recherche"
                : "Commencez par ajouter votre premier produit"}
            </p>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </div>
        </Card>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onProductCreated={loadProducts}
      />
    </MerchantLayout>
  );
};

export default MerchantProductsPage;
