"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { College } from "@/lib/types"

export default function CollegesPage() {

    const [colleges, setColleges] = useState<College[]>([])

    useEffect(() => {
        api.getColleges().then(setColleges)
    }, [])

    return (
            // {/* COLLEGES */ }

            < div >

                    <h3 className="text-xl font-semibold mb-4">
                        Colleges
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {colleges.map((college) => (

                            <div
                                key={college.id}
                                className="bg-white p-4 rounded shadow"
                            >

                                <div className="font-semibold">
                                    {college.name}
                                </div>

                                <div className="text-sm text-gray-500">
                                    Domains: {college.allowed_domains}
                                </div>
                                <div className="text-sm text-gray-500">
                                    allow_external_emails: {college.allow_external_emails ? "True" : "False"}
                                </div>

                            </div>

                        ))}

                    </div>

                </div >
    )
}