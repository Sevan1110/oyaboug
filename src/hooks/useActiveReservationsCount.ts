import { useState, useEffect } from 'react';
import { getAuthUser, getUserOrders } from '@/services';

/**
 * Hook to get the count of active reservations for the current user
 * Returns the count of orders with status: pending, confirmed, or ready
 */
export const useActiveReservationsCount = () => {
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadCount = async () => {
            try {
                const { data: userData } = await getAuthUser();
                const userId = userData?.user?.id;

                if (!userId) {
                    if (isMounted) {
                        setCount(0);
                        setIsLoading(false);
                    }
                    return;
                }

                const resp = await getUserOrders(userId);

                if (resp?.success && resp.data?.data) {
                    const activeOrders = resp.data.data.filter((order: any) =>
                        ['pending', 'confirmed', 'ready'].includes(order.status)
                    );

                    if (isMounted) {
                        setCount(activeOrders.length);
                    }
                } else {
                    if (isMounted) {
                        setCount(0);
                    }
                }
            } catch (error) {
                console.error('Error loading reservations count:', error);
                if (isMounted) {
                    setCount(0);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCount();

        return () => {
            isMounted = false;
        };
    }, []);

    return { count, isLoading };
};
