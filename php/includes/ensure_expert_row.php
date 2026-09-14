<?php
/**
 * Ensures a profile row exists in `experts` for staff with role expert.
 * Safe to call on every login; uses upsert on user_id.
 */
function ensureExpertRow(PDO $conn, int $userId, string $displayName): void
{
    $dn = mb_substr(trim($displayName), 0, 200);
    if ($dn === '') {
        $dn = 'Expert';
    }
    try {
        $stmt = $conn->prepare(
            'INSERT INTO experts (user_id, display_name) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)'
        );
        $stmt->execute([$userId, $dn]);
    } catch (PDOException $e) {
        error_log('GrowPal ensureExpertRow: ' . $e->getMessage());
    }
}
