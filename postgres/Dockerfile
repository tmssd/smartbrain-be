FROM postgres:15.0

COPY /tables/ /docker-entrypoint-initdb.d/tables/
COPY /seed/ /docker-entrypoint-initdb.d/seed/
COPY deploy_schemas.sql /docker-entrypoint-initdb.d/
