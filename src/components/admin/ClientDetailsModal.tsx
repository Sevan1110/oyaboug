import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, MapPin, Phone, Calendar, ShoppingBag } from "lucide-react";
import type { AdminClient } from "@/types/admin.types";
import { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { Separator } from "@/components/ui/separator";

interface ClientDetailsModalProps {
    client: AdminClient | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ClientOrder {
    id: string;
    merchantName: string;
    totalPrice: number;
    status: string;
    createdAt: Date;
    itemsCount: number;
}

export const ClientDetailsModal = ({
    client,
    isOpen,
    onClose,
}: ClientDetailsModalProps) => {
    const [orders, setOrders] = useState<ClientOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (client && isOpen) {
            const fetchHistory = async () => {
                setLoadingOrders(true);
                try {
                    const history = await adminService.getClientOrders(client.id);
                    setOrders(history);
                } catch (error) {
                    console.error("Failed to load client history", error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchHistory();
        }
    }, [client, isOpen]);

    if (!client) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500">Terminée</Badge>;
            case "pending":
                return <Badge variant="secondary">En cours</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Annulée</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base">
                            {client.fullName
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                        {client.fullName}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Informations personnelles
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{client.phone || "Non renseigné"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>
                                    {client.city}
                                    {client.quartier && `, ${client.quartier}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                    Inscrit le{" "}
                                    {format(client.createdAt, "d MMMM yyyy", { locale: fr })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Engagement
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{client.ordersCount}</div>
                                <div className="text-xs text-muted-foreground">Commandes</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-lg font-bold truncate" title={formatCurrency(client.totalSpent)}>
                                    {formatCurrency(client.totalSpent)}
                                </div>
                                <div className="text-xs text-muted-foreground">Dépensé</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Statut: </span>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                {client.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex-1 min-h-0 flex flex-col mt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Historique des commandes
                    </h4>

                    <ScrollArea className="flex-1 -mx-6 px-6">
                        {loadingOrders ? (
                            <div className="py-8 text-center text-muted-foreground">Chargement de l'historique...</div>
                        ) : orders.length > 0 ? (
                            <div className="space-y-4 pb-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="font-medium">{order.merchantName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(order.createdAt, "d MMM yyyy 'à' HH:mm", {
                                                    locale: fr,
                                                })}
                                                {' • '}{order.itemsCount} article(s)
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="font-medium">
                                                {formatCurrency(order.totalPrice)}
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">Aucune commande trouvée.</div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
