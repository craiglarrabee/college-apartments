-- Maintenance request table
CREATE TABLE IF NOT EXISTS maintenance_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site VARCHAR(10) NOT NULL,
    user_id INT NULL,
    tenant_first_name VARCHAR(25) NOT NULL,
    tenant_last_name VARCHAR(25) NOT NULL,
    username VARCHAR(200) NOT NULL,
    apartment_number VARCHAR(50) NOT NULL,
    room VARCHAR(100) NOT NULL,
    request VARCHAR(1000) NOT NULL,
    semester VARCHAR(50) NULL,
    created_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_datetime DATETIME NULL,
    closed_comments VARCHAR(1000) NULL,
    INDEX idx_site_open (site, closed_datetime),
    INDEX idx_user (user_id),
    INDEX idx_created (created_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
