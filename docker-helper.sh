#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Church Planner Docker Helper  ${NC}"
echo -e "${GREEN}================================${NC}"

# Help function
function show_help {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  ${GREEN}./docker-helper.sh${NC} [command]"
  echo ""
  echo -e "${YELLOW}Commands:${NC}"
  echo -e "  ${GREEN}start-dev${NC}      Start development environment"
  echo -e "  ${GREEN}stop-dev${NC}       Stop development environment"
  echo -e "  ${GREEN}start-prod${NC}     Start production environment"
  echo -e "  ${GREEN}stop-prod${NC}      Stop production environment"
  echo -e "  ${GREEN}build-dev${NC}      Build development containers"
  echo -e "  ${GREEN}build-prod${NC}     Build production containers"
  echo -e "  ${GREEN}logs${NC} [service] View logs for a service (client, server, mongodb, mongo-express)"
  echo -e "  ${GREEN}clean${NC}          Remove all containers, volumes, and images"
  echo -e "  ${GREEN}status${NC}         Show container status"
  echo -e "  ${GREEN}help${NC}           Show this help message"
  echo ""
}

# Check if Docker is running
function check_docker {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running or not installed.${NC}"
    exit 1
  fi
}

# Start development environment
function start_dev {
  check_docker
  echo -e "${GREEN}Starting development environment...${NC}"
  docker-compose -f docker-compose.dev.yml up -d
  echo -e "${GREEN}Development environment started.${NC}"
  echo -e "${YELLOW}Services:${NC}"
  echo -e "  - Client: ${GREEN}http://localhost:3000${NC}"
  echo -e "  - Server API: ${GREEN}http://localhost:8080/api${NC}"
  echo -e "  - MongoDB Express: ${GREEN}http://localhost:8081${NC}"
}

# Stop development environment
function stop_dev {
  check_docker
  echo -e "${GREEN}Stopping development environment...${NC}"
  docker-compose -f docker-compose.dev.yml down
  echo -e "${GREEN}Development environment stopped.${NC}"
}

# Start production environment
function start_prod {
  check_docker
  echo -e "${GREEN}Starting production environment...${NC}"
  docker-compose up -d
  echo -e "${GREEN}Production environment started.${NC}"
  echo -e "${YELLOW}Services:${NC}"
  echo -e "  - Client: ${GREEN}http://localhost:80${NC}"
  echo -e "  - Server API: ${GREEN}http://localhost:8080/api${NC}"
  echo -e "  - MongoDB Express: ${GREEN}http://localhost:8081${NC}"
}

# Stop production environment
function stop_prod {
  check_docker
  echo -e "${GREEN}Stopping production environment...${NC}"
  docker-compose down
  echo -e "${GREEN}Production environment stopped.${NC}"
}

# Build development containers
function build_dev {
  check_docker
  echo -e "${GREEN}Building development containers...${NC}"
  docker-compose -f docker-compose.dev.yml build
  echo -e "${GREEN}Development containers built.${NC}"
}

# Build production containers
function build_prod {
  check_docker
  echo -e "${GREEN}Building production containers...${NC}"
  docker-compose build
  echo -e "${GREEN}Production containers built.${NC}"
}

# View logs
function view_logs {
  check_docker
  if [ -z "$1" ]; then
    echo -e "${RED}Error: Please specify a service (client, server, mongodb, mongo-express).${NC}"
    exit 1
  fi
  
  # Check which environment is running
  if [ "$(docker-compose -f docker-compose.dev.yml ps -q)" ]; then
    echo -e "${GREEN}Viewing logs for $1 (development)...${NC}"
    docker-compose -f docker-compose.dev.yml logs -f "$1"
  elif [ "$(docker-compose ps -q)" ]; then
    echo -e "${GREEN}Viewing logs for $1 (production)...${NC}"
    docker-compose logs -f "$1"
  else
    echo -e "${RED}Error: No containers are running.${NC}"
    exit 1
  fi
}

# Clean up
function clean {
  check_docker
  echo -e "${YELLOW}Warning: This will remove all Church Planner containers, volumes, and images.${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Stopping all containers...${NC}"
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    docker-compose down 2>/dev/null
    
    echo -e "${GREEN}Removing volumes...${NC}"
    docker volume rm $(docker volume ls -q | grep church-planner) 2>/dev/null
    
    echo -e "${GREEN}Removing images...${NC}"
    docker rmi $(docker images | grep church-planner | awk '{print $3}') 2>/dev/null
    
    echo -e "${GREEN}Cleanup completed.${NC}"
  else
    echo -e "${GREEN}Cleanup canceled.${NC}"
  fi
}

# Show container status
function status {
  check_docker
  echo -e "${GREEN}Development Containers:${NC}"
  docker-compose -f docker-compose.dev.yml ps
  echo
  echo -e "${GREEN}Production Containers:${NC}"
  docker-compose ps
}

# Main script logic
case "$1" in
  start-dev)
    start_dev
    ;;
  stop-dev)
    stop_dev
    ;;
  start-prod)
    start_prod
    ;;
  stop-prod)
    stop_prod
    ;;
  build-dev)
    build_dev
    ;;
  build-prod)
    build_prod
    ;;
  logs)
    view_logs "$2"
    ;;
  clean)
    clean
    ;;
  status)
    status
    ;;
  help|*)
    show_help
    ;;
esac

exit 0 