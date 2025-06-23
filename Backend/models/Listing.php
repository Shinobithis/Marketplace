<?php
/**
 * Listing Model
 */

class Listing {
    private $conn;
    private $table_name = "listings";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (user_id, category_id, title, description, price, condition_type, location, is_free) 
                  VALUES (:user_id, :category_id, :title, :description, :price, :condition_type, :location, :is_free)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":category_id", $data['category_id']);
        $stmt->bindParam(":title", $data['title']);
        $stmt->bindParam(":description", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":condition_type", $data['condition_type']);
        $stmt->bindParam(":location", $data['location']);
        $stmt->bindParam(":is_free", $data['is_free']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAll($filters = []) {
        $where_conditions = ["l.is_active = 1"];
        $params = [];

        // Add filters
        if (!empty($filters['category_id'])) {
            $where_conditions[] = "l.category_id = :category_id";
            $params[':category_id'] = $filters['category_id'];
        }

        if (!empty($filters['search'])) {
            $where_conditions[] = "(l.title LIKE :search OR l.description LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['is_free']) && $filters['is_free'] !== '') {
            $where_conditions[] = "l.is_free = :is_free";
            $params[':is_free'] = $filters['is_free'];
        }

        if (!empty($filters['condition'])) {
            $where_conditions[] = "l.condition_type = :condition";
            $params[':condition'] = $filters['condition'];
        }

        if (!empty($filters['min_price'])) {
            $where_conditions[] = "l.price >= :min_price";
            $params[':min_price'] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $where_conditions[] = "l.price <= :max_price";
            $params[':max_price'] = $filters['max_price'];
        }

        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 20;
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;

        $order_by = "l.created_at DESC";
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'price_asc':
                    $order_by = "l.price ASC";
                    break;
                case 'price_desc':
                    $order_by = "l.price DESC";
                    break;
                case 'newest':
                    $order_by = "l.created_at DESC";
                    break;
                case 'oldest':
                    $order_by = "l.created_at ASC";
                    break;
            }
        }

        $query = "SELECT l.*, u.username, u.first_name, u.last_name, u.avatar_url,
                         c.name as category_name, c.slug as category_slug,
                         li.image_url as primary_image
                  FROM " . $this->table_name . " l
                  LEFT JOIN users u ON l.user_id = u.id
                  LEFT JOIN categories c ON l.category_id = c.id
                  LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = 1
                  WHERE " . implode(' AND ', $where_conditions) . "
                  ORDER BY {$order_by}
                  LIMIT {$limit} OFFSET {$offset}";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeatured($limit = 4) {
        $query = "SELECT l.*, u.username, u.first_name, u.last_name, u.avatar_url,
                         c.name as category_name, c.slug as category_slug,
                         li.image_url as primary_image
                  FROM " . $this->table_name . " l
                  LEFT JOIN users u ON l.user_id = u.id
                  LEFT JOIN categories c ON l.category_id = c.id
                  LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = 1
                  WHERE l.is_active = 1 AND l.is_featured = 1
                  ORDER BY l.created_at DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $query = "SELECT l.*, u.username, u.first_name, u.last_name, u.avatar_url, u.phone,
                         c.name as category_name, c.slug as category_slug
                  FROM " . $this->table_name . " l
                  LEFT JOIN users u ON l.user_id = u.id
                  LEFT JOIN categories c ON l.category_id = c.id
                  WHERE l.id = :id AND l.is_active = 1
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($listing) {
            // Get all images for this listing
            $images_query = "SELECT * FROM listing_images WHERE listing_id = :listing_id ORDER BY sort_order ASC";
            $images_stmt = $this->conn->prepare($images_query);
            $images_stmt->bindParam(":listing_id", $id);
            $images_stmt->execute();
            $listing['images'] = $images_stmt->fetchAll(PDO::FETCH_ASSOC);

            // Increment view count
            $this->incrementViews($id);
        }

        return $listing;
    }

    public function update($id, $data, $user_id) {
        $fields = [];
        $params = [':id' => $id, ':user_id' => $user_id];

        $allowed_fields = ['title', 'description', 'price', 'condition_type', 'location', 'category_id', 'is_free'];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowed_fields)) {
                $fields[] = "{$key} = :{$key}";
                $params[":{$key}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . " 
                  SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params);
    }

    public function delete($id, $user_id) {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_active = 0 
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);

        return $stmt->execute();
    }

    public function getUserListings($user_id, $limit = 20, $offset = 0) {
        $query = "SELECT l.*, c.name as category_name, c.slug as category_slug,
                         li.image_url as primary_image
                  FROM " . $this->table_name . " l
                  LEFT JOIN categories c ON l.category_id = c.id
                  LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = 1
                  WHERE l.user_id = :user_id AND l.is_active = 1
                  ORDER BY l.created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function incrementViews($id) {
        $query = "UPDATE " . $this->table_name . " SET views_count = views_count + 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function getCount($filters = []) {
        $where_conditions = ["is_active = 1"];
        $params = [];

        // Add same filters as getAll method
        if (!empty($filters['category_id'])) {
            $where_conditions[] = "category_id = :category_id";
            $params[':category_id'] = $filters['category_id'];
        }

        if (!empty($filters['search'])) {
            $where_conditions[] = "(title LIKE :search OR description LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['is_free']) && $filters['is_free'] !== '') {
            $where_conditions[] = "is_free = :is_free";
            $params[':is_free'] = $filters['is_free'];
        }

        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE " . implode(' AND ', $where_conditions);
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchColumn();
    }

    public function saveImages($images) {
        if (empty($images)) {
            return false;
        }

        $query = "INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES ";
        $values = [];
        $params = [];
        $counter = 0;

        foreach ($images as $index => $image) {
            $values[] = "(:listing_id{$index}, :image_url{$index}, :is_primary{$index}, :sort_order{$index})";
            $params[":listing_id{$index}"] = $image["listing_id"];
            $params[":image_url{$index}"] = $image["image_url"];
            $params[":is_primary{$index}"] = ($index === 0) ? 1 : 0;
            $params[":sort_order{$index}"] = $index;
        }

        $query .= implode(", ", $values);

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key=>$val) {
            $stmt->bindValue($key, $val);
        }

        return $stmt->execute();
    }

    public function getAllForAdmin($limit = 50, $offset = 0) {
        $query = "SELECT l.*, u.username, u.first_name, u.last_name,
                         CONCAT(u.first_name, ' ', u.last_name) as seller_name,
                         c.name as category_name, c.slug as category_slug
                  FROM " . $this->table_name . " l
                  LEFT JOIN users u ON l.user_id = u.id
                  LEFT JOIN categories c ON l.category_id = c.id
                  ORDER BY l.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecent($limit = 5) {
        $query = "SELECT id, title, price, created_at 
                  FROM " . $this->table_name . " 
                  WHERE is_active = 1 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET is_active = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':status', $status);
        
        return $stmt->execute();
    }
}