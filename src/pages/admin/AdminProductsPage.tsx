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
import { Search, Package, ShoppingBasket, Eye, Store } from "lucide-react";

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Pain au chocolat',
    merchant: 'Boulangerie Le Pain Doré',
    originalPrice: 500,
    discountPrice: 250,
    quantity: 10,
    category: 'Viennoiserie',
    status: 'active',
  },
  {
    id: '2',
    name: 'Croissant beurre',
    merchant: 'Boulangerie Le Pain Doré',
    originalPrice: 400,
    discountPrice: 200,
    quantity: 15,
    category: 'Viennoiserie',
    status: 'active',
  },
  {
    id: '3',
    name: 'Sandwich poulet',
    merchant: 'Restaurant Chez Mama',
    originalPrice: 2500,
    discountPrice: 1500,
    quantity: 5,
    category: 'Sandwich',
    status: 'active',
  },
  {
    id: '4',
    name: 'Salade César',
    merchant: 'Restaurant Chez Mama',
    originalPrice: 3000,
    discountPrice: 1800,
    quantity: 0,
    category: 'Salade',
    status: 'sold_out',
  },
];

const mockBaskets = [
  {
    id: '1',
    name: 'Panier Surprise Boulangerie',
    merchant: 'Boulangerie Le Pain Doré',
    originalPrice: 3000,
    discountPrice: 1500,
    quantity: 5,
    contents: 'Assortiment de viennoiseries et pains',
    status: 'active',
  },
  {
    id: '2',
    name: 'Panier Déjeuner',
    merchant: 'Restaurant Chez Mama',
    originalPrice: 5000,
    discountPrice: 2500,
    quantity: 3,
    contents: 'Plat du jour + dessert + boisson',
    status: 'active',
  },
];

const AdminProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const filteredProducts = mockProducts.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.merchant.toLowerCase().includes(query)
    );
  });

  const filteredBaskets = mockBaskets.filter(basket => {
    const query = searchQuery.toLowerCase();
    return (
      basket.name.toLowerCase().includes(query) ||
      basket.merchant.toLowerCase().includes(query)
    );
  });

  return (
    <AdminLayout
      title="Produits & Paniers"
      subtitle="Gérez les produits et paniers de la plateforme"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockProducts.length}</p>
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
              <p className="text-2xl font-bold">{mockBaskets.length}</p>
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
                {mockProducts.filter(p => p.status === 'active').length + 
                 mockBaskets.filter(b => b.status === 'active').length}
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
            placeholder="Rechercher..."
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
            Produits ({mockProducts.length})
          </TabsTrigger>
          <TabsTrigger value="baskets" className="gap-2">
            <ShoppingBasket className="w-4 h-4" />
            Paniers ({mockBaskets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liste des produits</CardTitle>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.merchant}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right line-through text-muted-foreground">
                        {formatCurrency(product.originalPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(product.discountPrice)}
                      </TableCell>
                      <TableCell className="text-center">{product.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status === 'active' ? 'Actif' : 'Épuisé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baskets">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liste des paniers</CardTitle>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBaskets.map((basket) => (
                    <TableRow key={basket.id}>
                      <TableCell className="font-medium">{basket.name}</TableCell>
                      <TableCell className="text-muted-foreground">{basket.merchant}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {basket.contents}
                      </TableCell>
                      <TableCell className="text-right line-through text-muted-foreground">
                        {formatCurrency(basket.originalPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(basket.discountPrice)}
                      </TableCell>
                      <TableCell className="text-center">{basket.quantity}</TableCell>
                      <TableCell>
                        <Badge variant={basket.status === 'active' ? 'default' : 'secondary'}>
                          {basket.status === 'active' ? 'Actif' : 'Épuisé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
