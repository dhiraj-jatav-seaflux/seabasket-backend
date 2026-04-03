#!/bin/sh

echo "⏳ Waiting for MySQL..."

until nc -z seabasket-mysql 3306; do
  sleep 2
done

echo "✅ MySQL is up!"

node dist/index.js