<?php
/**
 * Message Model
 */

class Message {
    private $conn;
    private $table_name = "messages";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (listing_id, sender_id, receiver_id, message) 
                  VALUES (:listing_id, :sender_id, :receiver_id, :message)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":listing_id", $data['listing_id']);
        $stmt->bindParam(":sender_id", $data['sender_id']);
        $stmt->bindParam(":receiver_id", $data['receiver_id']);
        $stmt->bindParam(":message", $data['message']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }

    public function findById($id) {
        $query = "SELECT m.*, 
                         u1.first_name as sender_first_name, u1.last_name as sender_last_name,
                         u2.first_name as receiver_first_name, u2.last_name as receiver_last_name,
                         l.title as listing_title
                  FROM " . $this->table_name . " m
                  LEFT JOIN users u1 ON m.sender_id = u1.id
                  LEFT JOIN users u2 ON m.receiver_id = u2.id
                  LEFT JOIN listings l ON m.listing_id = l.id
                  WHERE m.id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getConversations($user_id) {
        $query = "SELECT 
                    CASE 
                        WHEN m.sender_id = :user_id THEN m.receiver_id 
                        ELSE m.sender_id 
                    END as other_user_id,
                    CASE 
                        WHEN m.sender_id = :user_id THEN CONCAT(u2.first_name, ' ', u2.last_name)
                        ELSE CONCAT(u1.first_name, ' ', u1.last_name)
                    END as other_user_name,
                    m.listing_id,
                    l.title as listing_title,
                    MAX(m.created_at) as last_message_date,
                    (SELECT message FROM messages m2 
                     WHERE (m2.sender_id = :user_id OR m2.receiver_id = :user_id)
                     AND m2.listing_id = m.listing_id
                     AND (
                         (m2.sender_id = :user_id AND m2.receiver_id = (CASE WHEN m.sender_id = :user_id THEN m.receiver_id ELSE m.sender_id END))
                         OR 
                         (m2.receiver_id = :user_id AND m2.sender_id = (CASE WHEN m.sender_id = :user_id THEN m.receiver_id ELSE m.sender_id END))
                     )
                     ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                    COUNT(CASE WHEN m.receiver_id = :user_id AND m.is_read = 0 THEN 1 END) as unread_count
                  FROM " . $this->table_name . " m
                  LEFT JOIN users u1 ON m.sender_id = u1.id
                  LEFT JOIN users u2 ON m.receiver_id = u2.id
                  LEFT JOIN listings l ON m.listing_id = l.id
                  WHERE m.sender_id = :user_id OR m.receiver_id = :user_id
                  GROUP BY 
                    CASE WHEN m.sender_id = :user_id THEN m.receiver_id ELSE m.sender_id END,
                    m.listing_id
                  ORDER BY last_message_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMessages($user_id, $listing_id, $other_user_id) {
        $query = "SELECT m.*, 
                         u1.first_name as sender_first_name, u1.last_name as sender_last_name,
                         u2.first_name as receiver_first_name, u2.last_name as receiver_last_name
                  FROM " . $this->table_name . " m
                  LEFT JOIN users u1 ON m.sender_id = u1.id
                  LEFT JOIN users u2 ON m.receiver_id = u2.id
                  WHERE m.listing_id = :listing_id 
                  AND ((m.sender_id = :user_id AND m.receiver_id = :other_user_id)
                       OR (m.sender_id = :other_user_id AND m.receiver_id = :user_id))
                  ORDER BY m.created_at ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":listing_id", $listing_id);
        $stmt->bindParam(":other_user_id", $other_user_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($user_id, $listing_id, $other_user_id) {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_read = 1 
                  WHERE receiver_id = :user_id 
                  AND listing_id = :listing_id 
                  AND sender_id = :other_user_id 
                  AND is_read = 0";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":listing_id", $listing_id);
        $stmt->bindParam(":other_user_id", $other_user_id);
        
        return $stmt->execute();
    }

    public function getUnreadCount($user_id) {
        $query = "SELECT COUNT(*) as unread_count 
                  FROM " . $this->table_name . " 
                  WHERE receiver_id = :user_id AND is_read = 0";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['unread_count'] ?? 0;
    }
}

