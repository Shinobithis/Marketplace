<?php
/**
 * Category Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Listing.php';
require_once __DIR__ . '/../utils/Response.php';

class CategoryController {
    private $db;
    private $category;
    private $listing;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->category = new Category($this->db);
        $this->listing = new Listing($this->db);
    }

    public function getAll() {
        $with_count = $_GET['with_count'] ?? false;
        
        if ($with_count) {
            $categories = $this->category->getWithListingCount();
        } else {
            $categories = $this->category->getAll();
        }

        Response::success($categories);
    }

    public function getById($id) {
        $category = $this->category->findById($id);

        if (!$category) {
            Response::notFound("Category not found");
        }

        Response::success($category);
    }

    public function getListings($id) {
        $category = $this->category->findById($id);

        if (!$category) {
            Response::notFound("Category not found");
        }

        $filters = [
            'category_id' => $id,
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
            'category' => $category,
            'listings' => $listings,
            'total' => $total,
            'limit' => (int)$filters['limit'],
            'offset' => (int)$filters['offset']
        ]);
    }
}

