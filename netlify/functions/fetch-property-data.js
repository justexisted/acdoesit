export async function handler(event) {
  try {
    const { address } = JSON.parse(event.body || '{}');
    if (!address) return respond(400, { error: 'Address required' });

    // 1) Geocode via OpenStreetMap Nominatim (free)
    const userAgent = 'acdoesit.ai-prompt-builder/1.0 (contact: site owner)';
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`;
    const geoResp = await fetch(geoUrl, { headers: { 'User-Agent': userAgent, 'Accept-Language': 'en' } });
    if (!geoResp.ok) return respond(502, { error: 'Geocoding failed' });
    const geo = await geoResp.json();
    if (!Array.isArray(geo) || geo.length === 0) return respond(404, { error: 'Address not found' });

    const g = geo[0];
    const lat = parseFloat(g.lat);
    const lon = parseFloat(g.lon);
    const addr = g.address || {};
    const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district || addr.village || addr.town || '';
    const formatted_address = g.display_name || address;

    // 2) Nearby amenities via Overpass API (free) - small radius and limited results
    let amenities = [];
    try {
      const radius = 2000; // meters
      const categories = ['cafe', 'school', 'pharmacy', 'restaurant', 'bank', 'supermarket'];
      const overpassQuery = `
        [out:json][timeout:10];
        (
          ${categories.map(c => `node(around:${radius},${lat},${lon})[amenity=${c}];`).join('\n          ')}
          node(around:${radius},${lat},${lon})[leisure=park];
        );
        out body 20;`;
      const overpassResp = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': userAgent },
        body: new URLSearchParams({ data: overpassQuery })
      });
      if (overpassResp.ok) {
        const over = await overpassResp.json();
        const names = (over.elements || [])
          .map(el => (el.tags && (el.tags.name || el.tags['addr:housename'])) || null)
          .filter(Boolean);
        const seen = new Set();
        for (const n of names) { if (!seen.has(n)) { amenities.push(n); seen.add(n); } }
        amenities = amenities.slice(0, 10);
      }
    } catch {
      // ignore amenity fetch errors
    }

    // 3) Return data (no paid providers: beds/baths/sqft/property_type may be blank)
    return respond(200, {
      formatted_address,
      neighborhood,
      lat, lon,
      beds: null,
      baths: null,
      square_feet: null,
      property_type: '',
      amenities,
      features: [],
      suggested_target_audience: ''
    });
  } catch (e) {
    return respond(500, { error: e.message || 'Server error' });
  }
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
