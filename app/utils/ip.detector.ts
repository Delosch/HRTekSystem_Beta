import { Country } from "~/components/AuthCards";

export const getUserCountryFromIP = async (
  countryCodes: Country[]
): Promise<{ iso: string; dialCode: string } | null> => {
  try {
    // Cache in localStorage (24h)
    const CACHE_KEY = "user_ip_location_cache";
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

    if (typeof window === "undefined") return null;

    // ✅ Step 1: Check cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // ✅ Step 2: IP detection services
    const services = [
      "https://www.cloudflare.com/cdn-cgi/trace", // Cloudflare
      "https://ipapi.co/json/",
      "https://ipinfo.io/json",
      "https://api.ipify.org?format=json",
    ];

    for (const service of services) {
      try {
        console.log("service using \t",service)
        const response = await fetch(service);
        if (!response.ok) continue;

        let detectedCountryCode = "";

        if (service.includes("cloudflare.com")) {
          // Cloudflare trace returns text, not JSON
          const text = await response.text();
          const countryLine = text
            .split("\n")
            .find((line) => line.startsWith("loc="));
          if (countryLine) {
            detectedCountryCode = countryLine.split("=")[1].toUpperCase();
          }
        } else {
          // JSON-based services
          const data = await response.json();
          if (data.country_code) {
            detectedCountryCode = data.country_code.toUpperCase();
          } else if (data.country) {
            detectedCountryCode = data.country.toUpperCase();
          }
        }

        if (detectedCountryCode) {
          const country = countryCodes.find(
            (c) => c.iso2 === detectedCountryCode
          );
          if (country) {
            const result = {
              iso: detectedCountryCode,
              dialCode: country.code,
            };

            // ✅ Cache the result
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: result, timestamp: Date.now() })
            );

            return result;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${service}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.warn("IP geolocation failed:", error);
  }

  return null;
};