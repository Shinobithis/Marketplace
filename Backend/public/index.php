<?php
/**
 * Main API Router
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

date_default_timezone_set('UTC');

require_once __DIR__ . '/../config/cors.php';

CorsMiddleware::handle();

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ListingController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/MessageController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/FavoriteController.php';
require_once __DIR__ . '/../utils/Response.php';

// Get request method and URI
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$uri_parts = explode('?', $request_uri);
$path = $uri_parts[0];

$script_name = $_SERVER['SCRIPT_NAME'];

$route = substr($path, strlen(dirname($script_name)));

$route = trim($route, '/');

$segments = explode('/', $route);


if (empty($segments[0])) {
    $segments = [];
}

try {
    if (empty($segments[0])) {
        Response::json(["success" => true, "message" => "BSG Marketplace API is running", "data" => ["name" => "BSG Marketplace API", "version" => "1.0.0", "endpoints" => ["auth" => "/api/auth", "listings" => "/api/listings", "categories" => "/api/categories"]]]);
        exit();
    }
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
            
        case 'messages':
            $controller = new MessageController();
            handleMessageRoutes($controller, $segments, $request_method);
            break;
            
        case 'admin':
            $controller = new AdminController();
            handleAdminRoutes($controller, $segments, $request_method);
            break;

        case 'favorites':
            $controller = new FavoriteController();
            handleFavoriteRoutes($controller, $segments, $request_method);
            break;
            
        case '':
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

function handleCategoryRoutes($controller, $segments, $request_method) {
    switch (count($segments)) {
        case 1: // /categories
            if ($request_method == "GET") {
                $controller->getAll();
            } else {
                Response::error("Method not allowerd", 405);
            }
            break;
        case 2:
            if ($segments[1] == "counts" && $request_method == "GET") {
                $controller->getCounts();
            } else if (is_numeric($segments[1]) && $request_method == "GET") {
                $controller->getById($segments[1]);
            } else {
                Response::error("Method not allowerd", 405);
            }
            break;
    }
}
function handleMessageRoutes($controller, $segments, $method) {
    $action = $segments[1] ?? '';
    
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'conversations':
                    $controller->getConversations();
                    break;
                case '':
                    $controller->getMessages();
                    break;
                default:
                    Response::notFound('Message endpoint not found');
            }
            break;
            
        case 'POST':
            switch ($action) {
                case 'mark-read':
                    $controller->markAsRead();
                    break;
                case '':
                    $controller->create();
                    break;
                default:
                    Response::notFound('Message endpoint not found');
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

function handleAdminRoutes($controller, $segments, $method) {
    $action = $segments[1] ?? '';
    $id = $segments[2] ?? null;
    $subaction = $segments[3] ?? '';
    
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'stats':
                    $controller->getStats();
                    break;
                case 'users':
                    $controller->getUsers();
                    break;
                case 'listings':
                    $controller->getListings();
                    break;
                default:
                    Response::notFound('Admin endpoint not found');
            }
            break;
            
        case 'PUT':
            if ($action === 'users' && $id && $subaction === 'toggle-status') {
                $controller->toggleUserStatus($id);
            } elseif ($action === 'listings' && $id && $subaction === 'toggle-status') {
                $controller->toggleListingStatus($id);
            } else {
                Response::notFound('Admin endpoint not found');
            }
            break;
            
        default:
            Response::error('Method not allowed', 405);
    }
}

function handleFavoriteRoutes($controller, $segments, $request_method) {
    switch ($request_method) {
        case 'GET':
            if (isset($segments[1]) && $segments[1] === 'user') {
                $controller->getUserFavorites();
            } else {
                Response::error("Invalid favorite route", 404);
            }
            break;
        case 'POST':
            if (isset($segments[1])) { 
                $controller->addFavorite($segments[1]);
            } else {
                Response::error("Listing ID required", 400);
            }
            break;
        case 'DELETE':
            if (isset($segments[1])) { 
                $controller->removeFavorite($segments[1]);
            } else {
                Response::error("Listing ID required", 400);
            }
            break;
        default:
            Response::error("Method not allowed", 405);
            break;
    }
}
