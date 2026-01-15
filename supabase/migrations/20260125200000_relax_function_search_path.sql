-- ==========================================
-- Relax Search Path for Security Definer Functions
-- ==========================================

-- Function to update the search_path for a specific function
-- This uses dynamic SQL to update all our custom functions
DO $$
DECLARE
    func_name RECORD;
BEGIN
    FOR func_name IN 
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, extensions', 
                       func_name.nspname, func_name.proname, func_name.args);
    END LOOP;
END $$;
