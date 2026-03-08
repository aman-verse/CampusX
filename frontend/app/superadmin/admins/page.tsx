"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/types"

export default function AdminsPage() {

    const [admins, setAdmins] = useState<User[]>([])

    useEffect(() => {
        api.getAdmins().then(setAdmins)
    }, [])

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Admins</h1>

            <ul className="mt-4 space-y-2">
                {admins.map((admin) => (
                    <li key={admin.id} className="border p-3 rounded">
                        {admin.email}
                    </li>
                ))}
            </ul>
        </div>
    )
}