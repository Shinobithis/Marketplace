<?php
/**
 * Database Configuration
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'bsg_marketplace';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    public function createDatabase() {
        try {
            $conn = new PDO(
                "mysql:host=" . $this->host . ";charset=utf8",
                $this->username,
                $this->password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $sql = "CREATE DATABASE IF NOT EXISTS " . $this->db_name . " CHARACTER SET utf8 COLLATE utf8_general_ci";
            $conn->exec($sql);
            
            return true;
        } catch(PDOException $exception) {
            error_log("Database creation error: " . $exception->getMessage());
            return false;
        }
    }
}

