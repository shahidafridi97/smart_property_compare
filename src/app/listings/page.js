"use client";
import { useEffect } from "react";
import DataImporter from "@/components/DataImporter";
import { Icon } from "@/components/icons";
import PropertyGrid from "@/components/PropertyListing/PropertyGrid";
import { useMemo, useState } from "react";

export default function ListingPage() {

  const defaultData = [
  {
    id: 1,
    title: "1 Bedroom Flat to Rent",
    location: "Mint Drive, Birmingham",
    price: "£950",
    beds: 1,
    bathroom: 1,
    type: "Flat",
    tenure: "Leasehold",
    council_tax: "Band A",
    area: "452 sqft",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  },
  {
    id: 2,
    title: "2 Bedroom Apartment",
    location: "Manchester City Centre",
    price: "£1,350",
    beds: 2,
    bathroom: 2,
    type: "Apartment",
    tenure: "Leasehold",
    council_tax: "Band B",
    area: "710 sqft",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  },
  {
    id: 3,
    title: "3 Bedroom Semi-Detached House",
    location: "Croydon, London",
    price: "£2,200",
    beds: 3,
    bathroom: 2,
    type: "Semi-Detached",
    tenure: "Freehold",
    council_tax: "Band D",
    area: "1,120 sqft",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    id: 4,
    title: "Studio Flat",
    location: "Camden, London",
    price: "£1,100",
    beds: 0,
    bathroom: 1,
    type: "Studio",
    tenure: "Leasehold",
    council_tax: "Band B",
    area: "350 sqft",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  },
  {
    id: 5,
    title: "4 Bedroom Detached House",
    location: "Leeds, West Yorkshire",
    price: "£2,800",
    beds: 4,
    bathroom: 3,
    type: "Detached",
    tenure: "Freehold",
    council_tax: "Band E",
    area: "1,850 sqft",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  },
  {
    id: 6,
    title: "2 Bedroom Terraced House",
    location: "Liverpool",
    price: "£1,050",
    beds: 2,
    bathroom: 1,
    type: "Terraced",
    tenure: "Freehold",
    council_tax: "Band A",
    area: "820 sqft",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  },
  {
    id: 7,
    title: "Luxury 3 Bedroom Penthouse",
    location: "Canary Wharf, London",
    price: "£4,500",
    beds: 3,
    bathroom: 3,
    type: "Penthouse",
    tenure: "Leasehold",
    council_tax: "Band G",
    area: "1,600 sqft",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    id: 8,
    title: "1 Bedroom Cottage",
    location: "Oxford",
    price: "£1,200",
    beds: 1,
    bathroom: 1,
    type: "Cottage",
    tenure: "Freehold",
    council_tax: "Band C",
    area: "600 sqft",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
  },
  {
    id: 9,
    title: "5 Bedroom Villa",
    location: "Richmond, London",
    price: "£6,500",
    beds: 5,
    bathroom: 4,
    type: "Villa",
    tenure: "Freehold",
    council_tax: "Band H",
    area: "2,500 sqft",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  },
  {
    id: 10,
    title: "2 Bedroom Flat",
    location: "Bristol",
    price: "£1,250",
    beds: 2,
    bathroom: 1,
    type: "Flat",
    tenure: "Leasehold",
    council_tax: "Band B",
    area: "680 sqft",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  },
];

  const [properties, setProperties] = useState(defaultData);
  const [openModal, setOpenModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const [draftFilters, setDraftFilters] = useState({});
  const [filters, setFilters] = useState({});
useEffect(() => {
  const stored = localStorage.getItem("propertiesData");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      if (parsed?.data?.length) {
        setProperties(parsed.data);
        return;
      }
    } catch {}
  }

  // ✅ IF NO DATA → STORE DEFAULT DATA (IMPORTANT FIX)
  const normalized = defaultData.map((item, i) =>
    normalizeProperty(item, i)
  );

  setProperties(normalized);

  localStorage.setItem(
    "propertiesData",
    JSON.stringify({
      source: "default",
      data: normalized,
    })
  );
}, []);
  /* =========================================
     🔥 FLATTEN (ROBUST)
  ========================================= */

  const flattenObject = (obj, prefix = "", res = {}) => {
    if (!obj) return res;

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === "object" && item !== null) {
            flattenObject(item, `${newKey}.${i}`, res);
          } else {
            res[`${newKey}.${i}`] = item;
          }
        });
      } else if (typeof value === "object" && value !== null) {
        flattenObject(value, newKey, res);
      } else {
        res[newKey] = value;
      }
    });

    return res;
  };

  /* =========================================
     🔥 UNIVERSAL PICK
  ========================================= */

  const pick = (obj, keys) => {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
        return obj[key];
      }
    }
    return null;
  };

  /* =========================================
     🔥 UNIVERSAL NORMALIZE
  ========================================= */

  const normalizeProperty = (item, index) => {
    const flat = flattenObject(item);

    const values = Object.values(flat);

    const title =
      pick(item, ["title", "name", "display_address", "property_name"]) ||
      values.find(v => typeof v === "string" && v.length > 10);

    const location =
      pick(item, ["location", "area", "address", "display_address"]) ||
      values.find(v => typeof v === "string" && v.length > 15);

    const beds =
      pick(item, ["beds", "bedroom", "bedrooms"]) ??
      values.find(v => String(v).match(/^\d$/) && v <= 10);

    const bathroom =
      pick(item, ["bathroom", "bath", "bathrooms"]) ??
      "-";

    const type =
      pick(item, ["type", "property_type", "category"]) ||
      "-";

    const image =
      pick(item, ["image", "thumbnail", "img"]) ||
      values.find(v => typeof v === "string" && v.includes("http")) ||
      "/no-image.jpg";

    const priceRaw =
      pick(item, ["price", "price_value", "amount", "rent", "price_pcm"]);

    let price = "N/A";
    if (priceRaw) {
      const numeric = String(priceRaw).replace(/[^0-9.]/g, "");
      if (numeric) price = `£${Number(numeric).toLocaleString()}`;
    }

    return {
      id: item.id || item._id || item.objectID || index,
      title: title || "Property",
      location: typeof location === "object" ? JSON.stringify(location) : location || "UK",
      price,
      beds: beds ?? "-",
      bathroom,
      type,
      image,
      raw: item,
    };
  };

  /* =========================================
     🔥 ARRAY EXTRACTOR (STRONG)
  ========================================= */

  const extractArray = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    const queue = [data];

    while (queue.length) {
      const current = queue.shift();

      if (Array.isArray(current) && current.length) return current;

      if (typeof current === "object") {
        Object.values(current).forEach(v => queue.push(v));
      }
    }

    return [];
  };

 const handleApiResponse = (data, source = "api") => {
  const list = extractArray(data);
  const normalized = list.map((item, i) => normalizeProperty(item, i));

  setProperties(normalized);

  /* 🔥 STORE IN LOCALSTORAGE */
  localStorage.setItem(
    "propertiesData",
    JSON.stringify({
      source,
      data: normalized,
    })
  );
};

  /* =========================================
     🔥 FILTER ENGINE (FIXED CLEAN)
  ========================================= */

 /* =========================================
   🔥 FILTER ENGINE (FINAL CLEAN)
========================================= */

