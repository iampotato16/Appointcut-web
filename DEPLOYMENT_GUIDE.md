# Capstone Demo: Digital Ocean Deployment Guide

This guide is tailored for deploying the Appointcut-web application to a Digital Ocean Droplet for demonstration purposes using the server's raw IP address (No Domain/SSL required).

---

## 1. Create a Droplet
1. Log in to your Digital Ocean account.
2. Click **Create** -> **Droplets**.
3. **Region:** Choose the region closest to where you will present the demo (e.g., Singapore for SEA).
4. **Image/OS:** Select **Ubuntu 22.04 LTS**.
5. **Size:** Select **Basic Plan** -> **Regular SSD** -> **$6/mo** (1GB RAM / 1 CPU).
6. **Authentication:** Choose **Password** (easiest for beginners) and create a strong root password.
7. Click **Create Droplet**.
8. Once created, copy the Droplet's **IPv4 Address**.

---

## 2. Server Initial Setup (SSH)
Open your terminal (Command Prompt/PowerShell on Windows, Terminal on Mac) and connect to the server:
```bash
ssh root@your_droplet_ip_address
```
*(It will ask for the password you created in step 1)*

Update the server's package list:
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
We will install Node.js using NodeSource (v16 is stable for most older Express/MySQL projects, but v18 is fine too):
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install MySQL Server
```bash
sudo apt install mysql-server -y
```

---

## 3. Database Setup
Log in to the MySQL command line:
```bash
sudo mysql
```

Run these SQL commands exactly as written (you can change the password):
```sql
-- Create the database
CREATE DATABASE appointcutdb;

-- Create the user (Replace 'password123' with a secure password)
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password123';

-- Grant permissions
GRANT ALL PRIVILEGES ON appointcutdb.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Application Setup

### Clone/Upload Your Code
If your code is on GitHub (make sure it's public for the demo, or set up SSH keys if private):
```bash
git clone https://github.com/your-username/appointcut-web.git
cd appointcut-web
```
*(Alternatively, you can use SFTP tools like FileZilla or WinSCP to drag and drop your folder into the `/root` directory of the server).*

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Create the `.env` file:
```bash
nano .env
```
Paste the following (Ensure the password matches what you set in MySQL):
```env
PORT=3000
DB_HOST=localhost
DB_USER=admin
DB_PASS=password123
DB_NAME=appointcutdb
DB_PORT=3306
```
*(Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit).*

---

## 5. Load the Database Tables
You need to import your SQL files into the new database. Assuming you are in the `appointcut-web` folder:
```bash
mysql -u admin -p appointcutdb < init.sql
mysql -u admin -p appointcutdb < init_views.sql
mysql -u admin -p appointcutdb < seed.sql
```
*(It will prompt for the `password123` you created earlier).*

---

## 6. Process Management (PM2)
To keep the app running even when you close the terminal window, use PM2.

```bash
sudo npm install -g pm2
pm2 start app.js --name "appointcut"
pm2 startup ubuntu
```
*(The `pm2 startup` command will print a long command starting with `sudo env...`. Copy that output and paste it back into your terminal and press Enter).*
```bash
pm2 save
```

---

## 7. Web Server Configuration (Nginx)
Nginx will take incoming web traffic on port 80 (HTTP) and route it to your Node.js app running on port 3000.

Install Nginx:
```bash
sudo apt install nginx -y
```

Open the default configuration file:
```bash
sudo nano /etc/nginx/sites-available/default
```

Delete everything in that file and paste this exact configuration (This handles the IP routing and keeps Socket.io working):
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*(Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit).*

Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. Firewall Setup
Finally, open the firewall so the web can access your server:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx HTTP'
sudo ufw enable
```
*(Type `y` when asked if you want to proceed).*

## 9. You're Done!
Open your web browser and go to:
**`http://YOUR_DROPLET_IP_ADDRESS`**

Your capstone project should now be live and ready for demonstration!