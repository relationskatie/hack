CREATE TABLE IF NOT EXISTS traffic_lights (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    year_installation INT NOT NULL CHECK (year_installation > 1900 AND year_installation <= EXTRACT(YEAR FROM CURRENT_DATE))
);
