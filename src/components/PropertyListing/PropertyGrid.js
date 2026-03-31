import { Icon } from "../icons";

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

/* 🔥 LOCATION FIX (FINAL) */
const parseLocation = (loc, flat) => {
  if (!loc) return pick(flat, ["address", "location", "area"]) || "UK";

  if (typeof loc === "string" && !loc.includes("{")) {
    return loc;
  }

  if (typeof loc === "string" && loc.includes("{")) {
    try {
      const parsed = JSON.parse(loc);
      return (
        parsed.inline ||
        parsed.address ||
        parsed.display_address ||
        parsed.address1 ||
        parsed.address2 ||
        parsed.address3 ||
        parsed.address4 ||
        "UK"
      );
    } catch {
      return "UK";
    }
  }

  if (typeof loc === "object") {
    return (
      loc.inline ||
      loc.address ||
      loc.display_address ||
      loc.address1 ||
      loc.address2 ||
      loc.address3 ||
      loc.address4 ||
      "UK"
    );
  }

  return "UK";
};

export default function PropertyGrid({ item }) {

  const flat = flattenObject(item.raw || {});

  /* MAIN ATTRIBUTES */

  const beds =
    item.beds ??
    pick(flat, ["bed"]) ??
    "-";

  const bath =
    item.bathroom ??
    item.bath ??
    pick(flat, ["bath"]) ??
    "-";

  const type =
    item.type ??
    pick(flat, ["type", "property"]) ??
    "-";

  const location = parseLocation(item.location, flat);

  /* EXTRA ATTRIBUTES */

  const ignore = [
    "id",
    "image",
    "title",
    "price",
    "location",
    "raw",
    "beds",
    "bedroom",
    "bathroom",
    "bath",
    "type",
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
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition duration-300">

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

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {item.title}
        </h3>

        {/* LOCATION */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon name="location" size={16} />
          {location}
        </div>

        {/* MAIN ATTRIBUTES */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-800">

          <div className="flex items-center gap-2">
            <Icon name="bed" size={16} />
            <span>{beds}</span>
          </div>

          <div className="flex items-center gap-2">
            <Icon name="bath" size={16} />
            <span>{bath}</span>
          </div>

          <div className="text-gray-600 text-right">
            {type}
          </div>

        </div>

        {/* EXTRA ATTRIBUTES */}
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
        <div className="flex items-center justify-between pt-3 border-t">

          <button className="flex items-center gap-2 text-sm font-medium text-black hover:opacity-70">
            View Details
            <Icon name="arrow" size={16} />
          </button>

          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black">
            <Icon name="compare" size={16} />
            Compare
          </button>

        </div>

      </div>
    </div>
  );
}

/* HELPERS */
const formatLabel = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const formatValue = (val) => {
  if (Array.isArray(val)) return val.join(", ");
  return val;
};