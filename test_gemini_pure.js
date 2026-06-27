require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const prompt = `User query would be for real estate data finder. like "looking for a buying house in 2.5k in riverview with three bedrooms" sometime it would be only few things, so if there is nothing to add in value just pass null or -1. Answer in json only nothing else. 
        Strucutre Mapping values: 'sale' cateogry match these words (buy, sale, purcahse, get), 'rent' category match these words (rent, lease), 'land' category match these words (land, plot), 'multi' category match these words (multi, duplex, triplex), 'commercial' category match these words (commercial, office, shop), 'commercial-lease' category match these words (commercial-lease, office-lease, shop-lease)
        About Address: some would type "area", "place", "city", "county", "state", "country" or "zip" so you have to find the address from these words, not include these words in address
        Style: some would type "flat", "banglow", "house", "villa", "condo", "traditional", "split level", "colonial", "contemporary", "modern", "ranch", "cottage", "victorian", "mediterranean", "craftsman"
        Mapped Style: 'flat' match these words (flat, apartment), 'banglow' match these words (banglow, house), 'villa' match these words (villa, mansion), 'condo' match these words (condo, condominium), 'traditional' match these words (traditional, classic), 'split level' match these words (split level, split-level), 'colonial' match these words (colonial, colonial-style), 'contemporary' match these words (contemporary, modern), 'ranch' match these words (ranch, ranch-style), 'cottage' match these words (cottage, cottage-style), 'victorian' match these words (victorian, victorian-style), 'mediterranean' match these words (mediterranean, mediterranean-style), 'craftsman' match these words (craftsman, craftsman-style)
        Latitude and Longitude: if user provide latitude and longitude then use latitude and longitude, and skip all addresses
        

Query: looking for a house $150000`;

  try {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: {
                  type: 'OBJECT',
                  properties: {
                      category: { type: 'STRING', enum: ['sale', 'rent', 'land', 'multi', 'commercial', 'commercial-lease'] },
                      address: { type: 'STRING' },
                      price: { type: 'INTEGER' },
                      bedrooms: { type: 'INTEGER' },
                      style: { type: 'STRING', enum: ['flat', 'banglow', 'villa', 'condo', 'traditional', 'split level', 'colonial', 'contemporary', 'modern', 'ranch', 'cottage', 'victorian', 'mediterranean', 'craftsman'] },
                      sqft: { type: 'INTEGER' },
                      lat: { type: 'NUMBER' },
                      long: { type: 'NUMBER' }
                  }
              }
          }
      });
      console.log('Response:', response.text);
  } catch(e) {
      console.error(e);
  }
}
test();
