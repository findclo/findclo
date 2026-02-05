const SPANISH_STOPWORDS = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'un', 'una',
    'con', 'para', 'por', 'es', 'al', 'lo', 'su', 'se', 'que', 'o',
    'como', 'más', 'mas', 'muy', 'mi', 'te', 'tu', 'nos'
]);

const PLURAL_RULES: [RegExp, string][] = [
    [/ces$/i, 'z'],        // pantalonces → no, but: luces → luz
    [/iones$/i, 'ión'],    // pantalones won't match, but: calzones → calzón
    [/eses$/i, 'és'],      // not common but safe
    [/es$/i, ''],           // pantalones → pantalon, botines → botin
    [/s$/i, ''],            // remeras → remera, botas → bota, camisas → camisa
];

function singularize(word: string): string {
    if (word.length <= 3) return word;

    for (const [pattern, replacement] of PLURAL_RULES) {
        if (pattern.test(word)) {
            return word.replace(pattern, replacement);
        }
    }
    return word;
}

export interface NormalizedQuery {
    forEmbedding: string;
    forFTS: string;
}

export function normalizeSearchQuery(raw: string): NormalizedQuery {
    const cleaned = raw.trim().toLowerCase();

    const words = cleaned
        .split(/\s+/)
        .filter(w => w.length > 0 && !SPANISH_STOPWORDS.has(w));

    if (words.length === 0) {
        return { forEmbedding: cleaned, forFTS: cleaned };
    }

    const singularized = words.map(w => singularize(w));
    const normalized = singularized.join(' ');

    return {
        forEmbedding: normalized,
        forFTS: normalized
    };
}

export function enrichQueryForEmbedding(normalizedQuery: string): string {
    return `Producto de indumentaria: ${normalizedQuery}`;
}
