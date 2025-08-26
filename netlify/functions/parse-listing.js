// Free parser for typical listing pages (Zillow/Redfin/Realtor/IDX)
// Extracts beds, baths, square_feet, and property_type via JSON-LD/OpenGraph or regex fallbacks
async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return respond(400, { error: 'URL required' });

    async function fetchWithUA(target) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);
      try {
        const resp = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          redirect: 'follow',
          signal: controller.signal
        });
        if (!resp.ok) return null;
        return await resp.text();
      } catch (e) {
        return null;
      } finally { clearTimeout(t); }
    }

    let html = await fetchWithUA(url);
    if (!html) {
      // Fallback: r.jina.ai free reader proxy to bypass blocks
      const normalized = url.replace(/^https?:\/\//, '');
      const fallbackUrl = 'https://r.jina.ai/http://' + normalized;
      html = await fetchWithUA(fallbackUrl);
      if (!html) return respond(502, { error: 'Failed to fetch page' });
    }

    const result = { beds: null, baths: null, square_feet: null, property_type: '' };

    // Zillow-specific JSON extraction (__NEXT_DATA__ or preloaded data)
    try {
      if (/zillow\.com/i.test(url)) {
        // __NEXT_DATA__ JSON
        var nextDataMatch = html.match(/<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
        if (nextDataMatch && nextDataMatch[1]) {
          try {
            var nextJson = JSON.parse(nextDataMatch[1]);
            var found = extractZillowFromJson(nextJson);
            if (found) {
              if (found.beds != null) result.beds = result.beds ?? found.beds;
              if (found.baths != null) result.baths = result.baths ?? found.baths;
              if (found.square_feet != null) result.square_feet = result.square_feet ?? found.square_feet;
              if (found.property_type) result.property_type = result.property_type || found.property_type;
            }
          } catch (e) { /* ignore */ }
        }
        // hdpApolloPreloadedData style JSON (legacy)
        if (result.beds == null || result.baths == null || result.square_feet == null) {
          var apolloMatch = html.match(/<script[^>]*id=["']hdpApolloPreloadedData["'][^>]*>([\s\S]*?)<\/script>/i);
          if (apolloMatch && apolloMatch[1]) {
            try {
              var apolloJson = JSON.parse(apolloMatch[1]);
              var found2 = extractZillowFromJson(apolloJson);
              if (found2) {
                if (found2.beds != null) result.beds = result.beds ?? found2.beds;
                if (found2.baths != null) result.baths = result.baths ?? found2.baths;
                if (found2.square_feet != null) result.square_feet = result.square_feet ?? found2.square_feet;
                if (found2.property_type) result.property_type = result.property_type || found2.property_type;
              }
            } catch (e) { /* ignore */ }
          }
        }
        // Plain JSON patterns in HTML
        if (result.beds == null) {
          var mBeds = html.match(/"bedrooms"\s*:\s*(\d+(?:\.\d+)?)/i);
          if (mBeds) result.beds = Number(mBeds[1]);
        }
        if (result.baths == null) {
          var mBaths = html.match(/"bathrooms"\s*:\s*(\d+(?:\.\d+)?)/i);
          if (mBaths) result.baths = Number(mBaths[1]);
        }
        if (result.square_feet == null) {
          var mSq = html.match(/"livingArea"\s*:\s*(\d{3,5})/i) || html.match(/"livingAreaValue"\s*:\s*(\d{3,5})/i);
          if (mSq) result.square_feet = Number(mSq[1]);
        }
        if (!result.property_type) {
          var mType = html.match(/"homeType"\s*:\s*"([^"]+)"/i);
          if (mType) result.property_type = mType[1];
        }
      }
    } catch (e) { /* ignore */ }

    // Zillow HTML chips fallback (extract from visible chips with data-testid labels)
    try {
      if ((result.beds == null || result.baths == null || result.square_feet == null) && /zillow\.com/i.test(url)) {
        var chips = /data-testid=["']bed-bath-sqft-fact-container["'][\s\S]*?<span[^>]*>([\d,\.]+)<\/span>[\s\S]*?<span[^>]*>(beds?|baths?|sq\s*ft)\b/gi;
        var mm;
        while ((mm = chips.exec(html)) !== null) {
          var valStr = (mm[1] || '').replace(/,/g, '');
          var num = Number(valStr);
          var label = (mm[2] || '').toLowerCase();
          if (!isNaN(num)) {
            if ((label.indexOf('bed') >= 0) && result.beds == null) result.beds = num;
            else if ((label.indexOf('bath') >= 0) && result.baths == null) result.baths = num;
            else if ((label.indexOf('sq') >= 0) && result.square_feet == null) result.square_feet = num;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // Try JSON-LD first (avoid matchAll/optional chaining for older runtimes)
    try {
      var ldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      var m;
      while ((m = ldRegex.exec(html)) !== null) {
        try {
          var json = JSON.parse(m[1]);
          var items = Array.isArray(json) ? json : [json];
          for (var i = 0; i < items.length; i++) {
            var item = items[i] || {};
            var type = (item['@type'] || '').toString().toLowerCase();
            if (type.indexOf('apartment') >= 0 || type.indexOf('house') >= 0 || type.indexOf('residence') >= 0 || type.indexOf('singlefamily') >= 0 || type.indexOf('product') >= 0 || type.indexOf('offer') >= 0) {
              var agg = (item.offers && item.offers[0] && item.offers[0].itemOffered) || item.itemOffered || item;
              var aggType = (agg && agg['@type']) || item['@type'] || '';
              result.property_type = result.property_type || aggType.toString();
              var bd = (agg && (agg.numberOfRooms || agg.numberOfBedrooms)) || item.numberOfBedrooms;
              var bt = (agg && (agg.numberOfBathroomsTotal)) || item.numberOfBathroomsTotal || item.numberOfBathrooms;
              var sf = (agg && agg.floorSize && (agg.floorSize.value || (agg.floorSize.value && agg.floorSize.value.value))) || (item.floorSize && item.floorSize.value) || item.floorSize;
              if (bd != null && !isNaN(Number(bd))) result.beds = Number(bd);
              if (bt != null && !isNaN(Number(bt))) result.baths = Number(bt);
              if (sf != null && !isNaN(Number(sf))) result.square_feet = Number(sf);
            }
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }

    // OpenGraph fallbacks (from HTML)
    if (result.square_feet == null) {
      const og = html.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const text = (og && og[1]) ? og[1] : '';
      const sfm = text.match(/(\d{3,4})\s*(sq\.?\s*ft|sf)/i);
      if (sfm) result.square_feet = Number(sfm[1]);
      const bdm = text.match(/(\d+(?:\.\d+)?)\s*bed/i);
      if (bdm) result.beds = Number(bdm[1]);
      const btm = text.match(/(\d+(?:\.\d+)?)\s*bath/i);
      if (btm) result.baths = Number(btm[1]);
    }

    // Generic regex fallbacks from visible HTML or fallback text
    if (result.beds == null) {
      const m = html.match(/>(\d+(?:\.\d+)?)\s*Beds?<\/|\b(\d+(?:\.\d+)?)\s*Beds?\b/i);
      if (m) result.beds = Number(m[1] || m[2]);
      else {
        const m2 = html.match(/\b(\d+(?:\.\d+)?)\s*(?:bd|bedrooms?)\b/i);
        if (m2) result.beds = Number(m2[1]);
      }
    }
    if (result.baths == null) {
      const m = html.match(/>(\d+(?:\.\d+)?)\s*Baths?<\/|\b(\d+(?:\.\d+)?)\s*Baths?\b/i);
      if (m) result.baths = Number(m[1] || m[2]);
      else {
        const m2 = html.match(/\b(\d+(?:\.\d+)?)\s*(?:ba|baths?|bathrooms?)\b/i);
        if (m2) result.baths = Number(m2[1]);
      }
    }
    if (result.square_feet == null) {
      const m = html.match(/>(\d{3,4})\s*(sq\.?\s*ft|sf)<\/|\b(\d{3,4})\s*(sq\.?\s*ft|sf)\b/i);
      if (m) result.square_feet = Number(m[1] || m[3]);
      else {
        const m2 = html.match(/\b(\d{3,4}(?:,\d{3})?)\s*(?:sq\.?\s*ft|sf)\b/i);
        if (m2) result.square_feet = Number(m2[1].replace(/,/g, ''));
      }
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

// Helper: traverse Zillow JSON and pick fields
function extractZillowFromJson(obj) {
  try {
    var out = { beds: null, baths: null, square_feet: null, property_type: '' };
    var found = false;
    function visit(o) {
      if (!o || typeof o !== 'object' || found) return;
      // Common keys
      if (typeof o.bedrooms !== 'undefined' || typeof o.bathrooms !== 'undefined' || typeof o.livingArea !== 'undefined' || typeof o.homeType !== 'undefined') {
        if (o.bedrooms != null && out.beds == null && !isNaN(Number(o.bedrooms))) out.beds = Number(o.bedrooms);
        if (o.bathrooms != null && out.baths == null && !isNaN(Number(o.bathrooms))) out.baths = Number(o.bathrooms);
        if (o.livingArea != null && out.square_feet == null && !isNaN(Number(o.livingArea))) out.square_feet = Number(o.livingArea);
        if (o.homeType && !out.property_type) out.property_type = String(o.homeType);
        if (out.beds != null && out.baths != null && out.square_feet != null) found = true;
      }
      // Zillow caches often store in gdpClientCache
      for (var k in o) {
        if (!o.hasOwnProperty(k)) continue;
        var v = o[k];
        if (typeof v === 'object') visit(v);
      }
    }
    visit(obj);
    if (out.beds != null || out.baths != null || out.square_feet != null || out.property_type) return out;
  } catch (e) { /* ignore */ }
  return null;
}


