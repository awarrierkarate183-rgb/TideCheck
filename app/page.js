"use client"; // must be first line

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home"); // redirect to the homepage
  }, [router]);

  return null;
}