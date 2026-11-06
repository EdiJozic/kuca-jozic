const propertyId = "CCC667";
const datePattern = /^\d{8}$/;

const toIsoDate = (date) =>
  `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

const isValidDate = (value) => {
  if (!datePattern.test(value)) return false;
  const date = new Date(Date.UTC(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8)),
  ));
  return date.toISOString().slice(0, 10) === toIsoDate(value);
};

const mergeRanges = (ranges) => {
  const sorted = ranges
    .map(({ from, to }) => ({ from: toIsoDate(from), to: toIsoDate(to) }))
    .sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
  const merged = [];

  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range.from <= last.to) {
      if (range.to > last.to) last.to = range.to;
    } else {
      merged.push(range);
    }
  }

  return merged;
};

export const handler = async () => {
  try {
    const upstream = await fetch(
      `https://www.novasol.hr/novasol/getAvailability?propertyId=${propertyId}&from=&to=`,
      { headers: { Accept: "application/json" } },
    );

    if (!upstream.ok) {
      throw new Error(`NOVASOL availability returned HTTP ${upstream.status}`);
    }

    const payload = await upstream.json();
    if (!Array.isArray(payload?.datesRanges)) {
      throw new Error("NOVASOL availability response has an unexpected format");
    }

    const hasValidRanges = payload.datesRanges.every(
      (range) =>
        range &&
        typeof range.from === "string" &&
        typeof range.to === "string" &&
        isValidDate(range.from) &&
        isValidDate(range.to) &&
        range.from <= range.to,
    );

    if (!hasValidRanges) {
      throw new Error("NOVASOL availability response contains invalid date ranges");
    }

    return {
      statusCode: 200,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ availableRanges: mergeRanges(payload.datesRanges) }),
    };
  } catch (error) {
    console.error("Failed to load NOVASOL availability:", error);
    return {
      statusCode: 502,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ error: "Could not load NOVASOL availability" }),
    };
  }
};
