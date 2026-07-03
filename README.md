# E-Commerce Clothing Platform

This is a full-stack e-commerce web application which provides a seamless shopping experience for customers to browse and purchase clothing, paired with a secure administrative dashboard for staff to manage the entire business operation.

## Features

### Customer Storefront
- **Product Discovery:** Browse clothing by categories, search, and filter options.
- **Shopping Cart & Checkout:** Add items to cart, apply discount codes, and securely check out.
- **User Accounts:** Customers can register, log in, manage their shipping addresses, and view order history.
- **Order Tracking:** Real-time status updates on active orders and returns.

### Admin Dashboard (Privileged Access)
- **Overview & Analytics:** Real-time data visualization for gross revenue, total orders, sales trends, and regional breakdowns.
- **Order Management:** Track, process, refund, and update statuses for customer orders.
- **Product & Inventory:** Manage clothing listings, upload images, set pricing, and monitor stock levels across variants (size/color).
- **Customer Management:** View customer profiles, order history, and account statuses.
- **Discounts & Coupons:** Create promotional codes (fixed amount or percentage), set usage limits, and track redemption.
- **Security & Settings:** Role-based access control, admin profile management, and a comprehensive audit log tracking all privileged actions.

## Tech Stack

- **Frontend:** React.js, CSS3, Lucide Icons
- **Backend:** Python, FastAPI 
- **Database:** PostgreSQL


## Installation & Setup

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/ChisengaSol/atelier-project.git
cd atelier-project
\`\`\`

### 2. Backend Setup (Python)
Navigate to your backend directory, set up your virtual environment, and install dependencies.

\`\`\`bash
# Create the virtual environment
python -m venv myenv

# Activate the virtual environment
# On Windows:
myenv\Scripts\activate
# On macOS/Linux:
source myenv/bin/activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### 3. Frontend Setup (React)
Navigate to your frontend directory and install the Node modules.

\`\`\`bash
npm install
\`\`\`

### 4. Environment Variables & Database
Create a `.env` file in the root of your backend and frontend directories. 

Example backend `.env` variables:
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
SECRET_KEY=your_secret_key
\`\`\`
*Note: Ensure you have run the necessary SQL scripts or ORM migrations to set up your tables (users, orders, products, coupons, audit_logs, etc.).*

## 🏃‍♂️ Running the Application

**Start the Backend Server:**
Ensure your virtual environment (`myenv`) is active, then run your Python server.
\`\`\`bash
# Example for FastAPI:
uvicorn main:app --reload --port 8000
\`\`\`

**Start the Frontend Server:**
Open a new terminal window, navigate to your frontend directory, and start the React app.
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Usage
Once both servers are running, open your browser:
- **Storefront:** Navigate to `http://localhost:5173` (or your frontend port) to access the customer shopping experience.
- **Admin Panel:** Navigate to the protected `/admin` routes and log in with your administrative credentials to manage the platform.