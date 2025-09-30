#!/bin/bash

# Fully Automated Self-Hosted Radio Dashboard Installation for Ubuntu 22.04 LTS
# Minimum 1GB RAM. Generates all passwords automatically. No manual configuration needed.
# Run as root: curl -fsSL https://raw.githubusercontent.com/treasureakintoye/ambradio-dashboard/main/scripts/install.sh | sudo bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/opt/radio-dashboard"
DB_NAME="radio_db"
APP_USER="radio"
DOMAIN="" # Set your domain here if needed for SSL
EMAIL="" # Set your email for SSL (optional)

# Generate secure random passwords
DB_PASS=$(openssl rand -hex 16)
SOURCE_PASS=$(openssl rand -hex 16)
ADMIN_PASS=$(openssl rand -hex 16)
AUTH_SECRET=$(openssl rand -hex 32)

# Prompt for domain and email if not provided as arguments
if [ $# -gt 0 ]; then
  DOMAIN=$1
  EMAIL=$2
fi

if [ -z "$DOMAIN" ]; then
  read -p "Enter your domain (or press Enter for no SSL): " DOMAIN
fi

if [ -z "$EMAIL" ]; then
  read -p "Enter your email for Let's Encrypt (optional for SSL): " EMAIL
fi

echo -e "${GREEN}Starting fully automated installation...${NC}"
echo "Generated passwords (save these for reference):"
echo "DB_PASS: $DB_PASS"
echo "SOURCE_PASS: $SOURCE_PASS"
echo "ADMIN_PASS: $ADMIN_PASS"
echo "AUTH_SECRET: $AUTH_SECRET"

# Update system
echo -e "${YELLOW}Updating system...${NC}"
apt update -y
apt upgrade -y

# Install Node.js 20
echo -e "${YELLOW}Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL 16
echo -e "${YELLOW}Installing PostgreSQL 16...${NC}"
apt install -y postgresql-16 postgresql-contrib-16

# Install Icecast2
echo -e "${YELLOW}Installing Icecast2...${NC}"
apt install -y icecast2

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
apt install -y nginx

# Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install build dependencies
apt install -y build-essential python3

# Create app directory and clone repo
echo -e "${YELLOW}Cloning repository...${NC}"
mkdir -p $APP_DIR
git clone https://github.com/treasureakintoye/ambradio-dashboard.git $APP_DIR
cd $APP_DIR

# Create app user
useradd -m -s /bin/false $APP_USER
chown -R $APP_USER:$APP_USER $APP_DIR

# Create .env with generated values
cp .env.example .env
sed -i "s/DATABASE_URL_PLACEHOLDER/postgresql:\/\/$DB_USER:$DB_PASS@localhost:5432\/$DB_NAME/g" .env
sed -i "s/NEXTAUTH_SECRET_PLACEHOLDER/$AUTH_SECRET/g" .env
sed -i "s/ICECAST_HOSTNAME_PLACEHOLDER/localhost/g" .env
sed -i "s/ICECAST_PORT_PLACEHOLDER/5994/g" .env
sed -i "s/ICECAST_MOUNT_POINT_PLACEHOLDER\/stream/g" .env
sed -i "s/ICECAST_PASSWORD_PLACEHOLDER/$SOURCE_PASS/g" .env
sed -i "s/NODE_ENV_PLACEHOLDER/production/g" .env

chmod 600 .env
chown $APP_USER:$APP_USER .env

# Install app dependencies as app user
echo -e "${YELLOW}Installing app dependencies...${NC}"
su - $APP_USER -c "cd $APP_DIR && npm install"

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create DB and user
su - postgres -c "
psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\" 
psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\"
"

# Run Prisma migrations
echo -e "${YELLOW}Running database migrations...${NC}"
su - $APP_USER -c "cd $APP_DIR && npx prisma generate"
su - $APP_USER -c "cd $APP_DIR && DATABASE_URL='postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME' npx prisma db push"

# Configure Icecast with generated password
echo -e "${YELLOW}Configuring Icecast...${NC}"
cat > /etc/icecast2/icecast.xml << EOF
<icecast>
    <location>Your Radio Station</location>
    <admin>
        <icestats-on-demand>1</icestats-on-demand>
        <limits>
            <clients>10000</clients>
        </limits>
    </admin>
    <limits>
        <clients>100</clients>
        <sources>5</sources>
        <threadpool>5</threadpool>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <connect-timeout>30</connect-timeout>
    </limits>
    <authentication>
        <source-password>$SOURCE_PASS</source-password>
        <admin-user>admin</admin-user>
        <admin-password>$ADMIN_PASS</admin-password>
    </authentication>
    <shoutcast-mount>/shoutcast</shoutcast-mount>
    <hostname>0.0.0.0</hostname>
    <listen-socket>
        <port>5994</port>
    </listen-socket>
    <fileserve>1</fileserve>
    <paths>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" dest="/status-json.xsl"/>
    </paths>
    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
    </logging>
</icecast>
EOF

systemctl start icecast2
systemctl enable icecast2

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
if [ -n "$DOMAIN" ]; then
  apt install -y certbot python3-certbot-nginx
fi

cat > /etc/nginx/sites-available/radio-dashboard << EOF
server {
    listen 80;
    server_name _;

    location / {
        return 301 https://$DOMAIN\$request_uri;
    }

    location /stream {
        proxy_pass http://127.0.0.1:5994;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_buffering off;
        proxy_cache off;
        tcp_nodelay on;
    }

    location /admin {
        proxy_pass http://127.0.0.1:5994;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

EOF

if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
  cat >> /etc/nginx/sites-available/radio-dashboard << EOF
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
EOF
else
  cat >> /etc/nginx/sites-available/radio-dashboard << EOF
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
EOF
fi

cat >> /etc/nginx/sites-available/radio-dashboard << EOF
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /public {
        alias /opt/radio-dashboard/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/radio-dashboard /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

# PM2 ecosystem config
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps : [{
    name: 'radio-dashboard',
    script: './node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: "postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME",
      NEXTAUTH_SECRET: '$AUTH_SECRET',
      NEXTAUTH_URL: 'https://$DOMAIN',
      ICECAST_HOSTNAME: 'localhost',
      ICECAST_PORT: '5994',
      ICECAST_MOUNT_POINT: '/stream',
      ICECAST_PASSWORD: '$SOURCE_PASS'
    },
    cwd: '$APP_DIR'
  }]
}
EOF

chown -R $APP_USER:$APP_USER $APP_DIR/ecosystem.config.js

# Start app with PM2
echo -e "${YELLOW}Starting application...${NC}"
su - $APP_USER -c "cd $APP_DIR && pm2 start ecosystem.config.js"
su - $APP_USER -c "pm2 save"
su - $APP_USER -c "pm2 startup"

# Setup SSL if domain provided
if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
  echo -e "${YELLOW}Setting up SSL certificate...${NC}"
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
fi

# Open firewall ports
ufw allow 'Nginx Full'
ufw allow 5994/tcp

# Final messages
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo -e "${YELLOW}Generated Passwords (save these):${NC}"
echo "Database: User=$DB_USER, Pass=$DB_PASS, DB=$DB_NAME"
echo "Icecast: Source=$SOURCE_PASS, Admin User=admin, Pass=$ADMIN_PASS"
echo "NextAuth Secret: $AUTH_SECRET"
echo ""
echo -e "${YELLOW}Access:${NC}"
echo "Dashboard: https://$DOMAIN (or http://your-ip if no domain)"
echo "Stream: https://$DOMAIN/stream"
echo "Icecast Admin: https://$DOMAIN/admin"
echo "PM2 Status: pm2 status"
echo "PM2 Logs: pm2 logs"
echo ""
echo -e "${YELLOW}To restart:${NC}"
echo "pm2 restart radio-dashboard"
echo ""
echo -e "${RED}Security:${NC}"
echo "For production, monitor logs, update ufw rules, consider fail2ban."
echo "Passwords are auto-generated; change if needed via .env and restart services."
