<?php
/**
 * Category Model
 */

class Category {
    private $conn;
    private $table_name = "categories";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE is_active = 1 
                  ORDER BY sort_order ASC, name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCategoryCounts() {
        $query = "SELECT c.id, c.name, c.slug, c.icon, COUNT(l.id) as listing_count
                FROM " . $this->table_name . " c
                LEFT JOIN listings l ON c.id = l.category_id AND l.is_active = 1
                GROUP BY c.id, c.name, c.slug, c.icon
                ORDER BY c.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findBySlug($slug) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE slug = :slug AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":slug", $slug);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getWithListingCount() {
        $query = "SELECT c.*, COUNT(l.id) as listing_count 
                  FROM " . $this->table_name . " c 
                  LEFT JOIN listings l ON c.id = l.category_id AND l.is_active = 1
                  WHERE c.is_active = 1 
                  GROUP BY c.id 
                  ORDER BY c.sort_order ASC, c.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

