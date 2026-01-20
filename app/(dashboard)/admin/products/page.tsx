"use client";

// ============================================
// Admin Products Page - Products & Baskets
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, ShoppingBasket, Eye, Store, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { AdminProduct } from "@/types/admin.types";

const AdminProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const { data: allItems, isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminService.getProducts,
  });

  if (error) {
    toast.error("Erreur lors du chargement des produits");
  }

  const products = allItems?.filter(item => item.category !== 'mixed_basket') || [];
  const baskets = allItems?.filter(item => item.category === 'mixed_basket') || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.merchantName?.toLowerCase() || '').includes(query)
    );
  });

  const filteredBaskets = baskets.filter(basket => {
    const query = searchQuery.toLowerCase();
    return (
      basket.name.toLowerCase().includes(query) ||
      (basket.merchantName?.toLowerCase() || '').includes(query)
    );
  });

  if (isLoading) {
    return (
      <AdminLayout title="Produits & Paniers" subtitle="Chargement...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Produits & Paniers"
      subtitle="Vue d'ensemble du catalogue (Lecture seule)"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-muted-foreground">Produits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShoppingBasket className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{baskets.length}</p>
              <p className="text-sm text-muted-foreground">Paniers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {products.filter(p => p.isAvailable).length +
                  baskets.filter(b => b.isAvailable).length}
              </p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou commerce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Produits ({products.length})
          </TabsTrigger>
          <TabsTrigger value="baskets" className="gap-2">
            <ShoppingBasket className="w-4 h-4" />
            Paniers ({baskets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Catalogue des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Commerce</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Prix original</TableHead>
                    <TableHead className="text-right">Prix réduit</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.merchantName || 'Inconnu'}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right line-through text-muted-foreground">
                        {formatCurrency(product.originalPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(product.discountPrice)}
                      </TableCell>
                      <TableCell className="text-center">{product.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                          {product.isAvailable ? 'Actif' : 'Épuisé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" title="Détails (à venir)">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baskets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Catalogue des paniers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Panier</TableHead>
                    <TableHead>Commerce</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead className="text-right">Prix original</TableHead>
                    <TableHead className="text-right">Prix réduit</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBaskets.map((basket) => (
                    <TableRow key={basket.id}>
                      <TableCell className="font-medium">{basket.name}</TableCell>
                      <TableCell className="text-muted-foreground">{basket.merchantName || 'Inconnu'}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {basket.description || 'Aucun contenu spécifié'}
                      </TableCell>
                      <TableCell className="text-right line-through text-muted-foreground">
                        {formatCurrency(basket.originalPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(basket.discountPrice)}
                      </TableCell>
                      <TableCell className="text-center">{basket.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={basket.isAvailable ? 'default' : 'secondary'}>
                          {basket.isAvailable ? 'Actif' : 'Épuisé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" title="Détails (à venir)">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBaskets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun panier trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminProductsPage;
