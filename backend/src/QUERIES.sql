CREATE TABLE users (
	id VARCHAR(256) NOT NULL,
	username VARCHAR(256) NOT NULL,
	password VARCHAR(256) NOT NULL,
	
	PRIMARY KEY (id),
	UNIQUE (username)
)

CREATE TABLE accounts (
	id VARCHAR(256) NOT NULL,
	user_id VARCHAR(256) NOT NULL,
	balance INT DEFAULT (0),
	
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE sessions (
	id VARCHAR(256) NOT NULL,
	user_id VARCHAR(256) NOT NULL,
	token VARCHAR(256) NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id)
)

SELECT * FROM users;

SELECT * FROM accounts;

SELECT * FROM sessions;

INSERT INTO users(id,username,password) values (
	UUID(),
	"Sixten",
	"lösen"
);

INSERT INTO accounts(id,user_id) values (
	UUID(),
	(SELECT id FROM users WHERE username = "Sixten")
);

INSERT INTO sessions(id,user_id,token) values (
	UUID(),
	(SELECT id FROM users WHERE username = "Sixten"),
	UUID()
);



