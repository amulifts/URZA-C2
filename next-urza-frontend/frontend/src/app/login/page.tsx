// next-urza-frontend\frontend\src\app\page.tsx

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type FormValues = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ defaultValues: { username: "", password: "" } });

  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError("");
      setServerSuccess("");

      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        // If using cookies/sessions
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to login.");
      }

      const result = await response.json();

      if (result.success) {
        setServerSuccess("Login successful! Redirecting to main page...")
        reset(); // Clear the form

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/main");
        }, 2000)
      } else {
        setServerError(result.message || "Invalid credentials.");
      }
    } catch (error: any) {
      setServerError(error.message || "An error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >

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

        <button
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          type="submit"
        >
          Login
        </button>
      </form>

    {/* Show server error or success messages */}
      {serverError && <div className="text-red-500 mt-4">{serverError}</div>}
      {serverSuccess && <div className="text-green-500 mt-4">{serverSuccess}</div>}
    </div>
  );
}
