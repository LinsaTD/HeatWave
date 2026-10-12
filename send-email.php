<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void
{
	http_response_code($status);
	echo json_encode($payload);
	exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
	respond(405, ['success' => false, 'message' => 'This endpoint accepts POST requests only.']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 20000) {
	respond(400, ['success' => false, 'message' => 'The submitted form data is invalid.']);
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
	respond(400, ['success' => false, 'message' => 'The submitted form data is invalid.']);
}

$readField = static function (string $key, int $limit) use ($data): string {
	$value = $data[$key] ?? '';
	if (!is_string($value) && !is_numeric($value)) {
		return '';
	}

	$value = trim(strip_tags((string) $value));
	return strlen($value) <= $limit ? $value : '';
};

$formType = $readField('form_type', 20);
$name = preg_replace('/[\r\n]+/', ' ', $readField('name', 120)) ?? '';
$email = $readField('email', 254);
$phone = preg_replace('/[\r\n]+/', ' ', $readField('phone', 60)) ?? '';
$message = $readField('message', 5000);

if (!in_array($formType, ['contact', 'callback'], true) || $name === '' || $message === '') {
	respond(422, ['success' => false, 'message' => 'Please complete the required form fields.']);
}

if (($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false)
	|| ($formType === 'contact' && $email === '')
	|| ($formType === 'callback' && $phone === '')) {
	respond(422, ['success' => false, 'message' => 'Please check your email address and contact details.']);
}

if (!function_exists('mail')) {
	respond(503, ['success' => false, 'message' => 'PHP mail is not enabled on this hosting server.']);
}

$serverName = strtolower(preg_replace('/[^a-zA-Z0-9.-]/', '', (string) ($_SERVER['SERVER_NAME'] ?? '')) ?? '');
$fromEmail = getenv('MAIL_FROM') ?: ($serverName !== '' ? 'no-reply@' . $serverName : '');
if (filter_var($fromEmail, FILTER_VALIDATE_EMAIL) === false) {
	respond(503, ['success' => false, 'message' => 'Configure a valid MAIL_FROM address on the PHP hosting server.']);
}

$subject = $formType === 'callback' ? 'Website callback request' : 'Website contact enquiry';
$body = "New website {$formType} request\n\n"
	. "Name: {$name}\n"
	. ($email !== '' ? "Email: {$email}\n" : '')
	. ($phone !== '' ? "Phone: {$phone}\n" : '')
	. "\nMessage:\n{$message}\n";

$headers = [
	'From: New Life Website <' . $fromEmail . '>',
	'MIME-Version: 1.0',
	'Content-Type: text/plain; charset=UTF-8',
	'X-Mailer: PHP/' . PHP_VERSION,
];
if ($email !== '') {
	$headers[] = 'Reply-To: ' . $email;
}

if (!mail('tdlinsa@gmail.com', $subject, $body, implode("\r\n", $headers))) {
	error_log('New Life website email could not be queued by PHP mail().');
	respond(502, ['success' => false, 'message' => 'The hosting server could not send your message. Please try again later.']);
}

respond(200, ['success' => true, 'message' => 'Your message has been sent successfully.']);