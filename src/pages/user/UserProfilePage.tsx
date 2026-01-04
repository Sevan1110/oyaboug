// ============================================
// User Profile Page - Account Information
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { useState, useRef, useEffect } from "react";
import { UserLayout } from "@/components/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Camera,
  Edit,
  Save,
  Award,
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { requireSupabaseClient } from "@/api/supabaseClient";

const UserProfilePage = () => {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Obtenir les informations de l'utilisateur depuis useAuth ou localStorage
  const getUserData = () => {
    // Essayer d'abord les données de Supabase
    const fullName = user?.user_metadata?.full_name || '';
    const nameParts = fullName.split(' ');
    
    const supabaseData = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
      bio: user?.user_metadata?.bio || '',
      avatar: user?.user_metadata?.avatar_url || '',
      createdAt: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      stats: {
        mealsRescued: 0, // TODO: Récupérer depuis l'API
        moneySaved: 0,    // TODO: Récupérer depuis l'API
        co2Saved: 0,      // TODO: Récupérer depuis l'API
        badgesEarned: 0,   // TODO: Récupérer depuis l'API
      },
    };
    
    // Si les données Supabase sont vides, essayer le localStorage
    if (!supabaseData.firstName && !supabaseData.lastName && !supabaseData.phone) {
      try {
        const localData = localStorage.getItem('userProfile_backup');
        if (localData) {
          const parsedData = JSON.parse(localData);
          const localFullName = parsedData.full_name || '';
          const localNameParts = localFullName.split(' ');
          
          return {
            firstName: localNameParts[0] || '',
            lastName: localNameParts.slice(1).join(' ') || '',
            email: parsedData.email || user?.email || '',
            phone: parsedData.phone || '',
            address: parsedData.address || '',
            bio: parsedData.bio || '',
            avatar: parsedData.avatar_url || '',
            createdAt: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '',
            stats: supabaseData.stats,
          };
        }
      } catch (error) {
        console.warn('Erreur lors de la lecture du localStorage:', error);
      }
    }
    
    return supabaseData;
  };

  const userData = getUserData();
  
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    address: userData.address,
    bio: userData.bio,
  });

  // Fonction pour compresser une image avant de la stocker
  const compressImage = (base64String: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image compressée
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = base64String;
    });
  };

  // Fonction pour gérer le quota localStorage
  const manageLocalStorageQuota = () => {
    try {
      // Nettoyer les anciennes données si nécessaire
      const keys = Object.keys(localStorage);
      const profileKeys = keys.filter(key => key.startsWith('userProfile_backup'));
      
      if (profileKeys.length > 1) {
        // Garder seulement la plus récente
        const sortedKeys = profileKeys.sort((a, b) => {
          const dataA = JSON.parse(localStorage.getItem(a) || '{}');
          const dataB = JSON.parse(localStorage.getItem(b) || '{}');
          return new Date(dataB.lastUpdated || 0).getTime() - new Date(dataA.lastUpdated || 0).getTime();
        });
        
        // Supprimer les anciennes
        sortedKeys.slice(1).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage du localStorage:', error);
    }
  };

  // Fonction pour sauvegarder dans le localStorage avec gestion d'erreur
  const saveToLocalStorage = (key: string, data: any): boolean => {
    try {
      // Gérer le quota avant de sauvegarder
      manageLocalStorageQuota();
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        console.warn('LocalStorage plein, tentative de nettoyage...');
        
        // Nettoyer et réessayer
        try {
          localStorage.clear(); // Nettoyer tout en dernier recours
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch (retryError) {
          console.error('Impossible de sauvegarder dans localStorage même après nettoyage:', retryError);
          return false;
        }
      }
      console.error('Erreur lors de la sauvegarde localStorage:', error);
      return false;
    }
  };

  // Synchroniser formData avec les données utilisateur actualisées
  useEffect(() => {
    const updatedUserData = getUserData();
    setFormData({
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName,
      email: updatedUserData.email,
      phone: updatedUserData.phone,
      address: updatedUserData.address,
      bio: updatedUserData.bio,
    });
    
    // Mettre à jour l'image de profil si elle change
    if (updatedUserData.avatar) {
      setProfileImage(updatedUserData.avatar);
    }
  }, [user?.user_metadata]);

  // Fonction pour gérer le téléchargement de la photo de profil
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    console.log('Début de l\'upload de photo de profil...');
    
    // Vérifier la taille du fichier (2Mo maximum)
    const maxSize = 2 * 1024 * 1024; // 2Mo en octets
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La photo de profil ne doit pas dépasser 2Mo.",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format de fichier invalide",
        description: "Veuillez sélectionner une image valide.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Convertir l'image en base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        console.log('Image convertie en base64, taille originale:', base64String.length);
        
        // Compresser l'image pour réduire la taille
        let compressedBase64 = base64String;
        try {
          compressedBase64 = await compressImage(base64String, 600, 0.6);
          console.log('Image compressée, nouvelle taille:', compressedBase64.length);
        } catch (compressError) {
          console.warn('Erreur lors de la compression, utilisation de l\'image originale:', compressError);
        }
        
        // Toujours sauvegarder l'image localement d'abord
        try {
          const currentLocalData = localStorage.getItem('userProfile_backup');
          const parsedData = currentLocalData ? JSON.parse(currentLocalData) : {};
          
          const updatedLocalData = {
            ...parsedData,
            avatar_url: compressedBase64,
            avatar_type: file.type,
            lastUpdated: new Date().toISOString(),
            email: user?.email
          };
          
          const saved = saveToLocalStorage('userProfile_backup', updatedLocalData);
          
          if (saved) {
            console.log('Image sauvegardée localement avec succès');
            
            // Mettre à jour l'état local immédiatement
            setProfileImage(compressedBase64);
            
            toast({
              title: "Photo de profil ajoutée",
              description: "Votre photo a été enregistrée localement.",
            });
          } else {
            throw new Error("Impossible de sauvegarder localement");
          }
          
        } catch (localError) {
          console.error('Erreur lors de la sauvegarde locale de l\'image:', localError);
          toast({
            title: "Erreur locale",
            description: "Impossible de sauvegarder l'image localement. Essayez avec une image plus petite.",
            variant: "destructive",
          });
          return;
        }
        
        // Essayer de synchroniser avec Supabase
        try {
          const supabaseClient = requireSupabaseClient();
          if (supabaseClient) {
            console.log('Tentative de synchronisation de l\'image avec Supabase...');
            
            const { error: updateError } = await supabaseClient.auth.updateUser({
              data: {
                user_metadata: {
                  ...user?.user_metadata,
                  avatar_url: compressedBase64,
                  avatar_type: file.type,
                }
              }
            });
            
            if (updateError) {
              throw updateError;
            }
            
            console.log('Image synchronisée avec Supabase avec succès');
            
            // Rafraîchir les données utilisateur pour mettre à jour toute l'application
            if (refreshUser) {
              await refreshUser();
            }
            
            toast({
              title: "Photo de profil synchronisée",
              description: "Votre photo a été enregistrée dans la base de données.",
            });
          } else {
            console.warn('Client Supabase non disponible pour la synchronisation');
          }
        } catch (networkError) {
          console.warn('Erreur réseau lors de la synchronisation de l\'image:', networkError);
          // L'image est déjà sauvegardée localement, pas d'erreur critique
        }
      };
      
      reader.onerror = () => {
        throw new Error("Erreur lors de la lecture du fichier");
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement de la photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour supprimer la photo de profil
  const handleRemoveImage = async () => {
    try {
      const supabaseClient = requireSupabaseClient();
      
      // Supprimer l'URL des métadonnées utilisateur
      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: {
          user_metadata: {
            ...user?.user_metadata,
            avatar_url: null
          }
        }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Rafraîchir les données utilisateur pour mettre à jour toute l'application
      if (refreshUser) {
        await refreshUser();
      }
      
      // Réinitialiser l'état local
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Photo supprimée",
        description: "Votre photo de profil a été supprimée avec succès.",
      });
      
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast({
        title: "Erreur de suppression",
        description: "Une erreur est survenue lors de la suppression de la photo.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour déclencher le sélecteur de fichiers
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    console.log('Début de la sauvegarde du profil...');
    
    try {
      // Diagnostic de l'état de connexion
      console.log('État de l\'utilisateur:', {
        user: user ? 'connecté' : 'non connecté',
        userId: user?.id,
        userEmail: user?.email,
        userMetadata: user?.user_metadata
      });
      
      // Diagnostic du client Supabase
      let supabaseClient;
      try {
        supabaseClient = requireSupabaseClient();
        console.log('Client Supabase obtenu avec succès');
      } catch (clientError) {
        console.error('Erreur lors de l\'obtention du client Supabase:', clientError);
        throw new Error('Configuration Supabase invalide');
      }
      
      // Préparer les métadonnées à mettre à jour
      const updatedMetadata = {
        ...user?.user_metadata,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        // Conserver l'URL de l'avatar si elle existe
        avatar_url: profileImage || user?.user_metadata?.avatar_url || null,
      };
      
      console.log('Métadonnées préparées:', updatedMetadata);
      
      // Priorité absolue : Sauvegarde dans Supabase
      let supabaseSuccess = false;
      try {
        if (supabaseClient) {
          console.log('Tentative de sauvegarde dans la base de données Supabase...');
          
          const { data, error: updateError } = await supabaseClient.auth.updateUser({
            data: {
              user_metadata: updatedMetadata
            }
          });
          
          console.log('Réponse Supabase:', { data, error: updateError });
          
          if (updateError) {
            console.error('Erreur Supabase détaillée:', updateError);
            throw updateError;
          }
          
          console.log('Sauvegarde dans Supabase réussie');
          supabaseSuccess = true;
          
          // Rafraîchir les données utilisateur pour mettre à jour toute l'application
          if (refreshUser) {
            await refreshUser();
          }
          
          toast({
            title: "Profil sauvegardé",
            description: "Vos informations ont été enregistrées dans la base de données.",
          });
          
        } else {
          throw new Error("Client Supabase non disponible");
        }
      } catch (networkError) {
        console.error('Erreur lors de la sauvegarde dans Supabase:', networkError);
        
        // Mode dégradé : Sauvegarde locale uniquement si erreur réseau
        console.warn('Utilisation du mode de secours local...');
        
        const localProfileData = {
          ...updatedMetadata,
          lastUpdated: new Date().toISOString(),
          email: user?.email
        };
        
        const localSaved = saveToLocalStorage('userProfile_backup', localProfileData);
        
        if (localSaved) {
          toast({
            title: "Sauvegarde locale uniquement",
            description: `Problème de connexion: ${networkError.message || 'Erreur réseau'}. Données sauvegardées localement uniquement.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Erreur de sauvegarde",
            description: "Impossible de sauvegarder les données. Vérifiez votre connexion.",
            variant: "destructive",
          });
          return; // Sortir si même la sauvegarde locale échoue
        }
      }
      
      // Mettre à jour l'état local dans tous les cas
      setIsEditing(false);
      
      // Forcer la relecture des données pour l'interface
      const refreshedData = getUserData();
      setFormData({
        firstName: refreshedData.firstName,
        lastName: refreshedData.lastName,
        email: refreshedData.email,
        phone: refreshedData.phone,
        address: refreshedData.address,
        bio: refreshedData.bio,
      });
      
      console.log('Sauvegarde terminée. Succès Supabase:', supabaseSuccess);
      
    } catch (error) {
      console.error('Erreur générale lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: `Erreur: ${error.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`,
        variant: "destructive",
      });
      
      // Même en cas d'erreur générale, quitter le mode édition
      setIsEditing(false);
    }
  };

  return (
    <UserLayout title="Mon profil" subtitle="Gérez vos informations personnelles">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage 
                    src={profileImage || userData.avatar} 
                    alt={`${userData.firstName} ${userData.lastName}`} 
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Input caché pour le téléchargement */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Bouton d'action */}
                <div className="absolute bottom-0 right-0 flex gap-1">
                  {(profileImage || userData.avatar) ? (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        title="Changer la photo"
                      >
                        {isUploading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={handleRemoveImage}
                        title="Supprimer la photo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      title="Ajouter une photo"
                    >
                      {isUploading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Informations de la photo */}
              {(profileImage || userData.avatar) && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground">
                    Photo de profil
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Taille maximale: 2Mo
                  </p>
                </div>
              )}

              <h2 className="text-xl font-bold text-foreground">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Membre depuis {new Date(userData.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {userData.stats.badgesEarned} badges
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {userData.stats.mealsRescued}
                  </p>
                  <p className="text-xs text-muted-foreground">Repas sauvés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {userData.stats.co2Saved} kg
                  </p>
                  <p className="text-xs text-muted-foreground">CO₂ évités</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                placeholder="Parlez-nous de vous..."
              />
            </div>

            {/* Member since */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
              <Calendar className="h-4 w-4" />
              <span>
                Membre depuis le {new Date(userData.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
