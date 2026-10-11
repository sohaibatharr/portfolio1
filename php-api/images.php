<?php
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = 'https://YOUR-DOMAIN.com';

if ($origin !== '') {
    if ($origin !== $allowedOrigin) {
        http_response_code(403);
        echo json_encode(['error' => 'Origin not allowed']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$configPath = dirname(__DIR__, 2) . '/cloudinary-config.php';
if (!file_exists($configPath)) {
    $configPath = __DIR__ . '/cloudinary-config.php';
}

if (file_exists($configPath)) {
    require $configPath;
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Cloudinary secret not configured']);
    exit;
}

$cloudName = defined('CLOUDINARY_CLOUD_NAME') ? CLOUDINARY_CLOUD_NAME : 'dzo6iy5my';
$apiKey = defined('CLOUDINARY_API_KEY') ? CLOUDINARY_API_KEY : '274451154234168';
$apiSecret = defined('CLOUDINARY_API_SECRET') ? CLOUDINARY_API_SECRET : '';

if ($apiSecret === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Cloudinary secret not configured']);
    exit;
}

$cacheFile = __DIR__ . '/.images-cache.json';
$cursor = isset($_GET['cursor']) && is_string($_GET['cursor']) ? trim($_GET['cursor']) : '';

if ($cursor === '' && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge < 300) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if (is_array($cached) && isset($cached['images'])) {
            echo json_encode($cached);
            exit;
        }
    }
}

$expressions = [
    'asset_folder="Thumbnails" AND resource_type:image',
    'folder="Thumbnails" AND resource_type:image',
];

$payload = [
    'max_results' => 50,
    'sort_by' => json_encode(['created_at' => 'desc']),
];

if ($cursor !== '') {
    $payload['next_cursor'] = $cursor;
}

$data = null;
foreach ($expressions as $expression) {
    $body = array_merge($payload, ['expression' => $expression]);
    $ch = curl_init('https://api.cloudinary.com/v1_1/' . $cloudName . '/resources/search');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($body));
    curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $apiSecret);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
    $payloadJson = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($payloadJson === false || $httpStatus >= 400) {
        continue;
    }

    $decoded = json_decode($payloadJson, true);
    if (is_array($decoded) && isset($decoded['resources'])) {
        $data = $decoded;
        break;
    }
}

if (!is_array($data) || !isset($data['resources'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load images']);
    exit;
}

$result = [
    'images' => array_map(function ($item) {
        return [
            'publicId' => $item['public_id'] ?? '',
            'width' => (int) ($item['width'] ?? 0),
            'height' => (int) ($item['height'] ?? 0),
            'format' => $item['format'] ?? '',
        ];
    }, $data['resources']),
    'nextCursor' => $data['next_cursor'] ?? null,
];

if ($cursor === '') {
    file_put_contents($cacheFile, json_encode($result));
}

echo json_encode($result);
