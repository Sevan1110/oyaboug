import { useEffect, useState, useRef } from "react";
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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthUser, updateProfile as updateAuthProfile } from "@/services/auth.service";
import { updateProfile as updateUserProfile } from "@/services/user.service";
import { supabaseClient } from "@/api/supabaseClient";

const UserProfilePage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    createdAt: "",
    avatar: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: auth } = await getAuthUser();
      const authUser = auth?.user;

      if (!authUser) {
        setLoading(false);
        return;
      }

      const metadata = authUser.user_metadata || {};
      const nameParts = (metadata.full_name || "").split(" ");

      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: authUser.email || "",
        phone: metadata.phone || "",
        address: metadata.address || "",
        bio: metadata.bio || "",
        createdAt: authUser.created_at || "",
        avatar: metadata.avatar_url || "",
      });

    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: auth } = await getAuthUser();
      if (!auth?.user?.id) throw new Error("User not found");
      const userId = auth.user.id;

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const resp = await updateUserProfile(userId, {
        fullName: fullName,
        phone: formData.phone,
        address: formData.address,
        // Bio is stored in metadata in this implementation if not in profile
      });

      if (resp?.success) {
        setIsEditing(false);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès."
        });
      } else {
        throw new Error(resp.error?.message || "Échec de la mise à jour");
      }
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message || "Échec de la mise à jour",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileSize = file.size / 1024 / 1024; // MB

    if (fileSize > 5) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: auth } = await getAuthUser();
      const userId = auth?.user?.id;
      if (!userId || !supabaseClient) throw new Error("Erreur d'authentification");

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback or retry logic could go here, but usually it means bucket doesn't exist or RLS issue.
        // For this demo, let's assume it might fail if bucket missing.
        throw uploadError;
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const updateRes = await updateAuthProfile({ avatar_url: publicUrl });

      if (updateRes.success) {
        setFormData(prev => ({ ...prev, avatar: publicUrl }));
        toast({
          title: "Photo mise à jour",
          description: "Votre photo de profil a été modifiée.",
        });
      } else {
        throw new Error("Impossible de mettre à jour le profil avec la nouvelle photo.");
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger l'image. Vérifiez votre connexion ou réessayez.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <UserLayout title="Mon profil" subtitle="Gérez vos informations personnelles">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Mon profil" subtitle="Gérez vos informations personnelles">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={formData.avatar} alt={formData.firstName} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Membre depuis {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  0 badges
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-xs text-muted-foreground">Repas sauvés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">0 kg</p>
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
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
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
                  disabled={true} // Email change usually requires separate flow
                  className="pl-10 bg-muted/50"
                  title="L'email ne peut pas être modifié ici"
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
                Membre depuis le {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("fr-FR") : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
