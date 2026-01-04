// ============================================
// Admin Clients Page - Client Management
// ouyaboung Platform - Anti-gaspillage alimentaire
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
import { Search, Users, Eye, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data
const mockClients = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+241 01 23 45 67',
    createdAt: new Date('2024-01-10'),
    ordersCount: 15,
    totalSpent: 75000,
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Koumba',
    email: 'marie.k@email.com',
    phone: '+241 01 98 76 54',
    createdAt: new Date('2024-01-12'),
    ordersCount: 8,
    totalSpent: 42000,
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Paul',
    lastName: 'Nguema',
    email: 'paul.nguema@email.com',
    phone: '+241 01 11 22 33',
    createdAt: new Date('2024-01-15'),
    ordersCount: 3,
    totalSpent: 15000,
    status: 'active',
  },
  {
    id: '4',
    firstName: 'Claire',
    lastName: 'Obiang',
    email: 'claire.obiang@email.com',
    phone: '+241 01 44 55 66',
    createdAt: new Date('2024-01-18'),
    ordersCount: 0,
    totalSpent: 0,
    status: 'inactive',
  },
];

const AdminClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients] = useState(mockClients);

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <AdminLayout
      title="Gestion des clients"
      subtitle="Consultez et gérez les clients de la plateforme"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-sm text-muted-foreground">Total clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {clients.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Clients actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-center">Commandes</TableHead>
                <TableHead className="text-right">Total dépensé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(client.createdAt, "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-center">
                    {client.ordersCount}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(client.totalSpent)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status === 'active' ? 'Actif' : 'Inactif'}
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
    </AdminLayout>
  );
};

export default AdminClientsPage;
