FROM mongo:4.0.6

ENV POET_DB_USER=poet
ENV POET_DB_PASSWORD=poetPass
ENV POET_DB=poet

ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=rootPass


COPY create_poet_db.sh /docker-entrypoint-initdb.d


CMD ["mongod", "--nojournal", "--noprealloc", "--smallfiles"]