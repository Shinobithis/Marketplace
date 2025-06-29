<?php
/**
 * Favorite Model
 */

require_once __DIR__ . 
'/Listing.php';

class Favorite {
    private $conn;
    private $table_name = "favorites";
    private $listing_table_name = "listings";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function add($user_id, $listing_id) {
        $query = "INSERT INTO " . $this->table_name . " (user_id, listing_id) VALUES (:user_id, :listing_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":listing_id", $listing_id);
        return $stmt->execute();
    }

    public function remove($user_id, $listing_id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id AND listing_id = :listing_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":listing_id", $listing_id);
        return $stmt->execute();
    }

    public function isFavorited($user_id, $listing_id) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE user_id = :user_id AND listing_id = :listing_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":listing_id", $listing_id);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    public function getByUser($user_id) {   
        error_log("Executing getByUser for user_id: " . $user_id);
        $query = "SELECT l.*, u.username, u.first_name, u.last_name, u.avatar_url,
                         c.name as category_name, c.slug as category_slug,
                         li.image_url as primary_image
                  FROM " . $this->table_name . " f
                  JOIN " . $this->listing_table_name . " l ON f.listing_id = l.id
                  LEFT JOIN users u ON l.user_id = u.id
                  LEFT JOIN categories c ON l.category_id = c.id
                  LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = 1
                  WHERE f.user_id = :user_id AND l.is_active = 1
                  ORDER BY f.created_at DESC";

        error_log("SQL Query for getByUser: " . $query);
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}