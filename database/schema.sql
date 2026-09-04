CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('donor','patient','hospital','admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    city_location VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE,

    CONSTRAINT fk_donor_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    medical_condition TEXT,

    CONSTRAINT fk_patient_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,

    CONSTRAINT fk_hospital_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

CREATE TABLE blood_requests (
    request_id SERIAL PRIMARY KEY,
    requested_by_user_id INT NOT NULL,
    blood_group_needed VARCHAR(5) NOT NULL,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('Low','Medium','High','Critical')),
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request_user
    FOREIGN KEY (requested_by_user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
CREATE TABLE ai_matching (
    match_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    priority_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'Pending',

    CONSTRAINT fk_ai_request
    FOREIGN KEY (request_id)
    REFERENCES blood_requests(request_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_ai_donor
    FOREIGN KEY (donor_id)
    REFERENCES donors(donor_id)
    ON DELETE CASCADE
);

CREATE TABLE donation_history (
    history_id SERIAL PRIMARY KEY,
    donor_id INT NOT NULL,
    request_id INT NOT NULL,
    donation_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Completed',

    CONSTRAINT fk_history_donor
    FOREIGN KEY (donor_id)
    REFERENCES donors(donor_id)
    ON DELETE CASCADE,

    CONSTRAINT fk_history_request
    FOREIGN KEY (request_id)
    REFERENCES blood_requests(request_id)
    ON DELETE CASCADE
);
CREATE TABLE chatbot_logs (
    chat_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message_text TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
CREATE TABLE blood_bank_inventory (
    inventory_id SERIAL PRIMARY KEY,
    hospital_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    units_available INT NOT NULL CHECK (units_available >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_hospital
    FOREIGN KEY (hospital_id)
    REFERENCES hospitals(hospital_id)
    ON DELETE CASCADE
);