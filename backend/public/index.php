<?php

use App\Kernel;

// Workaround for missing Authorization header
if (!isset($_SERVER['HTTP_AUTHORIZATION']) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}


// Debug logging
$logDir = dirname(__DIR__).'/var/log';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}
$headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
$log = date('Y-m-d H:i:s') . " - Request: " . $_SERVER['REQUEST_URI'] . "\n";
file_put_contents($logDir.'/headers_debug_latest.log', $log, FILE_APPEND);

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';


return function (array $context) {
    $kernel = new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);

    return new class($kernel) implements \Symfony\Component\Runtime\RunnerInterface {
        private $kernel;
        public function __construct($kernel) { $this->kernel = $kernel; }
        public function run(): int {
            $request = \Symfony\Component\HttpFoundation\Request::createFromGlobals();
            try {
                $response = $this->kernel->handle($request);
                
                if ($response->getStatusCode() >= 500) {
                     $logDir = dirname(__DIR__, 2).'/var/log';
                     if (!is_dir($logDir)) mkdir($logDir, 0777, true);
                     
                     $log = "API ERROR RESPONSE (" . $response->getStatusCode() . "):\n";
                     $log .= "Content: " . substr($response->getContent(), 0, 2000) . "\n----------------\n";
                     file_put_contents($logDir.'/headers_debug_latest.log', $log, FILE_APPEND);
                }

                $response->send();
                $this->kernel->terminate($request, $response);
                return 0;
            } catch (\Throwable $e) {
                // LOG THE CRITICAL ERROR
                $logDir = dirname(__DIR__, 2).'/var/log';
                if (!is_dir($logDir)) mkdir($logDir, 0777, true);
                
                $log = "CRITICAL ERROR: " . $e->getMessage() . "\n";
                $log .= "File: " . $e->getFile() . " (" . $e->getLine() . ")\n";
                $log .= "Trace: " . $e->getTraceAsString() . "\n----------------\n";
                file_put_contents($logDir.'/headers_debug_latest.log', $log, FILE_APPEND);
                
                // Still show the error page (or a simple message if needed)
                header('HTTP/1.0 500 Internal Server Error');
                echo "Internal Error logged.";
                return 1;
            }
        }
    };
};
