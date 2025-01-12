// next-urza-frontend\frontend\src\app\login\page.tsx

"use client"

import React, { useState, useContext } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/AuthContext"
import { toast } from "react-toastify"
import axios from "axios"

type FormValues = {
  username: string
  password: string
}

export default function LoginPage() {
  const [serverError, setServerError] = useState<string>("")
  const [serverSuccess, setServerSuccess] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ defaultValues: { username: "", password: "" } })

  const router = useRouter()
  const { login, user } = useContext(AuthContext)

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.username, data.password)
      setServerSuccess("Login successful! Redirecting to main page...")
      toast.success("Login successful! Redirecting to main page...")
      reset()

      setTimeout(() => {
        router.push("/main")
      }, 2000)
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          setServerError(error.response.data.detail)
          toast.error(error.response.data.detail)
        } else {
          setServerError("Login failed.")
          toast.error("Login failed.")
        }
      } else {
        setServerError("An unexpected error occurred.")
        toast.error("An unexpected error occurred.")
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        {/* Username */}
        <div>
          <label className="block mb-1">Username</label>
          <input
            {...register("username", { required: "Username is required" })}
            className="border p-2 rounded w-full"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="border p-2 rounded w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600" type="submit">
          Login
        </button>
      </form>

      {serverError && <div className="text-red-500 mt-4">{serverError}</div>}
      {serverSuccess && <div className="text-green-500 mt-4">{serverSuccess}</div>}
    </div>
  )
}
