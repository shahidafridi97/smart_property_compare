"use client";

export default function Banner() {
  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] flex items-center overflow-hidden">

      {/* 🔥 BACKGROUND IMAGE */}
      <img
        src="https://ik.imagekit.io/efvdt4rto0b/stylized-blue-white-houses-arranged-row-blue-gradient-background_276930-6237_QU5aD1kAH.jpg"
        alt="Property Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🔥 OVERLAY (gradient for left readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-transparent"></div>

      {/* 🔥 CONTENT */}
      <div className="relative container-padding z-10 w-full">

        <div className="max-w-xl text-white space-y-6">

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-secondary leading-tight">
            Compare Properties.
            <br />
            Make Smarter Decisions.
          </h1>

          <p className="text-sm md:text-lg text-white/80 font-primary">
            Upload or paste your property data and instantly analyze,
            compare, and generate insights with ease.
          </p>

          {/* 🔥 CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">

            <button className="px-6 py-3 cursor-pointer bg-white text-black rounded-md font-primarymedium hover:scale-[1.03] transition">
              Upload JSON
            </button>

            <button className="px-6 cursor-pointer py-3 border border-white/60 rounded-md font-primarymedium hover:bg-white/10 transition">
              Try Demo
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}