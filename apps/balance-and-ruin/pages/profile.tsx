import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/create?tab=profile");
  }, [router]);

  return null;
}
