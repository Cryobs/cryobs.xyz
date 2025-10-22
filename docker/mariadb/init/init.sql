CREATE TABLE IF NOT EXISTS site_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visits INT NOT NULL DEFAULT 0,
  status VARCHAR(255)
);

INSERT INTO site_stats (id, visits, status)
VALUES (1, 0, 'Deploying website')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS ys_status (
  url VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  status BOOLEAN
);


