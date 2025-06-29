<?php
/**
 * Favorite Controller
 */

require_once __DIR__ . 
'/../config/database.php';
require_once __DIR__ . 
'/../models/Favorite.php';
require_once __DIR__ . 
'/../utils/Response.php';
require_once __DIR__ . 
'/../middleware/AuthMiddleware.php';

class FavoriteController {
    private $db;
    private $favorite;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->favorite = new Favorite($this->db);
    }

    public function addFavorite($listing_id) {
        $user_data = AuthMiddleware::authenticate();
        $user_id = $user_data['id'];

        if (!$listing_id) {
            Response::error("Listing ID is required", 400);
        }

        if ($this->favorite->isFavorited($user_id, $listing_id)) {
            Response::error("Listing already favorited", 409);
        }

        if ($this->favorite->add($user_id, $listing_id)) {
            Response::success(["is_favorited" => true], "Listing added to favorites");
        } else {
            Response::error("Failed to add listing to favorites", 500);
        }
    }

    public function removeFavorite($listing_id) {
        $user_data = AuthMiddleware::authenticate();
        $user_id = $user_data['id'];

        if (!$listing_id) {
            Response::error("Listing ID is required", 400);
        }

        if (!$this->favorite->isFavorited($user_id, $listing_id)) {
            Response::error("Listing not in favorites", 404);
        }

        if ($this->favorite->remove($user_id, $listing_id)) {
            Response::success(["is_favorited" => false], "Listing removed from favorites");
        } else {
            Response::error("Failed to remove listing from favorites", 500);
        }
    }

    public function getUserFavorites() {
        $user_data = AuthMiddleware::authenticate();
        $user_id = $user_data['id'];

        $favorites = $this->favorite->getByUser($user_id);

        Response::success($favorites);
    }
}