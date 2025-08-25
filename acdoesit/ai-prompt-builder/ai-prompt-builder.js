// AI Prompt Builder for San Diego Real Estate
document.addEventListener("DOMContentLoaded", () => {
  const Modules = {
    listing: {
      fields: [
        { key: "Property_Address", type: "text", label: "Property Address", placeholder: "123 Example St" },
        { key: "Neighborhood", type: "combobox", label: "Neighborhood", options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"], placeholder: "Type or select a neighborhood" },
        { key: "Property_Type", type: "select", label: "Property Type", options: ["Condo", "Single-Family Home", "Townhouse", "Multi-Unit", "Luxury Estate"] },
        { key: "Architectural_Style", type: "select", label: "Architectural Style", options: ["Craftsman", "Spanish Revival", "Mid-Century Modern", "Contemporary", "Mediterranean", "Bungalow", "Ranch", "Modern Coastal"] },
        { key: "Beds", type: "number", label: "Beds", min: 0, step: 1 },
        { key: "Baths", type: "number", label: "Baths", min: 0, step: 0.5 },
        { key: "Square_Footage", type: "number", label: "Square Footage", min: 100, step: 1, suffix: "sq ft" },
        { key: "Key_Features", type: "textarea", label: "Key Features (bullets)", placeholder: "• Renovated kitchen\n• Ocean views\n• Private backyard" },
        { key: "Nearby_Amenities", type: "checkboxes", label: "Nearby Amenities", options: ["Walkable to cafes", "Near Balboa Park", "Top-rated schools", "Easy freeway access", "Close to trolley", "Beach access", "Farmers market nearby"] },
        { key: "Target_Audience", type: "combobox", label: "Target Audience", options: ["First-time homebuyers", "55+", "Young professionals", "Growing families", "Retirees", "Investors"], placeholder: "Type or select target audience" },
        { key: "Tone", type: "select", label: "Tone", options: ["Luxurious & Elegant", "Modern & Trendy", "Cozy & Charming", "Professional & Direct"] },
        // Open House specific (used by Open House Flyer template; optional for others)
        { key: "Open_House_Date", type: "text", label: "Open House Date", placeholder: "Sat, May 18" },
        { key: "Open_House_Time", type: "text", label: "Open House Time", placeholder: "1:00 PM – 4:00 PM" },
        { key: "Hosting_Agent_Name", type: "text", label: "Hosting Agent", placeholder: "Jane Doe, REALTOR®" },
        { key: "Contact_Info", type: "text", label: "Contact Info", placeholder: "(555) 123-4567 · jane@example.com" },
        { key: "Parking_Details", type: "text", label: "Parking Details", placeholder: "Street parking on Elm St; please watch signs" },
        { key: "Open_House_Notes", type: "textarea", label: "Open House Notes", placeholder: "Refreshments provided • Please remove shoes • Sign in at entry" }
      ],
      templates: {
        full: "Act as an expert San Diego real estate copywriter. Write a compelling property listing description for a [Property_Type] located in the [Neighborhood] neighborhood of San Diego. The property has a [Architectural_Style] design.\n\nProperty Details:\nAddress: [Property_Address]\nSpecs: [Beds] bedrooms, [Baths] bathrooms, [Square_Footage] sq. ft.\nKey Features:\n[Key_Features]\n\nNeighborhood Vibe: This home is perfectly positioned in [Neighborhood] with convenient access to [Nearby_Amenities].\n\nInstructions:\n• Craft a captivating headline.\n• Write a main body (2-3 paragraphs) that tells a story about living in the home, weaving in the key features and the benefits of the [Neighborhood] location.\n• The tone of the description must be [Tone].\n• The description should appeal directly to [Target_Audience].\n• End with a strong call to action to schedule a showing.\n• Ensure the description is optimized for SEO using keywords like \"San Diego real estate,\" \"homes for sale in [Neighborhood],\" and \"[Beds] bedroom home in San Diego.\"",
        zillow: "Act as an expert San Diego real estate copywriter. Write a concise, compelling property listing description for Zillow (max 2000 characters) for a [Property_Type] located in the [Neighborhood] neighborhood of San Diego.\n\nProperty Details:\nAddress: [Property_Address]\nSpecs: [Beds] bedrooms, [Baths] bathrooms, [Square_Footage] sq. ft.\nKey Features:\n[Key_Features]\n\nNeighborhood: [Neighborhood] - [Nearby_Amenities]\n\nInstructions:\n• Write a compelling but concise description (under 2000 characters)\n• Focus on key selling points and neighborhood benefits\n• Include [Nearby_Amenities] as specific location advantages\n• Appeal to [Target_Audience] with [Tone] tone\n• End with a call to action\n• Use SEO keywords: \"San Diego real estate,\" \"homes for sale in [Neighborhood]\"",
        instagram: "Act as a social media expert for San Diego real estate. Write a compelling Instagram post caption for a [Property_Type] in [Neighborhood] (max 2200 characters).\n\nProperty Highlights:\n🏠 [Beds] bed, [Baths] bath, [Square_Footage] sq ft [Property_Type]\n📍 [Neighborhood] neighborhood\n✨ [Key_Features]\n🚶‍♀️ [Nearby_Amenities]\n\nInstructions:\n• Write an engaging, Instagram-friendly caption\n• Use emojis strategically but don't overdo it\n• Highlight the lifestyle benefits of [Neighborhood]\n• Mention specific [Nearby_Amenities] as selling points\n• Appeal to [Target_Audience]\n• Include relevant hashtags: #SanDiegoRealEstate #[Neighborhood]Homes #[Beds]BedroomHome\n• End with a call to action to DM for more info",
        sdar: "Act as a San Diego Association of REALTORS® MLS remark specialist. Draft clear, compliant listing remarks for a [Property_Type] in [Neighborhood], San Diego. Avoid subjective superlatives and fair-housing issues; focus on verifiable facts.\n\nInclude:\n• Address: [Property_Address]\n• Specs: [Beds] bed | [Baths] bath | [Square_Footage] sq ft\n• Style: [Architectural_Style]\n• Key Features: [Key_Features]\n• Area Highlights: [Nearby_Amenities]\n\nGuidelines:\n• Neutral, professional tone suitable for SDAR MLS\n• No discriminatory phrasing; no targeting protected classes\n• Concise and scannable; facts over hype\n• End with neutral showing note (no contact info)",
        psar: "Act as a Pacific Southwest Association of REALTORS® MLS remark specialist. Write concise, compliant remarks for a [Property_Type] in [Neighborhood], San Diego. Keep tone neutral, avoid subjective claims, and present facts buyers value.\n\nInclude:\n• Address: [Property_Address]\n• Specs: [Beds] bed | [Baths] bath | [Square_Footage] sq ft\n• Style: [Architectural_Style]\n• Key Features: [Key_Features]\n• Nearby: [Nearby_Amenities]\n\nGuidelines:\n• Compliant with PSAR/MLS norms; information-dense\n• No steering/blockbusting/fair-housing violations\n• Short, clear sentences; minimal fluff\n• Close with informative, non-soliciting line",
        open_house_flyer: "Act as a San Diego real estate marketer. Create a concise, high-converting Open House flyer for a [Property_Type] at [Property_Address] in [Neighborhood].\n\nInclude clearly labeled sections:\n• Headline: Create an attention-grabbing headline for the home and lifestyle.\n• When: [Open_House_Date], [Open_House_Time]\n• Where: [Property_Address]\n• Specs: [Beds] bed | [Baths] bath | [Square_Footage] sq ft | [Architectural_Style]\n• Highlights: [Key_Features]\n• Neighborhood Perks: [Nearby_Amenities]\n• Hosted By: [Hosting_Agent_Name]\n• Contact: [Contact_Info]\n• Parking: [Parking_Details]\n• Notes: [Open_House_Notes]\n\nStyle Guidelines:\n• Use short, scannable bullets and bolded labels\n• Persuasive but compliant, aligned to [Tone]\n• End with a strong CTA: \"See you at the Open House!\""
      }
    },
    investment: {
      fields: [
        { key: "Property_Address", type: "text", label: "Property Address", placeholder: "123 Example St" },
        { key: "Purchase_Price", type: "number", label: "Purchase Price ($)", min: 0, step: 1000 },
        { key: "Down_Payment_Percentage", type: "number", label: "Down Payment (%)", min: 0, max: 100, step: 0.5 },
        { key: "Interest_Rate", type: "number", label: "Interest Rate (%)", min: 0, max: 100, step: 0.01 },
        { key: "Loan_Term", type: "number", label: "Loan Term (years)", min: 1, max: 40, step: 1 },
        { key: "Gross_Monthly_Rent", type: "number", label: "Gross Monthly Rent ($)", min: 0, step: 50 },
        { key: "Estimated_Monthly_Expenses", type: "textarea", label: "Monthly Expenses (list)", placeholder: "Property Tax: $...\nInsurance: $...\nHOA: $...\nVacancy: %...\nRepairs: $...\nCapEx: $...\nManagement Fee: %..." },
        { key: "Closing_Costs", type: "number", label: "Closing Costs ($)", min: 0, step: 100 }
      ],
      template: "Act as a San Diego real estate investment analyst. I need a preliminary financial analysis for a potential rental property. Here is the data:\n\nFinancial Data:\nProperty Address: [Property_Address]\nPurchase Price: $[Purchase_Price]\nDown Payment: [Down_Payment_Percentage]%\nLoan Terms: [Loan_Term] years at [Interest_Rate]% interest.\nClosing Costs: $[Closing_Costs]\nIncome: Gross Monthly Rent is $[Gross_Monthly_Rent].\nMonthly Expenses: [Estimated_Monthly_Expenses]\n\nAnalysis Required:\nPlease calculate and present the following metrics in a clear, easy-to-read table:\n• Total Cash Needed to Close: (Down Payment + Closing Costs).\n• Monthly Mortgage Payment: (Principal & Interest).\n• Monthly Cash Flow: (Gross Rent - All Monthly Expenses - Mortgage Payment).\n• Capitalization Rate (Cap Rate): (Net Operating Income / Purchase Price).\n• Cash-on-Cash Return: (Annual Cash Flow / Total Cash Needed to Close).\n• Gross Rent Multiplier (GRM).\n\nConclude with a brief, one-paragraph summary of the investment's potential based on these numbers."
    },
    zoning: {
      fields: [
        { key: "Parcel_Address_or_APN", type: "text", label: "Parcel Address or APN", placeholder: "123 Example St or 123-456-78-90" },
        { key: "Current_Zoning_Code", type: "text", label: "Current Zoning Code (e.g., RM-1-1)", placeholder: "RM-1-1, RS-1-7, etc." },
        { key: "Lot_Size_Acres", type: "number", label: "Lot Size (acres)", min: 0, step: 0.01 },
        { key: "Proposed_Use", type: "select", label: "Proposed Use", options: ["Multifamily Residential", "Mixed-Use", "Commercial Retail", "Office", "Industrial", "ADU/Small Lot"] }
      ],
      template: "Act as a land use consultant specializing in the San Diego Municipal Code. I am conducting a preliminary feasibility study for a property.\n\nProperty Information:\nLocation: [Parcel_Address_or_APN]\nLot Size: [Lot_Size_Acres] acres\nZoning Designation: [Current_Zoning_Code]\nProposed Use: [Proposed_Use]\n\nTask: Based on the San Diego Municipal Code for zone [Current_Zoning_Code], provide a summary report covering the following key development standards:\n• Permitted Uses: What uses are allowed by right for this zone?\n• Density: What is the maximum number of dwelling units allowed per acre?\n• Setbacks: What are the required front, side, and rear yard setbacks?\n• Maximum Height: What is the maximum building height allowed?\n• Lot Coverage: What is the maximum percentage of the lot that can be covered by structures?\n• Parking Requirements: What are the general off-street parking requirements for a [Proposed_Use] project?\n\nPlease present this information in a clear, bulleted list. Conclude with a sentence on any potential red flags or major considerations for this zoning type."
    },
    staging: {
      fields: [
        { key: "Neighborhood", type: "combobox", label: "Neighborhood", options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"], placeholder: "Type or select a neighborhood" },
        { key: "Architectural_Style", type: "select", label: "Architectural Style", options: ["Craftsman", "Spanish Revival", "Mid-Century Modern", "Contemporary", "Mediterranean", "Bungalow", "Ranch", "Modern Coastal"] },
        { key: "Property_Condition", type: "select", label: "Property Condition", options: ["Vacant", "Occupied - needs decluttering", "Outdated finishes"] },
        { key: "Target_Buyer_Profile", type: "text", label: "Target Buyer Profile", placeholder: "e.g., Young tech professionals" },
        { key: "Budget_Level", type: "select", label: "Budget Level", options: ["Budget-friendly (DIY)", "Mid-Range (partial professional)", "High-End (full professional)"] },
        { key: "Rooms_To_Stage", type: "checkboxes", label: "Rooms to Stage", options: ["Living Room", "Kitchen", "Primary Bedroom", "Secondary Bedroom", "Home Office", "Dining Room", "Patio/Outdoor"] }
      ],
      template: "Act as a professional home stager with expertise in the San Diego market. Create a detailed staging plan for a [Architectural_Style] home in the [Neighborhood] neighborhood.\n\nStaging Context:\n• The property is currently [Property_Condition].\n• The target buyer is [Target_Buyer_Profile].\n• The staging budget is [Budget_Level].\n• We need to focus on staging the following rooms: [Rooms_To_Stage].\n\nInstructions:\nFor each selected room, provide a room-by-room plan that includes:\n• Core Theme: Define the overall aesthetic (e.g., \"Modern Coastal,\" \"Bohemian Craftsman,\" \"Minimalist Mid-Century\").\n• Color Palette: Suggest 3–4 complementary colors for decor, textiles, and art.\n• Furniture Recommendations: Suggest key furniture pieces and an ideal layout to maximize space and flow.\n• Decor & Accessory List: Provide a checklist of essential decor items (area rugs, throw pillows, artwork, plants, lighting).\n• Pro Tip: Include one specific tip that aligns the [Architectural_Style] with the lifestyle of the [Neighborhood] (e.g., for a North Park Craftsman, suggest a cozy reading nook)."
    },
    calendar: {
      fields: [
        { key: "Target_Neighborhoods", type: "checkboxes", label: "Target Neighborhoods", options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"], placeholder: "Type or select a neighborhood" },
        { key: "Social_Media_Platform", type: "select", label: "Platform", options: ["Instagram", "Facebook"] },
        { key: "Content_Pillars", type: "checkboxes", label: "Content Pillars", options: ["Market Updates", "Local Events", "Neighborhood Spotlights", "Real Estate Tips", "Client Testimonials"] },
        { key: "Month", type: "select", label: "Month", options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }
      ],
      template: "Act as a social media marketing strategist for a top San Diego realtor. Create a one-month content calendar for [Month] to be posted on [Social_Media_Platform]. The realtor's brand is focused on being a local expert for the following neighborhoods: [Target_Neighborhoods]. The content strategy should be built around these pillars: [Content_Pillars].\n\nTask: Generate a 4-week content calendar in a table format with the columns: \"Day of Week,\" \"Content Pillar,\" \"Post Idea/Caption,\" and \"Hashtag Suggestions.\"\n\nRequirements:\n• Provide 3–4 post ideas per week.\n• Market Updates should reference San Diego–specific trends.\n• Local Events should mention real events happening in [Month] in or near [Target_Neighborhoods].\n• Neighborhood Spotlights should feature specific parks, coffee shops, or hidden gems in [Target_Neighborhoods].\n• Hashtag Suggestions must include a mix of broad San Diego hashtags (e.g., #SanDiegoRealEstate) and hyperlocal ones (e.g., #NorthParkLiving, #LaJollaHomes)."
    }
  };

  let activeModule = "listing";
  let activeTemplate = "full"; // For listing module templates
  let formData = {}; // Store form data across module switches
  let savedProperties = []; // Store saved properties
  let promptsByProperty = {}; // property_id -> prompts array

  const picker = document.getElementById("module-picker");
  const formEl = document.getElementById("module-form");
  const templateSelector = document.getElementById("template-selector");
  const previewEl = document.getElementById("preview");
  const previewContainer = document.getElementById("preview-container");
  const generateBtn = document.getElementById("generate-btn");
  const copyBtn = document.getElementById("copy-btn");
  const savePromptBtn = document.getElementById("save-prompt-btn");
  const savePropertyBtn = document.getElementById("save-property-btn");
  const savedPropertiesSection = document.getElementById("saved-properties");
  const propertyList = document.getElementById("property-list");

  function ensureSavedPropertiesSection() {
    let section = document.getElementById('saved-properties');
    if (!section) {
      section = document.createElement('div');
      section.id = 'saved-properties';
      section.className = 'saved-properties';
      section.style.display = 'none';
      section.innerHTML = `
        <h3>💾 Saved Properties</h3>
        <div class="property-list" id="property-list"></div>
      `;
      document.querySelector('.ai-prompt-builder')?.appendChild(section);
    }
    let list = document.getElementById('property-list');
    if (!list) {
      list = document.createElement('div');
      list.id = 'property-list';
      list.className = 'property-list';
      section.appendChild(list);
    }
    return { section, list };
  }

  // Server-driven current user (uses HttpOnly cookie)
  async function getCurrentUser() {
    try {
      const resp = await fetch('/.netlify/functions/check-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data && data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.first_name || data.user.firstName,
          lastName: data.user.last_name || data.user.lastName
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // User Activity Tracking Functions
  async function trackUserActivity(action, details = {}) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.log('No authenticated user found for activity tracking');
        return;
      }

      // Get user's location (simplified - in production you'd use a geolocation service)
      const location = {
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown'
      };

      const activityData = {
        user_id: currentUser.id,
        action: action,
        details: {
          ...details,
          module: activeModule,
          template: activeTemplate,
          timestamp: new Date().toISOString()
        },
        location: location
      };

      console.log('Sending activity data:', activityData);

      // Send to tracking endpoint
      const response = await fetch('/.netlify/functions/track-user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        console.log('Failed to track activity:', response.statusText);
      }
    } catch (error) {
      console.log('Error tracking user activity:', error);
    }
  }

  // Track page load - temporarily disabled to prevent 502 errors
  // trackUserActivity('page_view', { page: 'ai_prompt_builder' });

  // Load saved properties from database
  async function loadSavedProperties() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.log('No authenticated user found');
        savedProperties = [];
        const { section, list } = ensureSavedPropertiesSection();
        section.style.display = 'none';
        list.innerHTML = '';
        return;
      }

      console.log('Loading properties for user:', currentUser.id);

      const response = await fetch('/.netlify/functions/get-user-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      });

      if (response.ok) {
        const properties = await response.json();
        savedProperties = properties.map(prop => ({
          id: prop.id,
          userId: prop.user_id,
          propertyName: prop.property_name,
          address: prop.address,
          neighborhood: prop.neighborhood,
          propertyType: prop.property_type,
          targetAudience: prop.target_audience,
          uniqueFeatures: prop.unique_features,
          module: prop.module,
          createdAt: prop.created_at,
          formData: prop.form_data || {}
        }));
        await loadAllPrompts();
        displaySavedProperties();
      } else {
        console.log('Failed to load properties from database');
      }
    } catch (error) {
      console.log('Error loading properties from database:', error);
    }
  }

  async function loadAllPrompts() {
    promptsByProperty = {};
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      const resp = await fetch('/.netlify/functions/get-user-prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id }) });
      if (!resp.ok) return;
      const prompts = await resp.json();
      prompts.forEach(p => {
        const pid = p.property_id || 0;
        if (!promptsByProperty[pid]) promptsByProperty[pid] = [];
        promptsByProperty[pid].push(p);
      });
    } catch (e) { /* ignore */ }
  }

  async function findOrCreateCurrentPropertyId() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;
    const values = getValues();
    const address = values.Property_Address || values.Parcel_Address_or_APN || '';
    if (!address) return null;
    // Try to find existing property by address for this user
    const match = savedProperties.find(p => (p.address || '').trim().toLowerCase() === address.trim().toLowerCase());
    if (match) return match.id;
    // Create property then reload and find
    await saveCurrentProperty();
    await loadSavedProperties();
    const match2 = savedProperties.find(p => (p.address || '').trim().toLowerCase() === address.trim().toLowerCase());
    return match2 ? match2.id : null;
  }

  // Save current property to database (module-aware; address required only for listing)
  async function saveCurrentProperty() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        showMessage('Please sign in to save properties', 'error');
        return;
      }

      const values = getValues();
      if (activeModule === 'listing' && !values.Property_Address) {
        showMessage('Please enter a property address first', 'error');
        return;
      }

      // Derive a sensible name per module when address/APN is not present
      const baseNameMap = {
        listing: 'Property',
        staging: 'Home Staging Template',
        investment: 'Investment Analysis',
        zoning: 'Zoning Research',
        calendar: 'Content Calendar'
      };
      const base = baseNameMap[activeModule] || 'Saved Item';
      const descriptor = (
        values.Property_Address ||
        values.Parcel_Address_or_APN ||
        values.Neighborhood ||
        values.Current_Zoning_Code ||
        values.Property_Type ||
        ''
      );
      const propertyName = descriptor ? `${base} — ${descriptor}` : `${base} — ${new Date().toLocaleString()}`;

      const propertyData = {
        propertyName,
        address: values.Property_Address || values.Parcel_Address_or_APN || '',
        neighborhood: values.Neighborhood || '',
        propertyType: values.Property_Type || '',
        targetAudience: values.Target_Audience || '',
        uniqueFeatures: values.Unique_Features || '',
        module: activeModule,
        formData: values
      };

      console.log('Saving property to database:', propertyData);

      const response = await fetch('/.netlify/functions/save-user-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          propertyData: propertyData
        })
      });

      if (response.ok) {
        showMessage('Property saved successfully! You can return to it anytime.', 'success');
        await loadSavedProperties();
      } else {
        const errorText = await response.text();
        console.error('Property save error response:', errorText);
        throw new Error(`Failed to save property: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving property:', error);
      showMessage(`Failed to save property: ${error.message}`, 'error');
    }
  }

  // Display saved properties
  function displaySavedProperties() {
    const { section, list } = ensureSavedPropertiesSection();
    if (savedProperties.length === 0) {
      section.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    const inferModuleFromData = (data) => {
      const d = data || {};
      if (d.Current_Zoning_Code || d.Parcel_Address_or_APN || d.Proposed_Use || d.Lot_Size_Acres) return 'zoning';
      if (d.Purchase_Price || d.Down_Payment_Percentage || d.Gross_Monthly_Rent || d.Estimated_Monthly_Expenses) return 'investment';
      if (d.Property_Condition || d.Target_Buyer_Profile || d.Rooms_To_Stage) return 'staging';
      if (d.Month || d.Target_Neighborhoods) return 'calendar';
      return 'listing';
    };

    const getModuleIcon = (mod) => ({
      listing: '📝',
      investment: '💰',
      zoning: '🏗️',
      staging: '🎨',
      calendar: '📅'
    })[mod] || '📄';

    const buildTitle = (property, mod) => {
      const d = property.formData || {};
      if (mod === 'listing') return (property.address || d.Property_Address || '').trim() || 'Property';
      if (mod === 'investment') return (property.address || d.Property_Address || '').trim() || 'Investment Analysis';
      if (mod === 'zoning') return (d.Parcel_Address_or_APN || property.address || '').trim() || 'Zoning Research';
      if (mod === 'staging') {
        const parts = [d.Neighborhood, d.Target_Buyer_Profile].filter(Boolean);
        return (parts.join(' — ')).trim() || 'Home Staging Template';
      }
      if (mod === 'calendar') {
        const parts = [d.Target_Neighborhoods, d.Month].filter(Boolean);
        return (parts.join(' — ')).trim() || 'Content Calendar';
      }
      return property.propertyName || 'Saved Item';
    };

    savedProperties.forEach((property, index) => {
      const propertyEl = document.createElement('div');
      propertyEl.className = 'property-item';
      
      // Use the new field names from the database
      const address = property.address || property.Property_Address || property.Parcel_Address_or_APN || '';
      const neighborhood = property.neighborhood || property.Neighborhood || '';
      const propertyType = property.propertyType || property.Property_Type || '';
      const savedDate = property.createdAt || property.created_at || property.savedAt || new Date();
      
      console.log('Displaying property:', property);
      console.log('Address:', address, 'Neighborhood:', neighborhood, 'Type:', propertyType, 'Date:', savedDate);
      
      const moduleKey = property.module || inferModuleFromData(property.formData || property);
      const icon = getModuleIcon(moduleKey);
      const title = buildTitle(property, moduleKey);
      const subtitle = (moduleKey === 'listing' || moduleKey === 'investment' || moduleKey === 'zoning') ? address : neighborhood;

      const prompts = promptsByProperty[property.id] || [];
      const promptOptions = prompts.map(p => `<option value="${p.id}">${(p.module || 'listing')} ${p.template || ''} — ${new Date(p.created_at).toLocaleString()}</option>`).join('');

      propertyEl.innerHTML = `
        <div class="property-header">
          <div>
            <div class="property-name">${title}</div>
            <div class="property-address">${(subtitle || '').trim()}</div>
          </div>
          <div class="property-icon" title="${moduleKey}" aria-label="${moduleKey}" style="font-size:20px;">${icon}</div>
        </div>
        <div class="property-details">
          ${neighborhood ? `<strong>Neighborhood:</strong> ${neighborhood}<br>` : ''}
          <strong>Type:</strong> ${moduleKey} ${icon}<br>
          <strong>Saved:</strong> ${new Date(savedDate).toLocaleDateString()}
        </div>
        <div class="property-actions" style="align-items:center; gap:8px; display:flex; justify-content:center; flex-wrap:wrap;">
          <button class="property-btn property-btn-primary" onclick="loadProperty(${index})" title="Load Property" aria-label="Load Property"> Load Property📝</button>
          <button class="property-btn property-btn-danger" onclick="deleteProperty(${index}, this)" title="Delete Property" aria-label="Delete Property">🗑️</button>
        </div>
        <div class="property-details" style="margin-top:10px;">
          <strong>Saved Prompts:</strong>
          <div class="action-buttons" style="margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap;">
            <select id="prompt-select-${property.id}" class="btn" style="background:#fff;color:#374151;border:1px solid #d1d5db;">
              <option value="">Select a saved prompt…</option>
              ${promptOptions}
            </select>
            <button class="property-btn" onclick="previewPrompt(${property.id})" title="Preview" aria-label="Preview">👁️</button>
            <button class="property-btn" id="edit-prompt-btn-${property.id}" onclick="editPrompt(${property.id})" title="Edit" aria-label="Edit">✏️</button>
            <button class="property-btn" onclick="copySavedPrompt(${property.id}, this)" title="Copy to clipboard" aria-label="Copy to clipboard">📋</button>
            <button class="property-btn property-btn-danger" onclick="removePrompt(${property.id}, this)" title="Delete" aria-label="Delete">🗑️</button>
          </div>
          <div id="prompt-preview-${property.id}" class="preview" style="display:none; margin-top:8px;"></div>
        </div>
      `;
      
      list.appendChild(propertyEl);
    });
  }

  // Load property into form
  window.loadProperty = function(index) {
    if (index >= 0 && index < savedProperties.length) {
      const property = savedProperties[index];
      
      // Switch to the correct module if needed
      const inferModuleFromData = (data) => {
        const d = data || {};
        if (d.Current_Zoning_Code || d.Parcel_Address_or_APN || d.Proposed_Use || d.Lot_Size_Acres) return 'zoning';
        if (d.Purchase_Price || d.Down_Payment_Percentage || d.Gross_Monthly_Rent || d.Estimated_Monthly_Expenses) return 'investment';
        if (d.Property_Condition || d.Target_Buyer_Profile || d.Rooms_To_Stage) return 'staging';
        if (d.Month || d.Target_Neighborhoods) return 'calendar';
        return 'listing';
      };
      const targetModule = property.module || inferModuleFromData(property.formData || property);
      if (targetModule && targetModule !== activeModule) {
        const moduleBtn = document.querySelector(`[data-module="${targetModule}"]`);
        if (moduleBtn) {
          moduleBtn.click();
        }
      }
      
      // Wait for form to render, then populate
      setTimeout(() => {
        populateFormWithProperty(property);
        showMessage('Property loaded successfully!', 'success');
      }, 100);
    }
  };

  // Delete property
  window.deleteProperty = async function(index, el) {
    if (confirm('Are you sure you want to delete this saved property?')) {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          showMessage('Please sign in to delete properties', 'error');
          return;
        }

        const propertyToDelete = savedProperties[index];
        if (!propertyToDelete || !propertyToDelete.id) {
          showMessage('Property not found', 'error');
          return;
        }

        // Delete from database
        addSpinnerToButton(el);
        const response = await fetch('/.netlify/functions/delete-user-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: currentUser.id,
            propertyId: propertyToDelete.id
          })
        });

        if (response.ok) {
          // Remove from local array
          savedProperties.splice(index, 1);
          displaySavedProperties();
          showMessage('Property deleted successfully!', 'success');
        } else {
          const errorText = await response.text();
          showMessage(`Failed to delete property: ${errorText}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        showMessage('Failed to delete property. Please try again.', 'error');
      } finally {
        removeSpinnerFromButton(el);
      }
    }
  };

  // Populate form with property data
  function populateFormWithProperty(property) {
    const { fields } = Modules[activeModule];
    
    // Use formData if available, otherwise fall back to direct property fields
    const dataSource = property.formData || property;
    
    fields.forEach(field => {
      const id = `f_${field.key}`;
      const element = document.getElementById(id);

      if (field.type === "checkboxes") {
        const raw = dataSource[field.key];
        // Normalize to array of trimmed strings
        const valueArray = Array.isArray(raw)
          ? raw.map(v => String(v).trim())
          : typeof raw === 'string'
            ? raw.split(',').map(v => v.trim()).filter(Boolean)
            : [];
        const inputs = document.querySelectorAll(`input[name="${id}"]`);
        if (inputs && inputs.length) {
          inputs.forEach(checkbox => {
            checkbox.checked = valueArray.includes(checkbox.value);
          });
        }
      } else if (element && dataSource[field.key] !== undefined) {
        element.value = dataSource[field.key];
      }
    });
  }

  // Save current form data before switching modules
  function saveCurrentFormData() {
    const { fields } = Modules[activeModule];
    fields.forEach(field => {
      const id = `f_${field.key}`;
      if (field.type === "checkboxes") {
        const checkedValues = Array.from(document.querySelectorAll(`input[name="${id}"]:checked`)).map(input => input.value);
        formData[`${activeModule}_${field.key}`] = checkedValues;
      } else {
        const element = document.getElementById(id);
        if (element) {
          formData[`${activeModule}_${field.key}`] = element.value;
        }
      }
    });
  }

  // Restore form data when switching to a module
  function restoreFormData() {
    const { fields } = Modules[activeModule];
    fields.forEach(field => {
      const id = `f_${field.key}`;
      const dataKey = `${activeModule}_${field.key}`;
      
      if (field.type === "checkboxes") {
        const raw = formData[dataKey];
        const savedValues = Array.isArray(raw)
          ? raw.map(v => String(v).trim())
          : typeof raw === 'string'
            ? raw.split(',').map(v => v.trim()).filter(Boolean)
            : [];
        document.querySelectorAll(`input[name="${id}"]`).forEach(checkbox => {
          checkbox.checked = savedValues.includes(checkbox.value);
        });
      } else {
        const element = document.getElementById(id);
        if (element && formData[dataKey] !== undefined) {
          element.value = formData[dataKey];
        }
      }
    });
    
    // Track module switch - temporarily disabled to prevent 502 errors
    // trackUserActivity('module_switch', { 
    //   from_module: activeModule, 
    //   to_module: activeModule 
    // });
  }

  // Get saved addresses and neighborhoods from auth system
  function getSavedAddresses() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return [];
      
      // Try to get from auth system if available
      if (window.authSystem && window.authSystem.getSavedAddresses) {
        return window.authSystem.getSavedAddresses();
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem(`savedAddresses_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.log('Error getting saved addresses:', error);
      return [];
    }
  }

  function getSavedNeighborhoods() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) return [];
      
      // Try to get from auth system if available
      if (window.authSystem && window.authSystem.getSavedNeighborhoods) {
        return window.authSystem.getSavedNeighborhoods();
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem(`savedNeighborhoods_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.log('Error getting saved neighborhoods:', error);
      return [];
    }
  }

  // Save address to user's account
  async function saveAddressToAccount(address, label = '') {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('Please sign in to save addresses');
        return false;
      }

      // Try to save via auth system first
      if (window.authSystem && window.authSystem.saveAddress) {
        const success = await window.authSystem.saveAddress(address, label);
        if (success) {
          showMessage('Address saved successfully!', 'success');
          return true;
        }
      }

      // Fallback to localStorage
      const saved = getSavedAddresses();
      const newAddress = { id: Date.now(), value: address, label: label || address, created_at: new Date().toISOString() };
      saved.push(newAddress);
      localStorage.setItem(`savedAddresses_${currentUser.id}`, JSON.stringify(saved));
      
      showMessage('Address saved successfully!', 'success');
      return true;
    } catch (error) {
      console.log('Error saving address:', error);
      showMessage('Failed to save address', 'error');
      return false;
    }
  }

  // Save neighborhood to user's account
  async function saveNeighborhoodToAccount(neighborhood, label = '') {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('Please sign in to save neighborhoods');
        return false;
      }

      // Try to save via auth system first
      if (window.authSystem && window.authSystem.saveNeighborhood) {
        const success = await window.authSystem.saveNeighborhood(neighborhood, label);
        if (success) {
          showMessage('Neighborhood saved successfully!', 'success');
          return true;
        }
      }

      // Fallback to localStorage
      const saved = getSavedNeighborhoods();
      const newNeighborhood = { id: Date.now(), value: neighborhood, label: label || neighborhood, created_at: new Date().toISOString() };
      saved.push(newNeighborhood);
      localStorage.setItem(`savedNeighborhoods_${currentUser.id}`, JSON.stringify(saved));
      
      showMessage('Neighborhood saved successfully!', 'success');
      return true;
    } catch (error) {
      console.log('Error saving neighborhood:', error);
      showMessage('Failed to save neighborhood', 'error');
      return false;
    }
  }

  // Show message to user
  function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }

  // Minimal inline spinner helpers for async actions
  function ensureSpinnerStyles() {
    if (document.getElementById('btn-spinner-style')) return;
    const style = document.createElement('style');
    style.id = 'btn-spinner-style';
    style.textContent = `@keyframes spin{to{transform:rotate(360deg)}}.btn-spinner{display:inline-block;width:14px;height:14px;border:2px solid #d1d5db;border-top-color:#374151;border-radius:50%;animation:spin .6s linear infinite;margin-left:6px;vertical-align:middle;}`;
    document.head.appendChild(style);
  }

  function addSpinnerToButton(buttonEl) {
    if (!buttonEl) return;
    ensureSpinnerStyles();
    if (buttonEl.querySelector('.btn-spinner')) return;
    const spinner = document.createElement('span');
    spinner.className = 'btn-spinner';
    buttonEl.appendChild(spinner);
    buttonEl.setAttribute('aria-busy', 'true');
    buttonEl.disabled = true;
  }

  function removeSpinnerFromButton(buttonEl) {
    if (!buttonEl) return;
    const spinner = buttonEl.querySelector('.btn-spinner');
    if (spinner && spinner.parentNode) spinner.parentNode.removeChild(spinner);
    buttonEl.removeAttribute('aria-busy');
    buttonEl.disabled = false;
  }

  function renderForm() {
    // Base fields for the active module
    const allFields = Modules[activeModule].fields;

    // Conditionally include Open House fields only when the open_house_flyer template is active
    const fields = (activeModule === 'listing' && activeTemplate !== 'open_house_flyer')
      ? allFields.filter(f => !String(f.key || '').startsWith('Open_House') && f.key !== 'Hosting_Agent_Name' && f.key !== 'Contact_Info' && f.key !== 'Parking_Details')
      : allFields;

    formEl.innerHTML = fields.map(field => {
      const id = `f_${field.key}`;
      
      if (field.type === "select") {
        return `<label class="field"><span>${field.label}</span><select id="${id}"><option value="">Select ${field.label}</option>${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join("")}</select></label>`;
      }
      
      if (field.type === "combobox") {
        let options = field.options || [];
        
        // Add saved addresses/neighborhoods if applicable
        if (field.key === "Property_Address" || field.key === "Parcel_Address_or_APN") {
          const savedAddresses = getSavedAddresses();
          if (savedAddresses.length > 0) {
            options = [...savedAddresses.map(addr => addr.value), ...options];
          }
        }
        
        if (field.key === "Neighborhood" || field.key === "Target_Neighborhoods") {
          const savedNeighborhoods = getSavedNeighborhoods();
          if (savedNeighborhoods.length > 0) {
            options = [...savedNeighborhoods.map(nbhd => nbhd.value), ...options];
          }
        }
        
        return `<label class="field"><span>${field.label}</span><div class="combobox-container">
          <input type="text" id="${id}" list="${id}-list" placeholder="${field.placeholder || ''}">
          <datalist id="${id}-list">${options.map(opt => `<option value="${opt}">`).join("")}</datalist>
          ${field.key === "Property_Address" || field.key === "Parcel_Address_or_APN" ? 
            `<button type="button" class="save-btn" onclick="saveCurrentAddress('${id}')" title="Save this address">💾</button>` : ''}
          ${field.key === "Neighborhood" ? 
            `<button type="button" class="save-btn" onclick="saveCurrentNeighborhood('${id}')" title="Save this neighborhood">💾</button>` : ''}
        </div></label>`;
      }
      
      if (field.type === "checkboxes") {
        return `<fieldset class="field checkboxes"><legend>${field.label}</legend>${(field.options || []).map(opt => `<label class="checkbox-label"><input type="checkbox" name="${id}" value="${opt}"> <span class="checkbox-text">${opt}</span></label>`).join("")}</fieldset>`;
      }
      
      if (field.type === "textarea") {
        return `<label class="field"><span>${field.label}</span><textarea id="${id}" placeholder="${field.placeholder || ""}"></textarea></label>`;
      }
      
      const inputAttrs = [`type="${field.type}"`, `id="${id}"`, field.placeholder ? `placeholder="${field.placeholder}"` : "", field.min != null ? `min="${field.min}"` : "", field.max != null ? `max="${field.max}"` : "", field.step != null ? `step="${field.step}"` : ""].filter(Boolean).join(" ");
      
      if (field.suffix) {
        return `<label class="field"><span>${field.label}</span><div class="suffix" data-suffix="${field.suffix}"><input ${inputAttrs}></div></label>`;
      }
      
      return `<label class="field"><span>${field.label}</span><input ${inputAttrs}></label>`;
    }).join("");
    
    // Restore data after rendering
    restoreFormData();
  }

  function getValues() {
    const { fields } = Modules[activeModule];
    const values = {};
    
    fields.forEach(field => {
      const id = `f_${field.key}`;
      
      if (field.type === "checkboxes") {
        const checkedValues = Array.from(document.querySelectorAll(`input[name="${id}"]:checked`)).map(input => input.value);
        values[field.key] = checkedValues.length > 0 ? checkedValues.join(", ") : "";
      } else {
        const element = document.getElementById(id);
        if (element) {
          values[field.key] = element.value?.trim() || "";
        }
      }
    });
    
    return values;
  }

  function compile(template, values) {
    const result = template.replace(/\[([^\]]+)\]/g, (match, key) => {
      const value = values[key];
      return value && value.trim() ? value : `[${key}]`;
    });
    
    return result;
  }

  async function copyToClipboard() {
    const text = previewEl.textContent;
    if (!text) {
      alert("No prompt to copy. Please generate a prompt first.");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => copyBtn.textContent = "📋 Copy to Clipboard", 2000);
      
      // Track copy action - temporarily disabled to prevent 502 errors
      // trackUserActivity('prompt_copied', {
      //   module: activeModule,
      //   template: activeTemplate,
      //   prompt_length: text.length
      // });
    } catch (err) {
      alert("Failed to copy to clipboard. Please select and copy manually.");
    }
  }

  // Inject Saved Prompts section dynamically so we don't depend on HTML edits
  function ensureSavedPromptsSection() {
    let section = document.getElementById('saved-prompts');
    if (!section) {
      section = document.createElement('div');
      section.id = 'saved-prompts';
      section.className = 'saved-properties';
      section.style.display = 'none';
      const propertiesSection = document.getElementById('saved-properties');
      if (propertiesSection && propertiesSection.parentNode) {
        propertiesSection.parentNode.insertBefore(section, propertiesSection.nextSibling);
      } else {
        document.querySelector('.ai-prompt-builder')?.appendChild(section);
      }
    }
    return section;
  }

  async function loadSavedPrompts() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      ensureSavedPromptsSection();
      const section = document.getElementById('saved-prompts');
      const select = document.getElementById('prompt-select');
      const preview = document.getElementById('prompt-preview');
      const resp = await fetch('/.netlify/functions/get-user-prompts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id })
      });
      if (!resp.ok) { section.style.display = 'none'; return; }
      const prompts = await resp.json();
      if (!Array.isArray(prompts) || prompts.length === 0) { section.style.display = 'none'; return; }
      section.style.display = 'block';
      select.innerHTML = '<option value="">Select a saved prompt…</option>' + prompts.map(p => {
        const label = `${p.module || 'listing'} ${p.template || ''} — ${new Date(p.created_at).toLocaleString()}`;
        return `<option data-prompt="${encodeURIComponent(p.prompt || '')}" value="${p.id}">${label}</option>`;
      }).join('');
      select.onchange = () => {
        const opt = select.options[select.selectedIndex];
        const val = opt ? decodeURIComponent(opt.getAttribute('data-prompt') || '') : '';
        if (val) { preview.style.display = 'block'; preview.textContent = val; }
        else { preview.style.display = 'none'; preview.textContent = ''; }
      };
    } catch (e) {
      const section = document.getElementById('saved-prompts');
      if (section) section.style.display = 'none';
    }
  }

  async function savePrompt(buttonEl) {
    const text = previewEl.textContent;
    if (!text) {
      alert("No prompt to save. Please generate a prompt first.");
      return;
    }
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      showMessage('Please sign in to save prompts', 'error');
      return;
    }
    // Try to associate with a property if possible; allow saving without one
    const propertyId = await findOrCreateCurrentPropertyId();
    try {
      addSpinnerToButton(buttonEl || savePromptBtn);
      const resp = await fetch('/.netlify/functions/save-user-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          module: activeModule,
          template: activeTemplate,
          prompt: text,
          formData: getValues(),
          propertyId: propertyId || null
        })
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to save prompt');
      }
      showMessage('Prompt saved to your account!', 'success');
      await loadAllPrompts();
      displaySavedProperties();
    } catch (e) {
      showMessage(e.message || 'Failed to save prompt', 'error');
    } finally {
      removeSpinnerFromButton(buttonEl || savePromptBtn);
    }
  }

  function savePromptWrapper(e) { savePrompt(e?.target); }

  function generatePrompt() {
    const values = getValues();
    
    let template;
    if (activeModule === "listing" && Modules[activeModule].templates) {
      template = Modules[activeModule].templates[activeTemplate];
    } else {
      template = Modules[activeModule].template;
    }
    
    const compiledPrompt = compile(template, values);
    previewEl.textContent = compiledPrompt;
    previewContainer.style.display = "block";
    previewContainer.scrollIntoView({ behavior: "smooth" });
    
    // Track prompt generation - temporarily disabled to prevent 502 errors
    // trackUserActivity('prompt_generated', {
    //   module: activeModule,
    //   template: activeTemplate,
    //   fields_filled: Object.keys(values).filter(key => values[key] && values[key].trim()).length,
    //   total_fields: Object.keys(values).length
    // });
  }

  // Global functions for saving addresses and neighborhoods
  window.saveCurrentAddress = async function(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      showMessage('Please enter an address first', 'error');
      return;
    }
    
    const address = field.value.trim();
    const label = prompt('Enter a label for this address (optional):', address);
    
    if (label !== null) { // User didn't cancel
      await saveAddressToAccount(address, label);
    }
  };

  window.saveCurrentNeighborhood = async function(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      showMessage('Please enter a neighborhood first', 'error');
      return;
    }
    
    const neighborhood = field.value.trim();
    const label = prompt('Enter a label for this neighborhood (optional):', neighborhood);
    
    if (label !== null) { // User didn't cancel
      await saveNeighborhoodToAccount(neighborhood, label);
    }
  };

  window.previewPrompt = function(propertyId) {
    const select = document.getElementById(`prompt-select-${propertyId}`);
    const preview = document.getElementById(`prompt-preview-${propertyId}`);
    const pid = select.value;
    if (!pid) { preview.style.display='none'; preview.textContent=''; return; }
    const prompt = (promptsByProperty[propertyId] || []).find(p => String(p.id) === String(pid));
    if (prompt) { preview.style.display='block'; preview.textContent = prompt.prompt || ''; }
  };

  window.removePrompt = async function(propertyId, el) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      const select = document.getElementById(`prompt-select-${propertyId}`);
      const pid = select.value;
      if (!pid) { showMessage('Select a prompt first', 'error'); return; }
      addSpinnerToButton(el);
      const resp = await fetch('/.netlify/functions/delete-user-prompt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: currentUser.id, promptId: pid }) });
      if (!resp.ok) { const t = await resp.text(); throw new Error(t || 'Delete failed'); }
      showMessage('Prompt deleted', 'success');
      await loadAllPrompts();
      displaySavedProperties();
    } catch (e) { showMessage(e.message || 'Delete failed', 'error'); }
    finally { removeSpinnerFromButton(el); }
  };

  window.copySavedPrompt = async function(propertyId, el) {
    try {
      const select = document.getElementById(`prompt-select-${propertyId}`);
      if (!select) { showMessage('Select not found', 'error'); return; }
      const pid = select.value;
      if (!pid) { showMessage('Select a prompt first', 'error'); return; }
      const prompt = (promptsByProperty[propertyId] || []).find(p => String(p.id) === String(pid));
      const text = prompt?.prompt || '';
      if (!text) { showMessage('No prompt text to copy', 'error'); return; }
      await navigator.clipboard.writeText(text);
      if (el) {
        const previous = el.textContent;
        el.textContent = '✅';
        setTimeout(() => { el.textContent = '📋'; }, 1500);
      }
      showMessage('Copied to clipboard', 'success');
    } catch (e) {
      showMessage('Failed to copy', 'error');
    }
  };

  window.editPrompt = async function(propertyId) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) { showMessage('Please sign in to edit prompts', 'error'); return; }
      const select = document.getElementById(`prompt-select-${propertyId}`);
      const preview = document.getElementById(`prompt-preview-${propertyId}`);
      const btn = document.getElementById(`edit-prompt-btn-${propertyId}`);
      if (!select || !preview || !btn) return;
      if (preview.style.display !== 'block') { showMessage('Open Preview first to edit', 'info'); return; }

      const editing = btn.getAttribute('data-editing') === '1';
      if (!editing) {
        // Enter edit mode
        preview.setAttribute('contenteditable', 'true');
        preview.style.outline = '2px solid #d1d5db';
        btn.textContent = '💾';
        btn.setAttribute('title', 'Save');
        btn.setAttribute('aria-label', 'Save');
        btn.setAttribute('data-editing', '1');
        preview.focus();
        return;
      }

      // Save mode
      const promptId = select.value;
      if (!promptId) { showMessage('Select a prompt to edit', 'error'); return; }
      const existing = (promptsByProperty[propertyId] || []).find(p => String(p.id) === String(promptId));
      const updatedText = preview.textContent || '';
      addSpinnerToButton(btn);
      const resp = await fetch('/.netlify/functions/update-user-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, promptId, prompt: updatedText, module: existing?.module || null, template: existing?.template || null })
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to update prompt');
      }
      showMessage('Prompt updated', 'success');
      // Exit edit mode
      preview.removeAttribute('contenteditable');
      preview.style.outline = '';
      btn.textContent = '✏️';
      btn.setAttribute('title', 'Edit');
      btn.setAttribute('aria-label', 'Edit');
      btn.removeAttribute('data-editing');
      await loadAllPrompts();
      displaySavedProperties();
    } catch (e) {
      showMessage(e.message || 'Failed to update prompt', 'error');
    } finally {
      const btn = document.getElementById(`edit-prompt-btn-${propertyId}`);
      if (btn) removeSpinnerFromButton(btn);
    }
  };

  // Initialize the AI Prompt Builder
  function init() {
    // Set up module switching
    setupModuleSwitching();
    
    // Set up form generation
    setupFormGeneration();
    
    // Set up prompt generation
    setupPromptGeneration();
    
    // Load saved properties if user is authenticated
    if (window.authSystem && window.authSystem.isAuthenticated) {
      loadSavedProperties();
    }
    
    // Listen for authentication events
    window.addEventListener('userSignedIn', () => {
      console.log('User signed in, loading saved properties...');
      loadSavedProperties();
    });
    
    window.addEventListener('userSignedOut', () => {
      console.log('User signed out, clearing saved properties...');
      savedProperties = [];
      displaySavedProperties();
    });
  }

  picker.addEventListener("click", (e) => {
    const moduleBtn = e.target.closest(".module-btn");
    if (!moduleBtn) return;
    
    const moduleKey = moduleBtn.dataset.module;
    if (!moduleKey || !Modules[moduleKey]) return;
    
    // Save current form data before switching
    saveCurrentFormData();
    
    // Update active module and UI
    document.querySelectorAll(".module-btn").forEach(btn => btn.classList.remove("active"));
    moduleBtn.classList.add("active");
    
    activeModule = moduleKey;
    
    // Show/hide template selector based on module
    if (moduleKey === "listing") {
      templateSelector.style.display = "block";
    } else {
      templateSelector.style.display = "none";
    }
    
    renderForm();
    previewEl.textContent = "";
    previewContainer.style.display = "none";
    updateSaveButtonLabel();
  });
  
  // Template selection for listing module
  templateSelector.addEventListener("click", (e) => {
    const templateBtn = e.target.closest(".template-btn");
    if (!templateBtn) return;
    
    const templateKey = templateBtn.dataset.template;
    if (!templateKey) return;
    
    // Update active template and UI
    document.querySelectorAll(".template-btn").forEach(btn => btn.classList.remove("active"));
    templateBtn.classList.add("active");
    
    activeTemplate = templateKey;
    // Re-render the form so flyer-only fields show/hide appropriately
    renderForm();
    // Clear previous preview when switching templates
    previewEl.textContent = "";
    previewContainer.style.display = "none";
    
    // Track template selection - temporarily disabled to prevent 502 errors
    // trackUserActivity('template_selected', {
    //   module: activeModule,
    //   template: templateKey
    // });
  });

  generateBtn.addEventListener("click", generatePrompt);
  copyBtn.addEventListener("click", copyToClipboard);
  savePromptBtn.addEventListener("click", savePromptWrapper);
  savePropertyBtn.addEventListener("click", saveCurrentProperty);

  // Update save button label per module
  function updateSaveButtonLabel() {
    const map = {
      listing: '💾 Save Property',
      staging: '💾 Save Home Staging Template',
      investment: '💾 Save Investment Analysis',
      zoning: '💾 Save Zoning Research',
      calendar: '💾 Save Content Calendar'
    };
    const label = map[activeModule] || '💾 Save Item';
    if (savePropertyBtn) savePropertyBtn.textContent = label;
  }

  // Initialize the form
  renderForm();
  
  // Show template selector for listing module (default)
  templateSelector.style.display = "block";
  updateSaveButtonLabel();
  
  // Load saved properties and prompts on page load
  loadSavedProperties();
  // Ensure and load prompts list on load
  ensureSavedPromptsSection();
  loadSavedPrompts();
});
