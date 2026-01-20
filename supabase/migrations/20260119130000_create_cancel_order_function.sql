-- Solution Alternative: Fonction RPC pour annuler une commande
-- Cette fonction contourne les politiques RLS en utilisant SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.cancel_user_order(
  p_order_id uuid,
  p_cancellation_reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_food_item food_items%ROWTYPE;
  v_result json;
BEGIN
  -- Vérifier que la commande appartient à l'utilisateur connecté
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Order not found or access denied'
    );
  END IF;

  -- Vérifier que la commande peut être annulée
  IF v_order.status NOT IN ('pending', 'confirmed') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Order cannot be cancelled (status: ' || v_order.status || ')'
    );
  END IF;

  -- Récupérer les informations du food_item
  SELECT * INTO v_food_item
  FROM food_items
  WHERE id = v_order.food_item_id;

  -- Mettre à jour la commande
  UPDATE orders
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Restaurer la quantité disponible
  IF v_food_item.id IS NOT NULL THEN
    UPDATE food_items
    SET 
      quantity_available = quantity_available + v_order.quantity,
      is_available = true,
      updated_at = NOW()
    WHERE id = v_food_item.id;
  END IF;

  -- Retourner le succès
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_order.id,
      'status', 'cancelled',
      'cancelled_at', NOW()
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Donner les permissions à authenticated users
GRANT EXECUTE ON FUNCTION public.cancel_user_order(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.cancel_user_order IS 'Permet à un utilisateur d''annuler sa propre commande';
