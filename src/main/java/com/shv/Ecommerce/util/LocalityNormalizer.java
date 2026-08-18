package com.shv.Ecommerce.util;

import java.text.Normalizer;
import java.util.List;

public final class LocalityNormalizer {

    private static final List<String> PREFIXES = List.of(
            "municipiul ", "orasul ", "comuna ", "sat ", "sectorul "
    );

    private LocalityNormalizer() {}

    /**
     * Normalizes a Romanian locality name for matching: lowercase, diacritics stripped,
     * administrative prefixes (Municipiul/Orasul/Comuna/Sat/Sectorul) removed, and all
     * punctuation collapsed. E.g. "Municipiul Bucuresti" -> "bucuresti".
     */
    public static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String s = Normalizer.normalize(value.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim();
        for (String prefix : PREFIXES) {
            if (s.startsWith(prefix)) {
                s = s.substring(prefix.length()).trim();
                break;
            }
        }
        return s.replaceAll("[^a-z0-9]+", " ").trim();
    }
}