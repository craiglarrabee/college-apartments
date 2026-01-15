-- Migration to add admin-managed payment line items for tenants

CREATE TABLE IF NOT EXISTS `tenant_payment_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `site` VARCHAR(10) NOT NULL,
    `user_id` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `due_date` DATE NULL,
    `is_paid` TINYINT(1) DEFAULT 0,
    `paid_trans_id` VARCHAR(50) NULL,
    `date_created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_by_user_id` INT NOT NULL,
    `date_deleted` TIMESTAMP NULL,
    `deleted_by_user_id` INT NULL,
    INDEX `idx_user_site` (`user_id`, `site`),
    INDEX `idx_site_unpaid` (`site`, `is_paid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

