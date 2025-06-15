<?php
/**
 * User Model
 */

class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (username, email, password_hash, first_name, last_name, phone) 
                  VALUES (:username, :email, :password_hash, :first_name, :last_name, :phone)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":username", $data['username']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":password_hash", $data['password_hash']);
        $stmt->bindParam(":first_name", $data['first_name']);
        $stmt->bindParam(":last_name", $data['last_name']);
        $stmt->bindParam(":phone", $data['phone']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = :username AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $query = "SELECT id, username, email, first_name, last_name, phone, avatar_url, role, created_at 
                  FROM " . $this->table_name . " WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, ['first_name', 'last_name', 'phone', 'avatar_url'])) {
                $fields[] = "{$key} = :{$key}";
                $params[":{$key}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        return $stmt->execute($params);
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public function emailExists($email, $exclude_id = null) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE email = :email";
        $params = [':email' => $email];

        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $exclude_id;
        }

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchColumn() > 0;
    }

    public function usernameExists($username, $exclude_id = null) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE username = :username";
        $params = [':username' => $username];

        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
            $params[':exclude_id'] = $exclude_id;
        }

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchColumn() > 0;
    }
}

