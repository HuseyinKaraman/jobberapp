#!/bin/bash

# Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker-compose down

# Remove existing volumes to start fresh
echo "Removing existing volumes..."
rm -rf ./docker-volumes/elasticsearch-data/*

# Start only Elasticsearch first
echo "Starting Elasticsearch..."
docker-compose up -d elasticsearch

# Wait for Elasticsearch to start (up to 2 minutes)
echo "Waiting for Elasticsearch to start up (this may take up to 2 minutes)..."
for i in {1..24}; do
  if curl -s -k "http://localhost:9200" > /dev/null; then
    echo "Elasticsearch is up!"
    break
  fi
  if [ $i -eq 24 ]; then
    echo "Elasticsearch did not start in time. Please check logs."
    exit 1
  fi
  echo "Waiting for Elasticsearch... ($i/24)"
  sleep 5
done

# Set up Elasticsearch users and roles
echo "Setting up Kibana system user..."
# First, reset the built-in kibana_system user
docker exec -it elasticsearch_container curl -X POST -k -u elastic:admin1234 \
  -H "Content-Type: application/json" \
  "http://localhost:9200/_security/user/kibana_system/_password" \
  -d '{"password": "kibana"}'

# Create a Kibana user with admin privileges
echo "Creating a kibana_admin user..."
docker exec -it elasticsearch_container curl -X POST -k -u elastic:admin1234 \
  -H "Content-Type: application/json" \
  "http://localhost:9200/_security/user/kibana_admin" \
  -d '{
    "password": "kibana_admin_password",
    "roles": ["kibana_admin", "superuser"],
    "full_name": "Kibana Administrator"
  }'

# Start Kibana
echo "Starting Kibana..."
docker-compose up -d kibana

echo "Setup complete!"
echo "Wait about 1-2 minutes for Kibana to fully start."
echo ""
echo "You can now access:"
echo "- Elasticsearch: http://localhost:9200 (username: elastic, password: admin1234)"
echo "- Kibana: http://localhost:5601 (username: kibana_admin, password: kibana_admin_password)"
echo ""
echo "If you continue to have issues, check the logs with:"
echo "docker-compose logs elasticsearch"
echo "docker-compose logs kibana"