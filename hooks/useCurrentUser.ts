import { useQuery } from "@tanstack/react-query";
import { apiClient, isApiError } from "@/lib/api-client";
import type { User } from "@/types/user";

/**
 * The single source of truth for "who is logged in" on the frontend.
 * This always re-validates against Laravel - the frontend never assumes
 * a session is valid just because a previous page thought it was
 * (spec section 3: the frontend is never trusted for authorization).
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<User>("/v1/auth/me");
        return data;
      } catch (error) {
        if (isApiError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useIsAdmin(): boolean {
  const { data: user } = useCurrentUser();
  return user?.role === "admin";
}
