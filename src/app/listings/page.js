"use client";

import { useEffect, useState } from "react";

export default function ListingPage() {
  const [properties, setProperties] = useState([]);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("file");
const [apiMethod, setApiMethod] = useState("GET");
const [bearerToken, setBearerToken] = useState("");
const [payload, setPayload] = useState("");
  /* 🔥 UK REAL ESTATE MOCK DATA */
  const mockData = [
    {
      id: 1,
      title: "3 Bedroom Detached House",
      location: "Croydon, London",
      price: "£725,000",
      status: "For Sale",
      beds: 3,
      type: "Detached",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    },
    {
      id: 2,
      title: "2 Bedroom Apartment",
      location: "Manchester City Centre",
      price: "£320,000",
      status: "Under Offer",
      beds: 2,
      type: "Apartment",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    },
    {
      id: 3,
      title: "4 Bedroom Family Home",
      location: "Birmingham",
      price: "£540,000",
      status: "For Sale",
      beds: 4,
      type: "Semi-Detached",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    },
  ];

  useEffect(() => {
    setProperties(mockData);
  }, []);

  /* 🔥 UNIVERSAL NORMALIZER (FIXED) */
  const normalizeData = (data) => {
    if (!data) return [];

    // 1️⃣ Direct array
    if (Array.isArray(data)) return data;

    // 2️⃣ Common keys (important for your case)
    const keys = ["hits", "data", "properties", "results", "items", "list"];

    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    // 3️⃣ Deep search (handles ANY API structure)
    const findArray = (obj) => {
      if (!obj || typeof obj !== "object") return null;

      for (const key in obj) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          return obj[key];
        }

        if (typeof obj[key] === "object") {
          const result = findArray(obj[key]);
          if (result) return result;
        }
      }

      return null;
    };

    const deep = findArray(data);
    if (deep) return deep;

    return [];
  };

  /* 🔥 SAFE MAPPER (VERY IMPORTANT) */
  const mapProperties = (list) => {
    return list.map((item, index) => ({
      id: item.id || item.objectID || index,
      title:
        item.title ||
        item.display_address ||
        item.name ||
        "Property",
      location:
        item.location ||
        item.area ||
        item.address?.address2 ||
        "UK",
      price:
        item.price
          ? `£${Number(item.price).toLocaleString()}`
          : item.price || "N/A",
      status: item.status || "Available",
      beds: item.bedroom || item.beds || "-",
      type:
        item.type ||
        item.building?.[0] ||
        item.property_type ||
        "-",
      image:
        item.image ||
        item.thumbnail ||
        item.images?.[0]?.["526x360"] ||
        item.images?.[0]?.["451x320"] ||
        "https://via.placeholder.com/400",
    }));
  };

  /* 🔥 FILE UPLOAD */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const normalized = normalizeData(parsed);

        if (!normalized.length) {
          alert("No valid property data found");
          return;
        }

        setProperties(mapProperties(normalized));
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  };

  /* 🔥 PASTE JSON */
  const handlePaste = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const normalized = normalizeData(parsed);

      if (!normalized.length) {
        alert("No valid property data found");
        return;
      }

      setProperties(mapProperties(normalized));
    } catch {
      alert("Invalid JSON input");
    }
  };

  /* 🔥 FETCH FROM URL */
  const handleFetch = async () => {
  try {
    setLoading(true);

    const options = {
      method: apiMethod,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // 🔥 ADD BEARER TOKEN
    if (bearerToken) {
      options.headers["Authorization"] = `Bearer ${bearerToken}`;
    }

    // 🔥 ADD BODY FOR POST
    if (apiMethod === "POST" && payload) {
      try {
        options.body = JSON.stringify(JSON.parse(payload));
      } catch {
        alert("Invalid JSON payload");
        setLoading(false);
        return;
      }
    }

    const res = await fetch(jsonInput, options);
    const data = await res.json();

    const normalized = normalizeData(data);

    if (!normalized.length) {
      alert("No valid property data found");
      return;
    }

    setProperties(mapProperties(normalized));
  } catch (err) {
    console.error(err);
    alert("Invalid API / Network error");
  } finally {
    setLoading(false);
  }
};
console.log("properties",properties);
  return (
    <div className="min-h-screen container-padding py-12 space-y-14">

      {/* 🔥 HERO HEADER */}
      <div className="max-w-3xl space-y-4 animate-fadeUp">
        <h1 className="text-3xl md:text-5xl font-secondary text-brand-dark leading-tight">
          Discover, Compare & Analyse UK Properties
        </h1>
        <p className="text-brand-muted text-sm md:text-lg font-primary leading-relaxed">
          Import your property datasets, explore listings visually, compare
          prices, and generate powerful insights to make smarter investment decisions.
        </p>
      </div>

      {/* 🔥 DATA SOURCE CARD */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">

        <h2 className="text-xl font-secondary text-brand-dark">
          Import Your Property Data
        </h2>

        {/* 🔥 TABS */}
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "file", label: "Upload JSON File" },
            { key: "json", label: "Paste Raw JSON" },
            { key: "url", label: "Fetch via API URL" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-primarymedium transition-all duration-300
              ${
                mode === tab.key
                  ? "bg-brand-dark text-white shadow"
                  : "border border-brand-border text-brand-muted hover:bg-brand-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🔥 FILE */}
        {mode === "file" && (
          <div className="space-y-3 animate-fadeUp">
            <p className="text-sm text-brand-muted">
              Upload a JSON file containing property listings.
            </p>

            <input
              type="file"
              accept="application/json"
              onChange={handleFileUpload}
              className="w-full border border-brand-border rounded-md p-3"
            />
          </div>
        )}

        {/* 🔥 JSON */}
        {mode === "json" && (
          <div className="space-y-4 animate-fadeUp">

            <p className="text-sm text-brand-muted">
              Example format:
            </p>

            <div className="bg-brand-light text-xs p-3 rounded-md overflow-auto">
{`{
  "hits": [
    {
      "title": "2 Bedroom Flat",
      "price": 450000,
      "area": "London",
      "status": "For Sale"
    }
  ]
}`}
            </div>

            <textarea
              placeholder="Paste your JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-40 border border-brand-border rounded-md p-3 text-sm"
            />

            <button
              onClick={handlePaste}
              className="px-5 py-2 bg-brand-dark text-white rounded-md hover:scale-[1.03] transition"
            >
              Parse JSON
            </button>

          </div>
        )}

        {/* 🔥 URL */}
      {mode === "url" && (
  <div className="space-y-4 animate-fadeUp">

    <p className="text-sm text-brand-muted">
      Fetch property data via API
    </p>

    {/* 🔥 METHOD */}
    <div className="flex gap-3">
      <select
        value={apiMethod}
        onChange={(e) => setApiMethod(e.target.value)}
        className="border border-brand-border rounded-md px-3 py-2 text-sm"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>

      <input
        type="text"
        placeholder="Bearer Token (optional)"
        value={bearerToken}
        onChange={(e) => setBearerToken(e.target.value)}
        className="flex-1 border border-brand-border rounded-md px-3 py-2 text-sm"
      />
    </div>

    {/* 🔥 URL */}
    <input
      type="text"
      placeholder="https://api.example.com/properties"
      value={jsonInput}
      onChange={(e) => setJsonInput(e.target.value)}
      className="w-full border border-brand-border rounded-md p-3 text-sm"
    />

    {/* 🔥 PAYLOAD (ONLY POST) */}
    {apiMethod === "POST" && (
      <textarea
        placeholder={`{
  "location": "London",
  "min_price": 300000
}`}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="w-full h-32 border border-brand-border rounded-md p-3 text-sm"
      />
    )}

    {/* 🔥 BUTTON */}
    <button
      onClick={handleFetch}
      className="px-5 py-2 bg-brand-dark text-white rounded-md hover:scale-[1.03] transition"
    >
      {loading ? "Fetching..." : "Fetch Data"}
    </button>

  </div>
)}

      </div>

      {/* 🔥 GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {properties.map((item) => (
          <div
            key={item.id}
            className="border border-brand-border rounded-xl overflow-hidden bg-white"
          >

            <div className="h-48 bg-gray-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-2">

              <h3 className="text-lg font-secondary text-brand-dark">
                {item.title}
              </h3>

              <p className="text-sm text-brand-muted">
                {item.location}
              </p>

              <p className="text-sm font-primarymedium">
                {item.price}
              </p>

              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                {item.status}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}