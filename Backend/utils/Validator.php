<?php
/**
 * Validation Helper Class
 */

class Validator {
    private $errors = [];

    public function required($field, $value, $message = null) {
        if (empty($value) && $value !== '0') {
            $this->errors[$field] = $message ?: ucfirst($field) . " is required";
        }
        return $this;
    }

    public function email($field, $value, $message = null) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $message ?: "Invalid email format";
        }
        return $this;
    }

    public function minLength($field, $value, $min, $message = null) {
        if (!empty($value) && strlen($value) < $min) {
            $this->errors[$field] = $message ?: ucfirst($field) . " must be at least {$min} characters";
        }
        return $this;
    }

    public function maxLength($field, $value, $max, $message = null) {
        if (!empty($value) && strlen($value) > $max) {
            $this->errors[$field] = $message ?: ucfirst($field) . " must not exceed {$max} characters";
        }
        return $this;
    }

    public function numeric($field, $value, $message = null) {
        if (!empty($value) && !is_numeric($value)) {
            $this->errors[$field] = $message ?: ucfirst($field) . " must be a number";
        }
        return $this;
    }

    public function in($field, $value, $allowed, $message = null) {
        if (!empty($value) && !in_array($value, $allowed)) {
            $this->errors[$field] = $message ?: ucfirst($field) . " must be one of: " . implode(', ', $allowed);
        }
        return $this;
    }

    public function unique($field, $value, $table, $column, $pdo, $exclude_id = null, $message = null) {
        if (!empty($value)) {
            $sql = "SELECT COUNT(*) FROM {$table} WHERE {$column} = ?";
            $params = [$value];
            
            if ($exclude_id) {
                $sql .= " AND id != ?";
                $params[] = $exclude_id;
            }
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->fetchColumn() > 0) {
                $this->errors[$field] = $message ?: ucfirst($field) . " already exists";
            }
        }
        return $this;
    }

    public function hasErrors() {
        return !empty($this->errors);
    }

    public function getErrors() {
        return $this->errors;
    }

    public function getFirstError() {
        return !empty($this->errors) ? reset($this->errors) : null;
    }
}

