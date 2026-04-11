-- Delivo Platform — Initialize per-service databases
-- This runs automatically when the postgres container starts for the first time.

CREATE DATABASE user_db;
CREATE DATABASE order_db;
CREATE DATABASE delivery_db;
CREATE DATABASE notification_db;
