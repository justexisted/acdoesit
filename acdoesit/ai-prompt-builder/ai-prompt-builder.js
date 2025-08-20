// AI Prompt Builder for San Diego Real Estate
document.addEventListener("DOMContentLoaded", () => {
  const Modules = {
    listing: {
      fields: [
        { key: "Property_Address", type: "text", label: "Property Address", required: true, placeholder: "123 Example St" },
        { key: "Neighborhood", type: "combobox", label: "Neighborhood", required: true, options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"], placeholder: "Type or select a neighborhood" },
        { key: "Property_Type", type: "select", label: "Property Type", required: true, options: ["Condo", "Single-Family Home", "Townhouse", "Multi-Unit", "Luxury Estate"] },
        { key: "Architectural_Style", type: "select", label: "Architectural Style", required: true, options: ["Craftsman", "Spanish Revival", "Mid-Century Modern", "Contemporary", "Mediterranean", "Bungalow", "Ranch", "Modern Coastal"] },
        { key: "Beds", type: "number", label: "Beds", required: true, min: 0, step: 1 },
        { key: "Baths", type: "number", label: "Baths", required: true, min: 0, step: 0.5 },
        { key: "Square_Footage", type: "number", label: "Square Footage", required: true, min: 100, step: 1, suffix: "sq ft" },
        { key: "Key_Features", type: "textarea", label: "Key Features (bullets)", required: true, placeholder: "• Renovated kitchen\n• Ocean views\n• Private backyard" },
        { key: "Nearby_Amenities", type: "checkboxes", label: "Nearby Amenities", options: ["Walkable to cafes", "Near Balboa Park", "Top-rated schools", "Easy freeway access", "Close to trolley", "Beach access", "Farmers market nearby"] },
        { key: "Target_Audience", type: "combobox", label: "Target Audience", required: true, options: ["First-time homebuyers", "Young professionals", "Growing families", "Retirees", "Investors"], placeholder: "Type or select target audience" },
        { key: "Tone", type: "select", label: "Tone", required: true, options: ["Luxurious & Elegant", "Modern & Trendy", "Cozy & Charming", "Professional & Direct"] }
      ],
      templates: {
        full: "Act as an expert San Diego real estate copywriter. Write a compelling property listing description for a [Property_Type] located in the [Neighborhood] neighborhood of San Diego. The property has a [Architectural_Style] design.\n\nProperty Details:\nAddress: [Property_Address]\nSpecs: [Beds] bedrooms, [Baths] bathrooms, [Square_Footage] sq. ft.\nKey Features:\n[Key_Features]\n\nNeighborhood Vibe: This home is perfectly positioned in [Neighborhood] with convenient access to [Nearby_Amenities].\n\nInstructions:\n• Craft a captivating headline.\n• Write a main body (2-3 paragraphs) that tells a story about living in the home, weaving in the key features and the benefits of the [Neighborhood] location.\n• The tone of the description must be [Tone].\n• The description should appeal directly to [Target_Audience].\n• End with a strong call to action to schedule a showing.\n• Ensure the description is optimized for SEO using keywords like \"San Diego real estate,\" \"homes for sale in [Neighborhood],\" and \"[Beds] bedroom home in San Diego.\"",
        zillow: "Act as an expert San Diego real estate copywriter. Write a concise, compelling property listing description for Zillow (max 2000 characters) for a [Property_Type] located in the [Neighborhood] neighborhood of San Diego.\n\nProperty Details:\nAddress: [Property_Address]\nSpecs: [Beds] bedrooms, [Baths] bathrooms, [Square_Footage] sq. ft.\nKey Features:\n[Key_Features]\n\nNeighborhood: [Neighborhood] - [Nearby_Amenities]\n\nInstructions:\n• Write a compelling but concise description (under 2000 characters)\n• Focus on key selling points and neighborhood benefits\n• Include [Nearby_Amenities] as specific location advantages\n• Appeal to [Target_Audience] with [Tone] tone\n• End with a call to action\n• Use SEO keywords: \"San Diego real estate,\" \"homes for sale in [Neighborhood]\"",
        instagram: "Act as a social media expert for San Diego real estate. Write a compelling Instagram post caption for a [Property_Type] in [Neighborhood] (max 2200 characters).\n\nProperty Highlights:\n🏠 [Beds] bed, [Baths] bath, [Square_Footage] sq ft [Property_Type]\n📍 [Neighborhood] neighborhood\n✨ [Key_Features]\n🚶‍♀️ [Nearby_Amenities]\n\nInstructions:\n• Write an engaging, Instagram-friendly caption\n• Use emojis strategically but don't overdo it\n• Highlight the lifestyle benefits of [Neighborhood]\n• Mention specific [Nearby_Amenities] as selling points\n• Appeal to [Target_Audience]\n• Include relevant hashtags: #SanDiegoRealEstate #[Neighborhood]Homes #[Beds]BedroomHome\n• End with a call to action to DM for more info"
      }
    },
    investment: {
      fields: [
        { key: "Property_Address", type: "text", label: "Property Address", required: true, placeholder: "123 Example St" },
        { key: "Purchase_Price", type: "number", label: "Purchase Price ($)", required: true, min: 0, step: 1000 },
        { key: "Down_Payment_Percentage", type: "number", label: "Down Payment (%)", required: true, min: 0, max: 100, step: 0.5 },
        { key: "Interest_Rate", type: "number", label: "Interest Rate (%)", required: true, min: 0, max: 100, step: 0.01 },
        { key: "Loan_Term", type: "number", label: "Loan Term (years)", required: true, min: 1, max: 40, step: 1 },
        { key: "Gross_Monthly_Rent", type: "number", label: "Gross Monthly Rent ($)", required: true, min: 0, step: 50 },
        { key: "Estimated_Monthly_Expenses", type: "textarea", label: "Monthly Expenses (list)", required: true, placeholder: "Property Tax: $...\nInsurance: $...\nHOA: $...\nVacancy: %...\nRepairs: $...\nCapEx: $...\nManagement Fee: %..." },
        { key: "Closing_Costs", type: "number", label: "Closing Costs ($)", required: true, min: 0, step: 100 }
      ],
      template: "Act as a San Diego real estate investment analyst. I need a preliminary financial analysis for a potential rental property. Here is the data:\n\nFinancial Data:\nProperty Address: [Property_Address]\nPurchase Price: $[Purchase_Price]\nDown Payment: [Down_Payment_Percentage]%\nLoan Terms: [Loan_Term] years at [Interest_Rate]% interest.\nClosing Costs: $[Closing_Costs]\nIncome: Gross Monthly Rent is $[Gross_Monthly_Rent].\nMonthly Expenses: [Estimated_Monthly_Expenses]\n\nAnalysis Required:\nPlease calculate and present the following metrics in a clear, easy-to-read table:\n• Total Cash Needed to Close: (Down Payment + Closing Costs).\n• Monthly Mortgage Payment: (Principal & Interest).\n• Monthly Cash Flow: (Gross Rent - All Monthly Expenses - Mortgage Payment).\n• Capitalization Rate (Cap Rate): (Net Operating Income / Purchase Price).\n• Cash-on-Cash Return: (Annual Cash Flow / Total Cash Needed to Close).\n• Gross Rent Multiplier (GRM).\n\nConclude with a brief, one-paragraph summary of the investment's potential based on these numbers."
    },
    zoning: {
      fields: [
        { key: "Parcel_Address_or_APN", type: "text", label: "Parcel Address or APN", required: true, placeholder: "123 Example St or 123-456-78-90" },
        { key: "Current_Zoning_Code", type: "text", label: "Current Zoning Code (e.g., RM-1-1)", required: true, placeholder: "RM-1-1, RS-1-7, etc." },
        { key: "Lot_Size_Acres", type: "number", label: "Lot Size (acres)", required: true, min: 0, step: 0.01 },
        { key: "Proposed_Use", type: "select", label: "Proposed Use", required: true, options: ["Multifamily Residential", "Mixed-Use", "Commercial Retail", "Office", "Industrial", "ADU/Small Lot"] }
      ],
      template: "Act as a land use consultant specializing in the San Diego Municipal Code. I am conducting a preliminary feasibility study for a property.\n\nProperty Information:\nLocation: [Parcel_Address_or_APN]\nLot Size: [Lot_Size_Acres] acres\nZoning Designation: [Current_Zoning_Code]\nProposed Use: [Proposed_Use]\n\nTask: Based on the San Diego Municipal Code for zone [Current_Zoning_Code], provide a summary report covering the following key development standards:\n• Permitted Uses: What uses are allowed by right for this zone?\n• Density: What is the maximum number of dwelling units allowed per acre?\n• Setbacks: What are the required front, side, and rear yard setbacks?\n• Maximum Height: What is the maximum building height allowed?\n• Lot Coverage: What is the maximum percentage of the lot that can be covered by structures?\n• Parking Requirements: What are the general off-street parking requirements for a [Proposed_Use] project?\n\nPlease present this information in a clear, bulleted list. Conclude with a sentence on any potential red flags or major considerations for this zoning type."
    },
    staging: {
      fields: [
        { key: "Neighborhood", type: "combobox", label: "Neighborhood", required: true, options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"], placeholder: "Type or select a neighborhood" },
        { key: "Architectural_Style", type: "select", label: "Architectural Style", required: true, options: ["Craftsman", "Spanish Revival", "Mid-Century Modern", "Contemporary", "Mediterranean", "Bungalow", "Ranch", "Modern Coastal"] },
        { key: "Property_Condition", type: "select", label: "Property Condition", required: true, options: ["Vacant", "Occupied - needs decluttering", "Outdated finishes"] },
        { key: "Target_Buyer_Profile", type: "text", label: "Target Buyer Profile", required: true, placeholder: "e.g., Young tech professionals" },
        { key: "Budget_Level", type: "select", label: "Budget Level", required: true, options: ["Budget-friendly (DIY)", "Mid-Range (partial professional)", "High-End (full professional)"] },
        { key: "Rooms_To_Stage", type: "checkboxes", label: "Rooms to Stage", options: ["Living Room", "Kitchen", "Primary Bedroom", "Secondary Bedroom", "Home Office", "Dining Room", "Patio/Outdoor"] }
      ],
      template: "Act as a professional home stager with expertise in the San Diego market. Create a detailed staging plan for a [Architectural_Style] home in the [Neighborhood] neighborhood.\n\nStaging Context:\n• The property is currently [Property_Condition].\n• The target buyer is [Target_Buyer_Profile].\n• The staging budget is [Budget_Level].\n• We need to focus on staging the following rooms: [Rooms_To_Stage].\n\nInstructions:\nFor each selected room, provide a room-by-room plan that includes:\n• Core Theme: Define the overall aesthetic (e.g., \"Modern Coastal,\" \"Bohemian Craftsman,\" \"Minimalist Mid-Century\").\n• Color Palette: Suggest 3–4 complementary colors for decor, textiles, and art.\n• Furniture Recommendations: Suggest key furniture pieces and an ideal layout to maximize space and flow.\n• Decor & Accessory List: Provide a checklist of essential decor items (area rugs, throw pillows, artwork, plants, lighting).\n• Pro Tip: Include one specific tip that aligns the [Architectural_Style] with the lifestyle of the [Neighborhood] (e.g., for a North Park Craftsman, suggest a cozy reading nook)."
    },
    calendar: {
      fields: [
        { key: "Target_Neighborhoods", type: "checkboxes", label: "Target Neighborhoods", required: true, options: ["North Park", "La Jolla", "Gaslamp", "Point Loma", "Pacific Beach", "Hillcrest", "Little Italy", "South Park", "Mission Hills", "Ocean Beach", "University City", "Carmel Valley", "Rancho Bernardo", "Clairemont", "Encinitas", "Del Mar", "Chula Vista"] },
        { key: "Social_Media_Platform", type: "select", label: "Platform", required: true, options: ["Instagram", "Facebook"] },
        { key: "Content_Pillars", type: "checkboxes", label: "Content Pillars", required: true, options: ["Market Updates", "Local Events", "Neighborhood Spotlights", "Real Estate Tips", "Client Testimonials"] },
        { key: "Month", type: "select", label: "Month", required: true, options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }
      ],
      template: "Act as a social media marketing strategist for a top San Diego realtor. Create a one-month content calendar for [Month] to be posted on [Social_Media_Platform]. The realtor's brand is focused on being a local expert for the following neighborhoods: [Target_Neighborhoods]. The content strategy should be built around these pillars: [Content_Pillars].\n\nTask: Generate a 4-week content calendar in a table format with the columns: \"Day of Week,\" \"Content Pillar,\" \"Post Idea/Caption,\" and \"Hashtag Suggestions.\"\n\nRequirements:\n• Provide 3–4 post ideas per week.\n• Market Updates should reference San Diego–specific trends.\n• Local Events should mention real events happening in [Month] in or near [Target_Neighborhoods].\n• Neighborhood Spotlights should feature specific parks, coffee shops, or hidden gems in [Target_Neighborhoods].\n• Hashtag Suggestions must include a mix of broad San Diego hashtags (e.g., #SanDiegoRealEstate) and hyperlocal ones (e.g., #NorthParkLiving, #LaJollaHomes)."
    }
  };

  let activeModule = "listing";
  let activeTemplate = "full"; // For listing module templates
  let formData = {}; // Store form data across module switches
  
  const picker = document.getElementById("module-picker");
  const formEl = document.getElementById("module-form");
  const templateSelector = document.getElementById("template-selector");
  const previewEl = document.getElementById("preview");
  const previewContainer = document.getElementById("preview-container");
  const generateBtn = document.getElementById("generate-btn");
  const copyBtn = document.getElementById("copy-btn");
  const saveBtn = document.getElementById("save-btn");

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
        const savedValues = formData[dataKey] || [];
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
  }

  function renderForm() {
    const { fields } = Modules[activeModule];
    formEl.innerHTML = fields.map(field => {
      const id = `f_${field.key}`;
      const requiredClass = field.required ? "required" : "";
      
      if (field.type === "select") {
        return `<label class="field ${requiredClass}"><span>${field.label}</span><select id="${id}" ${field.required ? "required" : ""}><option value="">Select ${field.label}</option>${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join("")}</select></label>`;
      }
      
      if (field.type === "combobox") {
        return `<label class="field ${requiredClass}"><span>${field.label}</span><div class="combobox-container"><input type="text" id="${id}" list="${id}-list" placeholder="${field.placeholder || ''}" ${field.required ? "required" : ""}><datalist id="${id}-list">${(field.options || []).map(opt => `<option value="${opt}">`).join("")}</datalist></div></label>`;
      }
      
      if (field.type === "checkboxes") {
        return `<fieldset class="field checkboxes ${requiredClass}"><legend>${field.label}</legend>${(field.options || []).map(opt => `<label class="checkbox-label"><input type="checkbox" name="${id}" value="${opt}"> <span class="checkbox-text">${opt}</span></label>`).join("")}</fieldset>`;
      }
      
      if (field.type === "textarea") {
        return `<label class="field ${requiredClass}"><span>${field.label}</span><textarea id="${id}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea></label>`;
      }
      
      const inputAttrs = [`type="${field.type}"`, `id="${id}"`, field.placeholder ? `placeholder="${field.placeholder}"` : "", field.required ? "required" : "", field.min != null ? `min="${field.min}"` : "", field.max != null ? `max="${field.max}"` : "", field.step != null ? `step="${field.step}"` : ""].filter(Boolean).join(" ");
      
      if (field.suffix) {
        return `<label class="field ${requiredClass}"><span>${field.label}</span><div class="suffix" data-suffix="${field.suffix}"><input ${inputAttrs}></div></label>`;
      }
      
      return `<label class="field ${requiredClass}"><span>${field.label}</span><input ${inputAttrs}></label>`;
    }).join("");
    
    // Restore data after rendering
    restoreFormData();
  }

  function getValues() {
    const { fields } = Modules[activeModule];
    const values = {};
    
    console.log("DEBUG - getValues called for module:", activeModule);
    console.log("DEBUG - Fields:", fields);
    
    fields.forEach(field => {
      const id = `f_${field.key}`;
      console.log("DEBUG - Processing field:", field.key, "with ID:", id);
      
      if (field.type === "checkboxes") {
        const checkboxes = document.querySelectorAll(`input[name="${id}"]`);
        console.log("DEBUG - Found checkboxes:", checkboxes.length);
        const checkedValues = Array.from(checkboxes).filter(input => input.checked).map(input => input.value);
        console.log("DEBUG - Checked values for", field.key, ":", checkedValues);
        values[field.key] = checkedValues.length > 0 ? checkedValues.join(", ") : "";
        console.log("DEBUG - Final value for", field.key, ":", values[field.key]);
      } else {
        const element = document.getElementById(id);
        if (element) {
          values[field.key] = element.value?.trim() || "";
          console.log("DEBUG - Value for", field.key, ":", values[field.key]);
        }
      }
    });
    
    console.log("DEBUG - Final values object:", values);
    return values;
  }

  function compile(template, values) {
    console.log("DEBUG - compile called with template:", template);
    console.log("DEBUG - compile called with values:", values);
    
    const result = template.replace(/\[([^\]]+)\]/g, (match, key) => {
      const value = values[key];
      console.log("DEBUG - Replacing", match, "with key:", key, "value:", value);
      return value && value.trim() ? value : `[${key}]`;
    });
    
    console.log("DEBUG - compile result:", result);
    return result;
  }

  function generatePrompt() {
    const values = getValues();
    console.log("DEBUG - All captured values:", values);
    console.log("DEBUG - Nearby_Amenities specifically:", values.Nearby_Amenities);
    
    let template;
    if (activeModule === "listing" && Modules[activeModule].templates) {
      template = Modules[activeModule].templates[activeTemplate];
    } else {
      template = Modules[activeModule].template;
    }
    
    const compiledPrompt = compile(template, values);
    console.log("DEBUG - Final compiled prompt:", compiledPrompt);
    previewEl.textContent = compiledPrompt;
    previewContainer.style.display = "block";
    previewContainer.scrollIntoView({ behavior: "smooth" });
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
      setTimeout(() => copyBtn.textContent = "Copy to Clipboard", 2000);
    } catch (err) {
      alert("Failed to copy to clipboard. Please select and copy manually.");
    }
  }

  function saveToAccount() {
    const text = previewEl.textContent;
    if (!text) {
      alert("No prompt to save. Please generate a prompt first.");
      return;
    }
    alert("Save functionality would integrate with your Supabase prompt_sessions table. For now, the prompt is ready to copy.");
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
  });

  generateBtn.addEventListener("click", generatePrompt);
  copyBtn.addEventListener("click", copyToClipboard);
  saveBtn.addEventListener("click", saveToAccount);

  // Initialize the form
  renderForm();
  
  // Show template selector for listing module (default)
  templateSelector.style.display = "block";
});
