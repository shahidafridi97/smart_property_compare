"use client";

import Image from "next/image";

export default function LeftRight({ title, description, image, reverse }) {
  return (
    <section className="w-full container-padding py-16">

      <div
        className={`flex flex-col md:flex-row items-center gap-10 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >

        {/* 🔥 IMAGE */}
        <div className="w-full md:w-1/2 relative h-[260px] md:h-[400px] rounded-xl overflow-hidden">

          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />

        </div>

        {/* 🔥 CONTENT */}
        <div className="w-full md:w-1/2 space-y-4">

          <h2 className="text-2xl md:text-3xl font-secondary text-brand-dark">
            {title}
          </h2>

          <p className="text-sm md:text-base font-primary text-brand-muted leading-relaxed">
            {description}
          </p>

        </div>

      </div>

    </section>
  );
}