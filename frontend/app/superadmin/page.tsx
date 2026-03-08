"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { User, College } from "@/lib/types"
import { useRouter } from "next/navigation"


export default function SuperadminPage() {

    const { logout } = useAuth()
    const router = useRouter()
    const [admins, setAdmins] = useState<User[]>([])
    const [colleges, setColleges] = useState<College[]>([])
    const [loading, setLoading] = useState(true)

    const [newAdminEmail, setNewAdminEmail] = useState("")
    const [newCollegeName, setNewCollegeName] = useState("")
    const [newCollegeDomain, setNewCollegeDomain] = useState("")

    //////////////////////////////////////////////////
    // LOAD DATA
    //////////////////////////////////////////////////

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const adminData = await api.getAdmins()
            const collegeData = await api.getSuperadminColleges()
            setAdmins(adminData)
            setColleges(collegeData)

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    //////////////////////////////////////////////////
    // PROMOTE ADMIN
    //////////////////////////////////////////////////

    async function createAdmin() {
        try {
            await api.updatesuperadmin(newAdminEmail, "admin",true)
            setNewAdminEmail("")
            loadData()
        } catch (err) {
            console.error(err)
        }
    }

    //////////////////////////////////////////////////
    // DELETE ADMIN
    //////////////////////////////////////////////////

    async function deleteAdmin(userId: number) {
        try {
            await api.deleteUser(userId)
            loadData()
        } catch (err) {
            console.error(err)
        }
    }

    //////////////////////////////////////////////////
    // CREATE COLLEGE
    //////////////////////////////////////////////////

    async function createCollege() {

        try {
            await api.createsuperadminCollege({
                name: newCollegeName.trim(),
                allowed_domains: newCollegeDomain.trim(),
                allow_external_emails: false
            })
            setNewCollegeName("")
            setNewCollegeDomain("")
            loadData()
        } catch (err) {
            console.error(err)
        }
    }

    //////////////////////////////////////////////////
    // LOADING
    //////////////////////////////////////////////////

    if (loading) {
        return <div className="p-10 text-center text-lg">Loading...</div>
    }

    //////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////

    return (

        <div className="min-h-screen flex bg-gray-100">

            {/* Sidebar */}

            <div className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">

                <div>

                    <h1 className="text-2xl font-bold mb-6">
                        Superadmin
                    </h1>

                    <div className="space-y-2">

                        <button
                            onClick={() => router.push("/superadmin")}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => router.push("/superadmin/admins")}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                            Admins
                        </button>

                        <button
                            onClick={() => router.push("/superadmin/colleges")}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
                        >
                            Colleges
                        </button>

                    </div>

                </div>

                <button
                    onClick={() => {
                        logout()
                        router.push("/login")
                    }}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                    Logout
                </button>

            </div>


            {/* MAIN PANEL */}

            <div className="flex-1 p-8 space-y-10">

                <h2 className="text-3xl font-bold">
                    Platform Overview
                </h2>


                {/* PROMOTE ADMIN */}

                <div className="bg-white p-6 rounded shadow space-y-4">

                    <h3 className="text-xl font-semibold ">
                        Promote Admin
                    </h3>

                    <input
                        className="border p-2 w-full rounded "
                        placeholder="User Email"
                        value={newAdminEmail}
                        onChange={(e) =>
                            setNewAdminEmail(e.target.value)
                        }
                    />

                    <button
                        onClick={createAdmin}
                        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Promote
                    </button>

                </div>


                {/* CREATE COLLEGE */}

                <div className="bg-white p-6 rounded shadow space-y-4">

                    <h3 className="text-xl font-semibold">
                        Create College
                    </h3>

                    <input
                        className="border p-2 w-full rounded"
                        placeholder="College Name"
                        value={newCollegeName}
                        onChange={(e) =>
                            setNewCollegeName(e.target.value)
                        }
                    />

                    <input
                        className="border p-2 w-full rounded"
                        placeholder="Allowed Domain"
                        value={newCollegeDomain}
                        onChange={(e) =>
                            setNewCollegeDomain(e.target.value)
                        }
                    />
                    

                    <button
                        onClick={createCollege}
                        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Create College
                    </button>

                </div>


                {/* ADMINS */}

                <div>

                    <h3 className="text-xl font-semibold mb-4">
                        Admins
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {admins.map((admin) => (

                            <div
                                key={admin.id}
                                className="bg-white p-4 rounded shadow"
                            >

                                <div className="font-semibold">
                                    {admin.name || "Admin"}
                                </div>

                                <div className="text-sm text-gray-500">
                                    {admin.email}
                                </div>

                                <button
                                    onClick={() =>
                                        deleteAdmin(admin.id)
                                    }
                                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
                                >
                                    Delete
                                </button>

                            </div>

                        ))}

                    </div>

                </div>


                

            </div>

        </div>
    )
}