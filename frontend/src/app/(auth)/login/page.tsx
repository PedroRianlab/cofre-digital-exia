"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/features/auth/components/login-page";

export default function LoginRoute() {
  const router = useRouter();

  return <LoginPage onSubmit={() => router.push("/notas")} />;
}
