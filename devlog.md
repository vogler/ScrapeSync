# Database
- mongo: no real benefit, https://github.com/Automattic/mongoose still needs some schema/models to work
- sqlite: serverless
- postgres: besides relational, it can also store json and do queries on it

Tools
- https://github.com/dbcli better CLIs for pg, my, lite…
  - `litecli` (CLI, sqlite) REPL with auto-completion and syntax highlighting
- `sqlcrush` https://github.com/coffeeandscripts/sqlcrush (TUI, SQLite3/PostgreSQL/MySQL)
- `sqlite-analyzer` analyze how space is allocated inside an SQLite file

Use https://github.com/typeorm/typeorm with sqlite first, and change to postgres if needed.
