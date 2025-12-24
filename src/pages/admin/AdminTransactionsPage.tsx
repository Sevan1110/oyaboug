// ============================================
// Admin Transactions Page - Sales Management
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ShoppingBag, DollarSign, TrendingUp, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data
const mockTransactions = [
  {
    id: 'TRX-001',
    clientName: 'Jean Dupont',
    merchantName: 'Boulangerie Le Pain Doré',
    items: 'Panier Surprise Boulangerie',
    amount: 1500,
    status: 'completed',
    createdAt: new Date('2024-01-18T14:30:00'),
    completedAt: new Date('2024-01-18T15:00:00'),
  },
  {
    id: 'TRX-002',
    clientName: 'Marie Koumba',
    merchantName: 'Restaurant Chez Mama',
    items: 'Panier Déjeuner',
    amount: 2500,
    status: 'completed',
    createdAt: new Date('2024-01-18T12:15:00'),
    completedAt: new Date('2024-01-18T12:45:00'),
  },
  {
    id: 'TRX-003',
    clientName: 'Paul Nguema',
    merchantName: 'Boulangerie Le Pain Doré',
    items: 'Pain au chocolat x3',
    amount: 750,
    status: 'pending',
    createdAt: new Date('2024-01-18T16:00:00'),
  },
  {
    id: 'TRX-004',
    clientName: 'Claire Obiang',
    merchantName: 'Restaurant Chez Mama',
    items: 'Sandwich poulet',
    amount: 1500,
    status: 'cancelled',
    createdAt: new Date('2024-01-17T10:00:00'),
  },
];

const statusConfig = {
  completed: { label: 'Terminé', variant: 'default' as const },
  pending: { label: 'En attente', variant: 'secondary' as const },
  cancelled: { label: 'Annulé', variant: 'destructive' as const },
};

const AdminTransactionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const filteredTransactions = mockTransactions.filter(tx => {
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(query) ||
      tx.clientName.toLowerCase().includes(query) ||
      tx.merchantName.toLowerCase().includes(query)
    );
  });

  const totalRevenue = mockTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <AdminLayout
      title="Transactions"
      subtitle="Suivi des ventes et transactions"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTransactions.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Revenus</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockTransactions.filter(tx => tx.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Complétées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockTransactions.filter(tx => tx.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Commerce</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => {
                const status = statusConfig[tx.status];
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                    <TableCell className="font-medium">{tx.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.merchantName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{tx.items}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      {format(tx.createdAt, "d MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTransactionsPage;