/* =========================================
   🔥 FILTER ENGINE (FINAL CLEAN)
========================================= */

const dynamicAttributes = useMemo(() => {
  const map = {};

  const ignoreKeys = [
    "id",
    "image",
    "title",
    "price",
    "location",
    "raw",
    "address",
    "address1",
    "address2",
    "address3",
    "address4",
  ];

  const normalizeKey = (key) => {
    const k = key.toLowerCase();

    if (k.includes("bed")) return "beds";
    if (k.includes("bath")) return "bath";
    if (k.includes("type") || k.includes("property")) return "type";

    return key.split(".").pop();
  };

  const isValid = (val) => {
    if (val === null || val === undefined) return false;
    if (val === "") return false;
    if (val === "-") return false;
    if (val === "0") return false;
    if (val === 0) return false;

    if (typeof val === "boolean") return false;

    if (typeof val === "string") {
      if (val.length > 40) return false;
      if (val.includes("{") || val.includes("}")) return false;
      if (val.includes("http")) return false;
    }

    return true;
  };

  properties.forEach((item) => {
    const flat = flattenObject(item.raw || {});

    Object.entries(flat).forEach(([key, val]) => {
      if (!isValid(val)) return;

      const clean = normalizeKey(key);

      if (ignoreKeys.includes(clean)) return;

      if (!map[clean]) map[clean] = new Set();

      map[clean].add(val);
    });
  });

  const result = {};

  Object.entries(map).forEach(([k, set]) => {
    const values = [...set];

    /* ✅ remove single useless filters */
    if (values.length > 1 && values.length <= 8) {
      result[k] = values;
    }
  });

  return result;
}, [properties]);

  /* =========================================
     🔥 PRICE FILTER
  ========================================= */

  const getNumericPrice = (price) =>
    Number(String(price).replace(/[^0-9]/g, ""));

  const priceOptions = useMemo(() => {
    return [...new Set(properties.map((p) => getNumericPrice(p.price)))].sort(
      (a, b) => a - b
    );
  }, [properties]);

  /* =========================================
     🔥 APPLY FILTER
  ========================================= */

  const applyFilters = () => setFilters(draftFilters);

  const resetFilters = () => {
    setDraftFilters({});
    setFilters({});
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const flat = flattenObject(item.raw || {});
      const price = getNumericPrice(item.price);

      return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;

        if (key === "minPrice") return price >= Number(val);
        if (key === "maxPrice") return price <= Number(val);

        return Object.values(flat).some(v => String(v) === String(val));
      });
    });
  }, [properties, filters]);

  /* =========================================
     🔥 UI (UNCHANGED)
  ========================================= */

  return (
    <div className="min-h-screen container-padding py-12 space-y-10">

      <div className="space-y-5">

  {/* 🔥 TOP BAR */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

    {/* LEFT → TITLE + META */}
    <div className="space-y-1">
      <h1 className="text-3xl md:text-4xl font-secondary text-brand-dark tracking-tight">
        Explore Property Intelligence
      </h1>
{typeof window !== "undefined" &&
  localStorage.getItem("propertiesData") &&
  JSON.parse(localStorage.getItem("propertiesData"))?.source === "default" && (
    <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full inline-block">
      Showing mock data — import real data
    </div>
)}
      <p className="text-sm text-gray-500">
        {filteredProperties.length} properties analysed • real-time data insights
      </p>
    </div>

    {/* RIGHT → ACTION BUTTONS */}
    <div className="flex items-center gap-3">

      <button
        onClick={() => setOpenModal(true)}
        className="px-5 py-2.5 rounded-xl 
        bg-brand-dark text-white text-sm font-medium
        shadow-[0_8px_20px_rgba(0,0,0,0.12)]
        hover:scale-[1.02] active:scale-[0.97]
        transition-all duration-200"
      >
        Import Data
      </button>

      <button
        onClick={() => setOpenFilter(true)}
        className="px-5 py-2.5 rounded-xl 
        border border-gray-300 text-gray-700 text-sm font-medium
        hover:bg-gray-50
        transition-all duration-200"
      >
        Filter & Refine
      </button>

    </div>

  </div>

  {/* 🔥 SMART INFO STRIP */}
  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">

    <span className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
      AI-driven comparison
    </span>

    <span className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
      Cleaned & normalized data
    </span>

    <span className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
      Dynamic attribute filtering
    </span>

  </div>

</div>
{openFilter && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpenFilter(false)}
    />

    <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={() => setOpenFilter(false)}>✕</button>
      </div>

      {/* BODY */}
      <div className="overflow-y-auto px-6 py-5">

        <div className="grid grid-cols-2 gap-6">

          {Object.keys(dynamicAttributes).map((attr) => {

            const iconMap = {
              beds: "bed",
              bath: "bath",
              type: "home",
              status: "status",
            };

            return (
              <div key={attr}>

                {/* TITLE + ICON */}
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                  <Icon name={iconMap[attr] || "tag"} size={16} />
                  <span className="capitalize">
                    {attr.replace(/_/g, " ")}
                  </span>
                </div>

                {/* OPTIONS */}
                <div className="flex flex-wrap gap-2">
                  {dynamicAttributes[attr].map((val) => (
                    <button
                      key={val}
                      onClick={() =>
                        setDraftFilters({
                          ...draftFilters,
                          [attr]: draftFilters[attr] === val ? "" : val,
                        })
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition
                      ${
                        draftFilters[attr] === val
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* FOOTER */}
      <div className="flex gap-3 p-4 border-t">
        <button
          onClick={() => {
            applyFilters();
            setOpenFilter(false);
          }}
          className="flex-1 bg-black text-white py-2.5 rounded-lg"
        >
          Apply
        </button>

        <button
          onClick={resetFilters}
          className="flex-1 border py-2.5 rounded-lg"
        >
          Reset
        </button>
      </div>

    </div>
  </div>
)}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenModal(false)} />
          <div className="relative bg-white p-6 rounded-xl w-[600px]">
            <DataImporter setProperties={handleApiResponse} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProperties.map((item) => (
          <PropertyGrid key={item.id} item={item} />
        ))}
      </div>

    </div>
  );
}