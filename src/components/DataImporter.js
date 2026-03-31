"use client";

import { useState } from "react";

export default function DataImporter({ setProperties }) {
  const [jsonInput, setJsonInput] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("file");
  const [apiMethod, setApiMethod] = useState("GET");
  const [bearerToken, setBearerToken] = useState("");
  const [payload, setPayload] = useState("");

  /* 🔥 UNIVERSAL ARRAY EXTRACTOR */
  const normalizeData = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    const queue = [data];

    while (queue.length) {
      const current = queue.shift();

      if (Array.isArray(current) && current.length > 0) {
        return current;
      }

      if (typeof current === "object") {
        for (const key in current) {
          queue.push(current[key]);
        }
      }
    }

    return [];
  };

  /* 🔥 UNIVERSAL VALUE PICKER */
  const pick = (obj, keys) => {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
        return obj[key];
      }
    }
    return null;
  };

  /* 🔥 PRICE PARSER */
  const getPrice = (item) => {
    const value = pick(item, [
      "price",
      "price_value",
      "amount",
      "rent",
      "rent_pcm",
      "price_pcm",
      "display_price",
      "priceValue",
    ]);

    if (!value) return "N/A";

    const numeric = String(value).replace(/[^0-9.]/g, "");
    if (!numeric) return "N/A";

    return `£${Number(numeric).toLocaleString()}`;
  };

  /* 🔥 IMAGE RESOLVER (GGFX + ALL CASES) */
  const getImage = (item) => {
    // direct keys
    const direct = pick(item, [
      "image",
      "thumbnail",
      "img",
      "url",
      "src",
    ]);

    if (typeof direct === "string") return direct;

    // nested formats (strapi / ggfx / cdn)
    const tryFormats = (obj) => {
      if (!obj || typeof obj !== "object") return null;

      const keys = [
        "url",
        "src",
        "large",
        "medium",
        "small",
        "thumbnail",
        "formats",
      ];

      for (const key of keys) {
        if (typeof obj[key] === "string") return obj[key];
        if (typeof obj[key] === "object") {
          const deep = tryFormats(obj[key]);
          if (deep) return deep;
        }
      }

      return null;
    };

    // images array
    if (Array.isArray(item.images)) {
      for (const img of item.images) {
        const found = tryFormats(img);
        if (found) return found;
      }
    }

    // deep scan (GGFX or unknown)
    const queue = [item];

    while (queue.length) {
      const current = queue.shift();

      if (typeof current === "object") {
        for (const key in current) {
          const val = current[key];

          if (typeof val === "string" && val.includes("http")) {
            if (val.match(/\.(jpg|jpeg|png|webp)/i)) {
              return val;
            }
          }

          if (typeof val === "object") queue.push(val);
        }
      }
    }

    return "https://via.placeholder.com/400";
  };

  /* 🔥 GLOBAL ATTRIBUTE EXTRACTION */
  const mapProperties = (list) => {
    return list.map((item, index) => {
      const title = pick(item, [
        "title",
        "name",
        "display_address",
        "property_name",
        "heading",
      ]);

      const location = pick(item, [
        "location",
        "area",
        "city",
        "address",
        "display_address",
        "address_line",
      ]);

      const beds = pick(item, [
        "beds",
        "bedroom",
        "bedrooms",
        "no_of_bedrooms",
      ]);

      const bath = pick(item, [
        "bath",
        "bathroom",
        "bathrooms",
      ]);

      const type = pick(item, [
        "type",
        "property_type",
        "category",
      ]);

      const status = pick(item, [
        "status",
        "availability",
        "listing_status",
      ]);

      return {
        id: item.id || item._id || item.objectID || index,

        title: title || "Property",

        location:
          typeof location === "object"
            ? JSON.stringify(location)
            : location || "UK",

        price: getPrice(item),

        status: status || "Available",

        beds: beds ?? "-",

        bath: bath ?? "-",

        type:
          Array.isArray(type)
            ? type[0]
            : type || "-",

        image: getImage(item),

        raw: item, // 🔥 keep full raw data (important for future filters)
      };
    });
  };

  /* FILE */
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

   const mapped = mapProperties(normalized);

setProperties(mapped);

localStorage.setItem(
  "propertiesData",
  JSON.stringify({
    source: "file",
    data: mapped,
  })
);
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  };

  /* PASTE */
  const handlePaste = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const normalized = normalizeData(parsed);

      if (!normalized.length) {
        alert("No valid property data found");
        return;
      }

      const mapped = mapProperties(normalized);

setProperties(mapped);

localStorage.setItem(
  "propertiesData",
  JSON.stringify({
    source: "json",
    data: mapped,
  })
);
    } catch {
      alert("Invalid JSON input");
    }
  };

  /* FETCH */
  const handleFetch = async () => {
    try {
      setLoading(true);

      const options = {
        method: apiMethod,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (bearerToken) {
        options.headers["Authorization"] = `Bearer ${bearerToken}`;
      }

      if (apiMethod === "POST" && payload) {
        try {
          options.body = JSON.stringify(JSON.parse(payload));
        } catch {
          alert("Invalid JSON payload");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(apiUrl, options);
      const data = await res.json();

      const normalized = normalizeData(data);

      if (!normalized.length) {
        alert("No valid property data found");
        return;
      }

      const mapped = mapProperties(normalized);

setProperties(mapped);

localStorage.setItem(
  "propertiesData",
  JSON.stringify({
    source: "api",
    data: mapped,
  })
);
    } catch (err) {
      console.error(err);
      alert("Invalid API / Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">

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

      {mode === "url" && (
        <div className="space-y-4 animate-fadeUp">

          <p className="text-sm text-brand-muted">
            Fetch property data via API
          </p>

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

          <input
            type="text"
            placeholder="https://api.example.com/properties"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full border border-brand-border rounded-md p-3 text-sm"
          />

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

          <button
            onClick={handleFetch}
            className="px-5 py-2 bg-brand-dark text-white rounded-md hover:scale-[1.03] transition"
          >
            {loading ? "Fetching..." : "Fetch Data"}
          </button>

        </div>
      )}
    </div>
  );
}