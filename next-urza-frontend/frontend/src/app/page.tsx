// next-urza-frontend\frontend\src\app\page.tsx

"use client";

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        router.push("/login")
    }, [router])

    return null
}
