"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateUser } from "@/features/auth/auth";

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleLogin = () => {
    if (validateUser(form.username, form.password)) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/?auth=true");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
<div className="fixed inset-0 w-screen h-screen overflow-y-auto overflow-x-hidden text-white">
      {/* 🔥 FULL SCREEN GRADIENT */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(120deg,#0B311D,#0E3B23,#061A10)] bg-[length:200%_200%] animate-gradientSmooth" />

      {/* 🔥 SMOOTH GRID ANIMATION */}
      <div className="fixed inset-0 z-0 opacity-[0.05] 
        bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] 
        bg-[size:40px_40px] animate-gridFlow" />

      {/* 🔥 FLOATING LIGHTS */}
      <div className="fixed w-[600px] h-[600px] bg-green-400/20 blur-3xl rounded-full top-[-200px] left-[-200px] animate-floatUltra"></div>
      <div className="fixed w-[500px] h-[500px] bg-emerald-300/10 blur-3xl rounded-full bottom-[-150px] right-[-150px] animate-floatUltra2"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col lg:flex-row">

        {/* LEFT */}
        <div className="flex-1 flex items-center px-6 md:px-12 lg:px-24 py-12 lg:py-0">

          <div className="max-w-xl space-y-6 animate-fadeUp">

            <h1 className="text-3xl md:text-5xl font-secondary leading-tight">
              Smart Property Intelligence
            </h1>

            <p className="text-white/70 text-sm md:text-lg font-primary leading-relaxed">
              Transform raw property data into actionable insights.
              Upload JSON datasets, compare results, and make better decisions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {[
                ["Analysis", "Evaluation"],
                ["Comparison", "Side-by-Side"],
                ["Input", "JSON Upload"],
                ["Output", "Insights"],
              ].map(([label, title], i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition"
                >
                  <p className="text-xs text-white/60">{label}</p>
                  <h3 className="text-sm md:text-base font-primarybold">
                    {title}
                  </h3>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 lg:py-0">

          <div className="w-full max-w-md md:max-w-lg animate-fadeUp">

            {/* HEADLINE */}
            <div className="mb-10 md:mb-14 space-y-3">
              <h2 className="text-2xl md:text-4xl font-secondary leading-tight">
                Start your analysis
              </h2>

              <p className="text-white/60 text-sm md:text-base">
                Access your workspace and begin comparing your property datasets.
              </p>
            </div>

            {/* INPUT FLOW */}
            <div className="space-y-8 md:space-y-10">

              {/* USERNAME */}
              <div className="group relative">
                <p className="text-white/60 text-xs mb-2">Workspace ID</p>

                <input
                  type="text"
                  placeholder="your workspace / username"
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-white/60"
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />

                <div className="h-[1px] bg-white/10 mt-2"></div>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-green-400 transition-all duration-500 group-focus-within:w-full"></div>
              </div>

              {/* PASSWORD */}
              <div className="group relative">
                <p className="text-white/60 text-xs mb-2">Secure Key</p>

                <input
                  type="password"
                  placeholder="enter secure key"
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-white/60"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <div className="h-[1px] bg-white/10 mt-2"></div>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-green-400 transition-all duration-500 group-focus-within:w-full"></div>
              </div>

            </div>

            {error && (
              <p className="text-red-400 text-sm mt-6">{error}</p>
            )}

            {/* ACTION ROW */}
            <div className="mt-12 md:mt-16 flex flex-col md:flex-row gap-4 md:gap-0 md:items-center md:justify-between">

              <div className="text-xs text-white/40 font-primary">
                Property insights • Comparison • Real-time analysis
              </div>

              <button
                onClick={handleLogin}
                className="w-full md:w-auto relative px-8 py-3 rounded-xl cursor-pointer
                bg-white/5 backdrop-blur-md border border-white/10
                text-white font-primarybold tracking-wide
                transition-all duration-300
                hover:bg-white/10 hover:border-white/20
                shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
                active:scale-[0.97] overflow-hidden group"
              >
                <span className="relative z-10">Enter</span>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
                  bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]"/>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}