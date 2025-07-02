<?php
/**
 * Admin Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Listing.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    private $db;
    private $user;
    private $listing;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
        $this->listing = new Listing($this->db);
    }

    private function checkAdminAccess() {
        $user_data = AuthMiddleware::authenticate();
        
        if ($user_data['role'] !== 'admin') {
            Response::forbidden("Admin access required");
        }
        
        return $user_data;
    }

    public function getStats() {
        $this->checkAdminAccess();

        // Get total counts
        $totalUsers = $this->user->getCount();
        $totalListings = $this->listing->getCount();
        $activeListings = $this->listing->getCount(['is_active' => 1]);

        // Get recent users (last 5)
        $recentUsers = $this->user->getRecent(5);

        // Get recent listings (last 5)
        $recentListings = $this->listing->getRecent(5);

        $stats = [
            'totalUsers' => $totalUsers,
            'totalListings' => $totalListings,
            'activeListings' => $activeListings,
            'recentUsers' => $recentUsers,
            'recentListings' => $recentListings
        ];

        Response::success($stats);
    }

    public function getUsers() {
        $this->checkAdminAccess();

        $limit = $_GET['limit'] ?? 50;
        $offset = $_GET['offset'] ?? 0;

        $users = $this->user->getAll($limit, $offset);
        Response::success($users);
    }

    public function getListings() {
        $this->checkAdminAccess();

        $limit = $_GET['limit'] ?? 50;
        $offset = $_GET['offset'] ?? 0;

        $listings = $this->listing->getAllForAdmin($limit, $offset);
        Response::success($listings);
    }

    public function toggleUserStatus($user_id) {
        $this->checkAdminAccess();

        $user = $this->user->findById($user_id);
        if (!$user) {
            Response::notFound("User not found");
        }

        $new_status = $user['is_active'] ? 0 : 1;
        $success = $this->user->updateStatus($user_id, $new_status);

        if ($success) {
            Response::success(null, "User status updated successfully");
        } else {
            Response::error("Failed to update user status", 500);
        }
    }

    public function toggleListingStatus($listing_id) {
        $this->checkAdminAccess();

        $listing = $this->listing->findById($listing_id);
        if (!$listing) {
            Response::notFound("Listing not found");
        }

        $new_status = $listing['is_active'] ? 0 : 1;
        $success = $this->listing->updateStatus($listing_id, $new_status);

        if ($success) {
            Response::success(null, "Listing status updated successfully");
        } else {
            Response::error("Failed to update listing status", 500);
        }
    }
}

