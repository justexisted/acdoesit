// Free parser for typical listing pages (Zillow/Redfin/Realtor/IDX)
// Extracts beds, baths, square_feet, and property_type via JSON-LD/OpenGraph or regex fallbacks
async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return respond(400, { error: 'URL required' });

    const pageResp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!pageResp.ok) return respond(502, { error: 'Failed to fetch page' });
    const html = await pageResp.text();

    const result = { beds: null, baths: null, square_feet: null, property_type: '' };

    // Try JSON-LD first
    const ldMatches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
    for (const m of ldMatches) {
      try {
        const json = JSON.parse(m[1]);
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          const type = (item['@type'] || '').toString().toLowerCase();
          if (type.includes('apartment') || type.includes('house') || type.includes('residence') || type.includes('singlefamily') || type.includes('product') || type.includes('offer')) {
            const agg = item?.offers?.[0]?.itemOffered || item?.itemOffered || item;
            result.property_type = result.property_type || (agg?.@type || item?.@type || '').toString();
            const bd = agg?.numberOfRooms || agg?.numberOfBedrooms || item?.numberOfBedrooms;
            const bt = agg?.numberOfBathroomsTotal || item?.numberOfBathroomsTotal || item?.numberOfBathrooms;
            const sf = agg?.floorSize?.value || agg?.floorSize?.value?.value || item?.floorSize?.value || item?.floorSize;
            if (bd != null) result.beds = Number(bd) || result.beds;
            if (bt != null) result.baths = Number(bt) || result.baths;
            if (sf != null) result.square_feet = Number(sf) || result.square_feet;
          }
        }
      } catch { /* ignore */ }
    }

    // OpenGraph fallbacks
    if (result.square_feet == null) {
      const og = html.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const text = og?.[1] || '';
      const sfm = text.match(/(\d{3,4})\s*(sq\.?\s*ft|sf)/i);
      if (sfm) result.square_feet = Number(sfm[1]);
      const bdm = text.match(/(\d+(?:\.\d+)?)\s*bed/i);
      if (bdm) result.beds = Number(bdm[1]);
      const btm = text.match(/(\d+(?:\.\d+)?)\s*bath/i);
      if (btm) result.baths = Number(btm[1]);
    }

    // Generic regex fallbacks from visible HTML
    if (result.beds == null) {
      const m = html.match(/>(\d+(?:\.\d+)?)\s*Beds?<\/|\b(\d+(?:\.\d+)?)\s*Beds?\b/i);
      if (m) result.beds = Number(m[1] || m[2]);
    }
    if (result.baths == null) {
      const m = html.match(/>(\d+(?:\.\d+)?)\s*Baths?<\/|\b(\d+(?:\.\d+)?)\s*Baths?\b/i);
      if (m) result.baths = Number(m[1] || m[2]);
    }
    if (result.square_feet == null) {
      const m = html.match(/>(\d{3,4})\s*(sq\.?\s*ft|sf)<\/|\b(\d{3,4})\s*(sq\.?\s*ft|sf)\b/i);
      if (m) result.square_feet = Number(m[1] || m[3]);
    }
    if (!result.property_type) {
      const m = html.match(/property\s*type[^<:]*:?\s*<[^>]*>([^<]+)<\//i) || html.match(/\b(Condo|minihouse|Single[-\s]?Family|Townhouse|Multi[-\s]?Unit|Apartment|Duplex|Manufactured|Mobile)\b/i);
      if (m) result.property_type = m[1] || m[0];
    }

    return respond(200, result);
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


