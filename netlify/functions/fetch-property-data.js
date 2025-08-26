async function handler(event) {
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
    // Neighborhood preference order; avoid county/state/zip
    const neighborhood = (
      addr.neighbourhood || addr.suburb || addr.city_district || addr.quarter || addr.borough || addr.locality || addr.hamlet || addr.town || addr.city || ''
    );
    // Clean, short street address line
    const houseNumber = addr.house_number || '';
    const road = addr.road || addr.pedestrian || addr.footway || addr.cycleway || addr.path || '';
    const cityish = addr.city || addr.town || addr.village || '';
    const state = addr.state || '';
    const formatted_address = [
      [houseNumber, road].filter(Boolean).join(' '),
      // Optionally append city if available; omit county, state, zip from the main input
      cityish
    ].filter(Boolean).join(', ') || g.display_name || address;
    const postcode = addr.postcode || '';

    // 2) Try to discover a Redfin URL for this address (best-effort)
    let redfin_url = '';
    try {
      const rfQuery = encodeURIComponent(`${houseNumber} ${road}, ${cityish} ${postcode}`.trim());
      const rfSearch = `https://www.redfin.com/stingray/do/location-autocomplete?location=${rfQuery}&v=2&market=socal&al=1&iss=false`; // public endpoint used by their UI
      const rfResp = await fetch(rfSearch, { headers: { 'User-Agent': userAgent, 'Accept': 'application/json' } });
      if (rfResp.ok) {
        const rj = await rfResp.json();
        const best = (rj.autocomplete_sections || []).flatMap(s => s.rows || []).find(r => (r.url || '').includes('/CA/'));
        if (best && best.url) redfin_url = `https://www.redfin.com${best.url}`;
      }
    } catch { /* ignore */ }

    // 3) Nearby amenities via Overpass API (free) - small radius and limited results
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

    // Heuristics: Near beach and near Balboa Park
    const toRad = (x) => x * Math.PI / 180;
    const haversineMeters = (aLat, aLon, bLat, bLon) => {
      const R = 6371000;
      const dLat = toRad(bLat - aLat);
      const dLon = toRad(bLon - aLon);
      const s1 = Math.sin(dLat/2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon/2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s1));
    };
    // A few coastal reference points in San Diego County
    const coastRefs = [
      [32.8500, -117.2720], // La Jolla Cove
      [32.7925, -117.2540], // Pacific Beach
      [32.7490, -117.2510], // Ocean Beach
      [32.7650, -117.2520], // Mission Beach
      [32.6780, -117.1720], // Coronado
      [32.9628, -117.2696], // Del Mar
      [33.0450, -117.2920], // Encinitas
      [33.1600, -117.3500], // Carlsbad
      [33.1950, -117.3820]  // Oceanside
    ];
    const minCoastDist = Math.min(...coastRefs.map(([clat, clon]) => haversineMeters(lat, lon, clat, clon)));
    const nearBeach = Number.isFinite(minCoastDist) && minCoastDist < 3000; // < 3km
    // Balboa Park center approx
    const balboaLat = 32.734382, balboaLon = -117.144123;
    const balboaDist = haversineMeters(lat, lon, balboaLat, balboaLon);
    const nearBalboa = Number.isFinite(balboaDist) && balboaDist < 5000; // < 5km
    const features = [];
    if (nearBeach) features.push('Near the beach');
    if (nearBalboa) features.push('Near Balboa Park');

    // 4) Return data (no paid providers: beds/baths/sqft/property_type may be blank)
    return respond(200, {
      formatted_address,
      neighborhood,
      lat, lon,
      postcode,
      redfin_url,
      beds: null,
      baths: null,
      square_feet: null,
      property_type: '',
      amenities,
      features,
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

module.exports = { handler };
