<?php

function growpal_site_base_url(): string {
    return rtrim(getenv('GROWPAL_SITE_URL') ?: '', '/');
}

function growpal_canonical_url(string $path, ?string $legacyFallback = null): string {
    $normalizedPath = '/' . ltrim($path, '/');
    $baseUrl = growpal_site_base_url();

    if ($baseUrl !== '') {
        return $baseUrl . $normalizedPath;
    }

    return $legacyFallback ?? ltrim($normalizedPath, '/');
}

function growpal_is_canonical_path(string $expectedPath, string $currentPage): bool {
    $normalizedExpected = trim($expectedPath, '/');
    $normalizedCurrent = trim($currentPage, '/');

    return $normalizedExpected !== '' && ($normalizedCurrent === $normalizedExpected || $normalizedCurrent === basename($normalizedExpected));
}
