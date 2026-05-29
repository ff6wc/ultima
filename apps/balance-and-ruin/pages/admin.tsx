import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/create?tab=admin");
  }, [router]);

  return null;
}
