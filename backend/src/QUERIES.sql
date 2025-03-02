CREATE TABLE users (
	id VARCHAR(256) DEFAULT(UUID()),
	username VARCHAR(256) NOT NULL,
	password VARCHAR(256) NOT NULL,
	
	PRIMARY KEY (id),
	UNIQUE (username)
)

CREATE TABLE accounts (
	id VARCHAR(256) DEFAULT(UUID()),
	user_id VARCHAR(256) NOT NULL,
	balance INT DEFAULT (0),
	
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE sessions (
	id VARCHAR(256) DEFAULT(UUID()),
	user_id VARCHAR(256) NOT NULL,
	token VARCHAR(256) DEFAULT(UUID()),

	
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id)
)

SELECT * FROM users;

SELECT * FROM accounts;

SELECT * FROM sessions;

INSERT INTO users(username,password) values (
	"Sixten",
	"lösen"
);

INSERT INTO accounts(user_id) values (
	(SELECT id FROM users WHERE username = "Sixten")
);

INSERT INTO sessions(user_id) values (
	(SELECT id FROM users WHERE username = "Sixten")
);

DROP TABLE users;

DROP TABLE accounts;

DROP TABLE sessions;



