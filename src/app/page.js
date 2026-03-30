import { redirect } from "next/navigation";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const isLoggedIn = params?.auth === "true";

  if (!isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-secondarymedium">
          AI Property Compare
        </h1>

        <a
          href="/login"
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </a>
      </div>

      <div className="p-6">
        <h2 className="text-3xl font-secondarybold mb-6">
          Welcome 👋
        </h2>
      </div>

    </div>
  );
}