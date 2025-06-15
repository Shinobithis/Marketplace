<?php
/**
 * Main API Router
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');

// Include CORS middleware
require_once __DIR__ . '/../config/cors.php';

// Handle CORS
CorsMiddleware::handle();

// Include controllers
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ListingController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../utils/Response.php';

// Get request method and URI
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string from URI
$uri_parts = explode('?', $request_uri);
$path = $uri_parts[0];

// Get the base path of the script (e.g., /bsg-api/public/index.php)
$script_name = $_SERVER['SCRIPT_NAME'];

// Remove the script name's directory from the path to get the actual route
// Example: /bsg-api/public/auth/login - /bsg-api/public = /auth/login
$route = substr($path, strlen(dirname($script_name)));

// Remove leading and trailing slashes
$route = trim($route, '/');

// Split path into segments
$segments = explode('/', $route);

// If the first segment is empty, it means we are at the root of the API
if (empty($segments[0])) {
    $segments = []; // Or handle as a default route
}

try {
    // Route the request
    // Check if segments array is empty (i.e., root URL access)
    if (empty($segments[0])) {
        // Handle the root path, e.g., return API status or a default message
        Response::json(["success" => true, "message" => "BSG Marketplace API is running", "data" => ["name" => "BSG Marketplace API", "version" => "1.0.0", "endpoints" => ["auth" => "/api/auth", "listings" => "/api/listings", "categories" => "/api/categories"]]]);
        exit(); // Stop further execution
    }
    // Route the request
    switch ($segments[0]) {
        case 'auth':
            $controller = new AuthController();
            handleAuthRoutes($controller, $segments, $request_method);
            break;
            
        case 'listings':
            $controller = new ListingController();
            handleListingRoutes($controller, $segments, $request_method);
            break;
            
        case 'categories':
            $controller = new CategoryController();
            handleCategoryRoutes($controller, $segments, $request_method);
            break;
            
        case '':
            // API root - return API info
            Response::success([
                'name' => 'BSG Marketplace API',
                'version' => '1.0.0',
                'endpoints' => [
                    'auth' => '/api/auth',
                    'listings' => '/api/listings',
                    'categories' => '/api/categories'
                ]
            ], 'BSG Marketplace API is running');
            break;
            
        default:
            Response::notFound('Endpoint not found');
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}

function handleAuthRoutes($controller, $segments, $method) {
    $action = $segments[1] ?? '';
    
    switch ($method) {
        case 'POST':
            switch ($action) {
                case 'register':
                    $controller->register();
                    break;
                case 'login':
                    $controller->login();
                    break;
                case 'logout':
                    $controller->logout();
                    break;
                default:
                    Response::notFound('Auth endpoint not found');
            }
            break;
            
        case 'GET':
            switch ($action) {
                case 'me':
                    $controller->me();
                    break;
                default:
                    Response::notFound('Auth endpoint not found');
            }
            break;
            
        case 'PUT':
            switch ($action) {
                case 'profile':
                    $controller->updateProfile();
                    break;
                default:
                    Response::notFound('Auth endpoint not found');
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

function handleListingRoutes($controller, $segments, $method) {
    $action = $segments[1] ?? '';
    $id = $segments[2] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($action === 'featured') {
                $controller->getFeatured();
            } elseif ($action === 'search') {
                $controller->search();
            } elseif ($action === 'my') {
                $controller->getUserListings();
            } elseif ($action && is_numeric($action)) {
                $controller->getById($action);
            } elseif ($action === '') {
                $controller->getAll();
            } else {
                Response::notFound('Listing endpoint not found');
            }
            break;
            
        case 'POST':
            if ($action === '') {
                $controller->create();
            } else {
                Response::notFound('Listing endpoint not found');
            }
            break;
            
        case 'PUT':
            if ($action && is_numeric($action)) {
                $controller->update($action);
            } else {
                Response::notFound('Listing endpoint not found');
            }
            break;
            
        case 'DELETE':
            if ($action && is_numeric($action)) {
                $controller->delete($action);
            } else {
                Response::notFound('Listing endpoint not found');
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

function handleCategoryRoutes($controller, $segments, $method) {
    $action = $segments[1] ?? '';
    $subaction = $segments[2] ?? '';
    
    switch ($method) {
        case 'GET':
            if ($action === '') {
                $controller->getAll();
            } elseif (is_numeric($action)) {
                if ($subaction === 'listings') {
                    $controller->getListings($action);
                } else {
                    $controller->getById($action);
                }
            } else {
                Response::notFound('Category endpoint not found');
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}