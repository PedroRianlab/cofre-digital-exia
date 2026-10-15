import { api } from "@/lib/api";
import type {
  AuthCredentials,
  LoginResponse,
  RegisterResponse,
} from "./auth.types";

export async function loginRequest(credentials: AuthCredentials) {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  return response.data;
}

export async function registerRequest(credentials: AuthCredentials) {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    credentials,
  );
  return response.data;
}
