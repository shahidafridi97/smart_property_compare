import Banner from "@/components/Banner/Banner";
// import FeatureBlock from "@/components/Home/FeatureBlock";
import LeftRight from "@/components/TileImages/LeftRight";
import { redirect } from "next/navigation";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const isLoggedIn = params?.auth === "true";

  if (!isLoggedIn) {
    redirect("/login");
  }

  /* 🔥 DATA FROM HOME ONLY */
const features = [
  {
    title: "From Raw Data to Clear Property Insights",
    description:
      "Stop dealing with messy JSON. Instantly convert raw datasets into clean, structured property listings you can actually use.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  },
  {
    title: "See Every Property Difference Instantly",
    description:
      "Compare pricing, features, and value side-by-side without confusion. Make faster, smarter decisions with clarity.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    title: "Make Confident Property Decisions",
    description:
      "Get actionable insights — not just data. Understand trends, patterns, and opportunities before you commit.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c",
  },
];
  return (
    <div className="min-h-screen flex flex-col text-black">

      {/* 🔥 HERO */}
      <Banner />

      {/* 🔥 FEATURES */}
      {features.map((item, index) => (
        <LeftRight
          key={index}
          title={item.title}
          description={item.description}
          image={item.image}
          reverse={index % 2 !== 0}
        />
      ))}

    </div>
  );
}