<?php
/**
 * Listing Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Listing.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ListingController {
    private $db;
    private $listing;
    private $category;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->listing = new Listing($this->db);
        $this->category = new Category($this->db);
    }

    public function getAll() {
        $filters = [
            'category_id' => $_GET['category_id'] ?? null,
            'search' => $_GET['search'] ?? null,
            'is_free' => $_GET['is_free'] ?? null,
            'condition' => $_GET['condition'] ?? null,
            'min_price' => $_GET['min_price'] ?? null,
            'max_price' => $_GET['max_price'] ?? null,
            'sort' => $_GET['sort'] ?? 'newest',
            'limit' => $_GET['limit'] ?? 20,
            'offset' => $_GET['offset'] ?? 0
        ];

        $listings = $this->listing->getAll($filters);
        $total = $this->listing->getCount($filters);

        Response::success([
            'listings' => $listings,
            'total' => $total,
            'limit' => (int)$filters['limit'],
            'offset' => (int)$filters['offset']
        ]);
    }

    public function getFeatured() {
        $limit = $_GET['limit'] ?? 4;
        $listings = $this->listing->getFeatured($limit);

        Response::success($listings);
    }

    public function getById($id) {
        $listing = $this->listing->findById($id);

        if (!$listing) {
            Response::notFound("Listing not found");
        }

        Response::success($listing);
    }

    public function create() {
        $user_data = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate input
        $validator = new Validator();
        $validator
            ->required('title', $data['title'] ?? '')
            ->required('description', $data['description'] ?? '')
            ->required('category_id', $data['category_id'] ?? '')
            ->required('condition_type', $data['condition_type'] ?? '')
            ->required('location', $data['location'] ?? '')
            ->numeric('category_id', $data['category_id'] ?? '')
            ->numeric('price', $data['price'] ?? 0)
            ->in('condition_type', $data['condition_type'] ?? '', ['new', 'like_new', 'good', 'fair', 'poor'])
            ->maxLength('title', $data['title'] ?? '', 200)
            ->maxLength('location', $data['location'] ?? '', 100);

        // Validate category exists
        if (!empty($data['category_id'])) {
            $category = $this->category->findById($data['category_id']);
            if (!$category) {
                $validator->errors['category_id'] = 'Invalid category';
            }
        }

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        $listing_data = [
            'user_id' => $user_data['id'],
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'price' => $data['price'] ?? 0,
            'condition_type' => $data['condition_type'],
            'location' => $data['location'],
            'is_free' => ($data['price'] ?? 0) == 0 ? 1 : 0
        ];

        $listing_id = $this->listing->create($listing_data);

        if ($listing_id) {
            $listing = $this->listing->findById($listing_id);
            Response::success($listing, "Listing created successfully", 201);
        } else {
            Response::error("Failed to create listing", 500);
        }
    }

    public function update($id) {
        $user_data = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Check if listing exists and belongs to user
        $existing_listing = $this->listing->findById($id);
        if (!$existing_listing) {
            Response::notFound("Listing not found");
        }

        if ($existing_listing['user_id'] != $user_data['id'] && $user_data['role'] !== 'admin') {
            Response::forbidden("You can only edit your own listings");
        }

        // Validate input
        $validator = new Validator();
        if (isset($data['title'])) {
            $validator->required('title', $data['title'])->maxLength('title', $data['title'], 200);
        }
        if (isset($data['description'])) {
            $validator->required('description', $data['description']);
        }
        if (isset($data['category_id'])) {
            $validator->required('category_id', $data['category_id'])->numeric('category_id', $data['category_id']);
            $category = $this->category->findById($data['category_id']);
            if (!$category) {
                $validator->errors['category_id'] = 'Invalid category';
            }
        }
        if (isset($data['condition_type'])) {
            $validator->in('condition_type', $data['condition_type'], ['new', 'like_new', 'good', 'fair', 'poor']);
        }
        if (isset($data['location'])) {
            $validator->required('location', $data['location'])->maxLength('location', $data['location'], 100);
        }
        if (isset($data['price'])) {
            $validator->numeric('price', $data['price']);
            $data['is_free'] = $data['price'] == 0 ? 1 : 0;
        }

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        if ($this->listing->update($id, $data, $user_data['id'])) {
            $updated_listing = $this->listing->findById($id);
            Response::success($updated_listing, "Listing updated successfully");
        } else {
            Response::error("Failed to update listing", 500);
        }
    }

    public function delete($id) {
        $user_data = AuthMiddleware::authenticate();

        // Check if listing exists and belongs to user
        $existing_listing = $this->listing->findById($id);
        if (!$existing_listing) {
            Response::notFound("Listing not found");
        }

        if ($existing_listing['user_id'] != $user_data['id'] && $user_data['role'] !== 'admin') {
            Response::forbidden("You can only delete your own listings");
        }

        if ($this->listing->delete($id, $user_data['id'])) {
            Response::success(null, "Listing deleted successfully");
        } else {
            Response::error("Failed to delete listing", 500);
        }
    }

    public function getUserListings() {
        $user_data = AuthMiddleware::authenticate();
        $limit = $_GET['limit'] ?? 20;
        $offset = $_GET['offset'] ?? 0;

        $listings = $this->listing->getUserListings($user_data['id'], $limit, $offset);

        Response::success($listings);
    }

    public function search() {
        $query = $_GET['q'] ?? '';
        
        if (empty($query)) {
            Response::error("Search query is required");
        }

        $filters = [
            'search' => $query,
            'category_id' => $_GET['category_id'] ?? null,
            'is_free' => $_GET['is_free'] ?? null,
            'condition' => $_GET['condition'] ?? null,
            'min_price' => $_GET['min_price'] ?? null,
            'max_price' => $_GET['max_price'] ?? null,
            'sort' => $_GET['sort'] ?? 'newest',
            'limit' => $_GET['limit'] ?? 20,
            'offset' => $_GET['offset'] ?? 0
        ];

        $listings = $this->listing->getAll($filters);
        $total = $this->listing->getCount($filters);

        Response::success([
            'listings' => $listings,
            'total' => $total,
            'query' => $query,
            'limit' => (int)$filters['limit'],
            'offset' => (int)$filters['offset']
        ]);
    }
}

