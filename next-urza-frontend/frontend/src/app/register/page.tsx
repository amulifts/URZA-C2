// next-urza-frontend\frontend\src\app\register\page.tsx

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type FormValues = {
  username: string;
  password: string;
  confirm_password: string;
  full_name?: string;
  image_url?: string;
};

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValues>({ defaultValues: { username: "", password: "", confirm_password: "" }, });

  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.confirm_password) {
      setServerError("Passwords do not match.");
      return;
    }

    try {
      setServerError("");
      setServerSuccess("");

      const response = await fetch("http://localhost:8000/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          full_name: data.full_name,
          image_url: data.image_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create user.");
      }

      const result = await response.json();
      setServerSuccess(`User '${result.username}' created successfully! Redirecting to login...`);
      reset(); // Clear the form

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setServerError(error.message || "An error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Register</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        {/* Username */}
        <div>
          <label className="block mb-1">Username</label>
          <input
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Username must be at least 3 characters" },
              maxLength: { value: 150, message: "Username must be at most 150 characters" },
            })}
            className="border p-2 rounded w-full"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters long" },
            })}
            className="border p-2 rounded w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            className="border p-2 rounded w-full"
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
          )}
        </div>

         {/* Full Name */}
         <div>
          <label className="block mb-1">Full Name</label>
          <input
            {...register("full_name")}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block mb-1">Image URL</label>
          <input
            {...register("image_url")}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          type="submit"
        >
          Register
        </button>
      </form>

      {/* Show server error or success messages */}
      {serverError && <div className="text-red-500 mt-4">{serverError}</div>}
      {serverSuccess && <div className="text-green-500 mt-4">{serverSuccess}</div>}
    </div>
  );
}
