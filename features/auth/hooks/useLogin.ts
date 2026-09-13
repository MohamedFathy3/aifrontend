import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ensureCsrfCookie, isApiError } from "@/lib/api-client";
import type { User } from "@/types/user";
import type { LoginFormValues } from "../schemas/login-schema";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<User, unknown, LoginFormValues>({
    mutationFn: async (credentials) => {
      // Sanctum SPA auth requires a fresh CSRF cookie before the login POST.
      await ensureCsrfCookie();
      const { data } = await apiClient.post<User>("/v1/auth/login", credentials);
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

/** Narrow a login error down to a field-level message map for the form. */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !error.response?.data.errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(error.response.data.errors).map(([field, messages]) => [field, messages[0]])
  );
}
