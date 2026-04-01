import { Icon } from "../icons";
import { useEffect, useState } from "react";

/* FLATTEN */
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

/* SMART PICK */
const pick = (flat, keywords) => {
  for (const [key, val] of Object.entries(flat)) {
    const k = key.toLowerCase();

    if (keywords.some(word => k.includes(word))) {
      if (val !== null && val !== undefined && val !== "") {
        return val;
      }
    }
  }
  return null;
};

/* UNIQUE ID */
const getUniqueId = (item) => {
  return (
    item?.crm_id ||
    item?.property_id ||
    item?.id ||
    item?.objectID ||
    item?.raw?.crm_id ||
    item?.raw?.id
  );
};

/* CLEAN VALUE */
const isValidValue = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "boolean") return false;

  if (typeof val === "string") {
    if (val.length > 60) return false;
    if (val.includes("{") || val.includes("}")) return false;
    if (val.includes("http")) return false;
  }

  return true;
};

/* LOCATION */
const parseLocation = (loc, flat) => {
  if (!loc) return pick(flat, ["address", "location", "area"]) || "UK";

  if (typeof loc === "string" && !loc.includes("{")) return loc;

  if (typeof loc === "string") {
    try {
      const parsed = JSON.parse(loc);
      return parsed.inline || parsed.address || "UK";
    } catch {
      return "UK";
    }
  }

  if (typeof loc === "object") {
    return loc.inline || loc.address || "UK";
  }

  return "UK";
};

export default function PropertyGrid({ item }) {
  const flat = flattenObject(item.raw || {});

  const MAX_COMPARE = 3;
const [compareCount, setCompareCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [showLimitMsg, setShowLimitMsg] = useState(false);

  /* MAIN */
  const beds = item.beds ?? pick(flat, ["bed"]) ?? "-";
  const bath = item.bathroom ?? item.bath ?? pick(flat, ["bath"]) ?? "-";
  const type = item.type ?? pick(flat, ["type", "property"]) ?? "-";
  const location = parseLocation(item.location, flat);

  /* SYNC STATE */
const syncCompareState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("compareList") || "[]");
    const uniqueId = getUniqueId(item);

    if (!uniqueId) return;

    setIsCompared(stored.includes(uniqueId));
    setIsLimitReached(stored.length >= MAX_COMPARE);

    /* 🔥 ADD THIS */
    setCompareCount(stored.length);

  } catch {
    setIsCompared(false);
    setIsLimitReached(false);
    setCompareCount(0);
  }
};

  useEffect(() => {
    syncCompareState();

    window.addEventListener("storage", syncCompareState);
    return () => window.removeEventListener("storage", syncCompareState);
  }, [item]);
const clearAllCompare = () => {
  localStorage.removeItem("compareList");

  syncCompareState();
  window.dispatchEvent(new Event("storage"));
};
  /* HANDLE COMPARE */
  const handleCompare = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("compareList") || "[]");
      const uniqueId = getUniqueId(item);

      if (!uniqueId) return;

      let updated = [];

      if (stored.includes(uniqueId)) {
        /* REMOVE */
        updated = stored.filter(id => id !== uniqueId);
      } else {
        if (stored.length >= MAX_COMPARE) {
          /* SHOW MESSAGE */
          setShowLimitMsg(true);
          setTimeout(() => setShowLimitMsg(false), 2000);
          return;
        }

        updated = [...stored, uniqueId];
      }

      localStorage.setItem("compareList", JSON.stringify(updated));

      syncCompareState();
      window.dispatchEvent(new Event("storage"));

    } catch (err) {
      console.error("Compare error", err);
    }
  };

  /* EXTRA ATTRIBUTES */
  const ignore = [
    "id","image","title","price","location","raw",
    "beds","bedroom","bathroom","bath","type"
  ];

  const cleanKey = (key) => key.split(".").pop();
  const isNumericKey = (key) => !isNaN(Number(key));

  const extraAttributes = Object.entries(flat)
    .filter(([key, val]) => {
      if (!isValidValue(val)) return false;

      const shortKey = cleanKey(key);

      if (isNumericKey(shortKey)) return false;
      if (ignore.includes(shortKey)) return false;

      if (key.toLowerCase().includes("image")) return false;
      if (key.toLowerCase().includes("url")) return false;
      if (key.toLowerCase().includes("description")) return false;

      return true;
    })
    .reduce((acc, [key, val]) => {
      const shortKey = cleanKey(key);
      if (!acc[shortKey]) acc[shortKey] = new Set();
      acc[shortKey].add(val);
      return acc;
    }, {});

  const finalAttributes = Object.entries(extraAttributes)
    .map(([k, set]) => [k, [...set]])
    .filter(([_, vals]) => vals.length >= 1 && vals.length <= 3)
    .slice(0, 4);

  return (
<div className="relative bg-white rounded-xl border border-gray-100 hover:shadow-lg transition duration-300">  
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden rounded-t-xl">
        <img
          src={item.image || "/no-image.jpg"}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-md text-sm font-semibold">
          {item.price}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-4">

        <h3 className="text-lg font-semibold text-gray-900">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon name="location" size={16} />
          {location}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-gray-800">

          <div className="flex items-center gap-2">
            <Icon name="bed" size={16} />
            {beds}
          </div>

          <div className="flex items-center gap-2">
            <Icon name="bath" size={16} />
            {bath}
          </div>

          <div className="text-right text-gray-600">
            {type}
          </div>

        </div>

        {finalAttributes.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 border-t pt-3">
            {finalAttributes.map(([key, vals]) => (
              <div key={key}>
                {formatLabel(key)}: {formatValue(vals)}
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between pt-3 border-t">

          <button className="flex items-center gap-2 text-sm font-medium text-black">
            View Details
            <Icon name="arrow" size={16} />
          </button>

          <button
            onClick={handleCompare}
            className={`flex items-center gap-2 text-sm transition
              ${
                isCompared
                  ? "text-red-500"
                  : isLimitReached
                  ? "text-gray-300"
                  : "text-gray-500 hover:text-black"
              }`}
          >
<Icon name={isCompared ? "trash" : "compare"} size={16} />            {isCompared
              ? ""
              : isLimitReached
              ? "Limit Reached (Max 4)"
              : "Compare"}
          </button>

        </div>
        {compareCount > 0 && (
    <div className="absolute bottom-1 right-3 z-20">
      <button
        onClick={clearAllCompare}
        className="px-3 py-1 text-xs rounded-md 
        bg-red-50 text-red-600 border border-red-200 
        hover:bg-red-100"
      >
        Clear ({compareCount})
      </button>
    </div>
  )}

        {/* MESSAGE */}
        {showLimitMsg && (
          <div className="text-xs text-red-500 mt-1">
            You can compare only {compareCount} properties at a time
          </div>
        )}

      </div>
    </div>
  );
}

/* HELPERS */
const formatLabel = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const formatValue = (val) =>
  Array.isArray(val) ? val.join(", ") : val;