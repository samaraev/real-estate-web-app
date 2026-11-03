import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Natural-language property search: turns a Russian (or English) description
 * into listing filters. Nothing is stored; the client applies the filters.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (text.length < 3) {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 300) {
      return Response.json({ error: 'text is too long' }, { status: 400 });
    }

    const prompt = `You convert a real-estate search request into structured filters for a Russian marketplace.

User request (language: ${body.language === 'en' ? 'English' : 'Russian'}):
"""${text}"""

Rules:
- deal_type: "rent" when the user wants to rent / снять / арендовать; "sale" when buying / купить / purchase. Default "sale".
- city: one of "Москва", "Санкт-Петербург", "Казань", "Новосибирск" or null. "СПб"/"Питер" → "Санкт-Петербург".
- rooms: 0 for студия/studio, 1..5 for one/two/three-room (однушка/двушка/трёшка). null if not stated.
- price_max / price_min: numbers in RUB. "до 80 000" → price_max 80000. "80 тысяч" → 80000. "8 млн" → 8000000. For rent the budget is monthly.
- metro / district: keep the Russian name exactly if mentioned, else null.
- category: "apartment" | "house" | "room" | "commercial" | "land" | null. Квартира → apartment, дом/коттедж → house, комната → room, офис/помещение → commercial, участок → land.
- pets: true if animals allowed/with pets requested (с животными, с собакой, с котом), false only if explicitly forbidden (без животных), otherwise null.
- children: true if children mentioned, otherwise null.
- summary: one short phrase in the user's language describing the parsed filters.

Return only the JSON object.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          deal_type: { type: 'string', enum: ['sale', 'rent'] },
          city: { type: 'string' },
          rooms: { type: 'number' },
          price_min: { type: 'number' },
          price_max: { type: 'number' },
          metro: { type: 'string' },
          district: { type: 'string' },
          category: { type: 'string', enum: ['apartment', 'house', 'room', 'commercial', 'land'] },
          pets: { type: 'boolean' },
          children: { type: 'boolean' },
          summary: { type: 'string' },
        },
      },
    });

    return Response.json(result || {});
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}