# Inventory and Data Management System (REST API)

A persistent, database-driven RESTful backend built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose** for managing a store or warehouse product catalogue. This project implements schema validation, full CRUD operations, advanced query-string filtering/sorting/pagination, safe stock adjustments, and MongoDB aggregation pipelines for inventory analytics.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Data Model (`Product` Schema)](#data-model-product-schema)
- [API Endpoints Reference](#api-endpoints-reference)
  - [1. Create a Product](#1-create-a-product)
  - [2. Get All Products (Filter, Search, Sort, Paginate)](#2-get-all-products-filter-search-sort-paginate)
  - [3. Get Single Product by ID](#3-get-single-product-by-id)
  - [4. Update Product Details](#4-update-product-details)
  - [5. Adjust Stock Levels (Restock / Sale)](#5-adjust-stock-levels-restock--sale)
  - [6. Delete a Product](#6-delete-a-product)
  - [7. Low-Stock Alert Report](#7-low-stock-alert-report)
  - [8. Category-wise Inventory Summary](#8-category-wise-inventory-summary)
- [Error Handling](#error-handling)

---

## Features

- **Schema Validation & Virtual Fields:** Enforces field-level validation (required fields, minimum values, unique uppercase SKUs) and dynamically calculates `stockValue` (`price * quantity`).
- **Complete RESTful CRUD:** Create, retrieve, update, and delete inventory items with proper HTTP status codes (`200`, `201`, `400`, `404`, `500`).
- **Advanced Querying:** Supports case-insensitive keyword search (`name` & `sku`), category/supplier filtering, price range filtering (`minPrice`/`maxPrice`), multi-field sorting, and pagination.
- **Safe Stock Operations:** Dedicated `PATCH` endpoint for restocking (`+`) and recording sales (`-`) with built-in protection against negative inventory counts.
- **MongoDB Aggregation Pipelines:** Real-time reporting for low-stock alerts (`quantity <= reorderLevel`) and category-level financial/stock summaries.
- **Centralized Error Handling:** Custom Express error middleware handling Mongoose `ValidationError`, `CastError`, and duplicate key (`11000`) exceptions cleanly.

---

## Technology Stack

- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB
- **ODM (Object Data Modeling):** Mongoose
- **Environment Management:** dotenv
- **Development Utility:** Nodemon

---

## Project Structure

```text
inventory-management-api/
├── config/
│   └── db.js                   # MongoDB connection setup via Mongoose
├── controllers/
│   └── productController.js    # Business logic, CRUD, querying & aggregation pipelines
├── middleware/
│   └── errorHandler.js         # Centralized error handling middleware
├── models/
│   └── Product.js              # Mongoose schema, validation rules & virtual properties
├── routes/
│   └── productRoutes.js        # Modular Express API route definitions
├── .env                        # Environment variables (excluded from Git)
├── .gitignore                  # Git ignore rules
├── package.json                # Project metadata and npm scripts
├── README.md                   # Project documentation
└── server.js                   # Express application entry point
```

---

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally (or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI)
- [Postman](https://www.postman.com/) or cURL for API testing

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd inventory-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add your configuration (see [Environment Variables](#environment-variables)).

4. **Start the server:**
   - **Development mode (with auto-reload via Nodemon):**
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     npm start
     ```

   Once running, the terminal will display:
   ```text
   Server running on http://localhost:5000
   MongoDB Connected: 127.0.0.1
   ```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
```

---

## Data Model (`Product` Schema)

| Field | Type | Constraints / Validation | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required, trimmed, min 2 chars | Name of the product |
| `sku` | `String` | Required, unique, uppercase, trimmed | Stock Keeping Unit identifier |
| `category` | `String` | Required, trimmed | Product category (e.g., `Electronics`, `Furniture`) |
| `price` | `Number` | Required, min `0` | Unit price of the product |
| `quantity` | `Number` | Required, min `0`, default `0` | Current available stock count |
| `reorderLevel` | `Number` | Min `0`, default `5` | Threshold below which low-stock alert triggers |
| `supplier` | `String` | Required, trimmed | Supplier or vendor name |
| `stockValue` | `Number` | *Virtual Field* (`price * quantity`) | Total monetary value of current stock |
| `createdAt` | `Date` | *Auto-generated (`timestamps`)* | Document creation timestamp |
| `updatedAt` | `Date` | *Auto-generated (`timestamps`)* | Document last update timestamp |

---

## API Endpoints Reference

Base URL: `http://localhost:5000/api/products`

### 1. Create a Product
- **Method:** `POST`
- **Endpoint:** `/api/products`
- **Request Body (`application/json`):**
  ```json
  {
    "name": "Gel Pen Pack of 15",
    "sku": "STNY-PN-713",
    "category": "Stationery",
    "price": 120,
    "quantity": 48,
    "reorderLevel": 20,
    "supplier": "Cello Pens"
  }
  ```
- **Response (`201 Created`):** Returns the newly created product document including `stockValue` and `_id`.

---

### 2. Get All Products (Filter, Search, Sort, Paginate)
- **Method:** `GET`
- **Endpoint:** `/api/products`
- **Optional Query Parameters:**

| Parameter | Example | Description |
| :--- | :--- | :--- |
| `category` | `?category=Furniture` | Filter by exact category name |
| `supplier` | `?supplier=IKEA%20India` | Filter by supplier name |
| `search` | `?search=table` | Case-insensitive partial match on `name` or `sku` |
| `minPrice` | `?minPrice=100` | Products with price $\ge$ `minPrice` |
| `maxPrice` | `?maxPrice=5000` | Products with price $\le$ `maxPrice` |
| `sort` | `?sort=price` or `?sort=-price` | Sort ascending (`price`) or descending (`-price`) |
| `page` | `?page=1` | Page number for pagination (default: `1`) |
| `limit` | `?limit=10` | Number of records per page (default: `10`) |

- **Response (`200 OK`):**
  ```json
  {
    "total": 12,
    "page": 1,
    "totalPages": 2,
    "count": 10,
    "products": [ ... ]
  }
  ```

---

### 3. Get Single Product by ID
- **Method:** `GET`
- **Endpoint:** `/api/products/:id`
- **Response (`200 OK`):** Returns the matching product object. Returns `404 Not Found` if the ID does not exist.

---

### 4. Update Product Details
- **Method:** `PUT`
- **Endpoint:** `/api/products/:id`
- **Request Body (`application/json`):**
  ```json
  {
    "name": "Gel Pen Pack of 15",
    "sku": "STNY-PN-713",
    "category": "Stationery",
    "price": 140,
    "quantity": 60
  }
  ```
- **Response (`200 OK`):** Returns the updated product document with recalculated `stockValue`.

---

### 5. Adjust Stock Levels (Restock / Sale)
- **Method:** `PATCH`
- **Endpoint:** `/api/products/:id/stock`
- **Request Body (`application/json`):**
  ```json
  {
    "change": 10
  }
  ```
  *(Use positive numbers like `10` to restock and negative numbers like `-5` to record a sale. Rejects requests that would result in negative stock).*
- **Response (`200 OK`):**
  ```json
  {
    "message": "Stock updated",
    "product": { ... }
  }
  ```

---

### 6. Delete a Product
- **Method:** `DELETE`
- **Endpoint:** `/api/products/:id`
- **Response (`200 OK`):**
  ```json
  {
    "message": "Product deleted",
    "id": "6a547727f6123427d6e61d7c"
  }
  ```

---

### 7. Low-Stock Alert Report
- **Method:** `GET`
- **Endpoint:** `/api/products/low-stock`
- **Description:** Uses a MongoDB aggregation pipeline (`$match` with `$expr`) to find all products where `quantity <= reorderLevel`, sorted by lowest quantity first.
- **Response (`200 OK`):**
  ```json
  {
    "count": 4,
    "lowStockItems": [ ... ]
  }
  ```

---

### 8. Category-wise Inventory Summary
- **Method:** `GET`
- **Endpoint:** `/api/products/summary`
- **Description:** Uses a MongoDB aggregation pipeline (`$group`, `$project`, `$sort`) to aggregate inventory metrics per category.
- **Response (`200 OK`):**
  ```json
  {
    "categories": 5,
    "summary": [
      {
        "_id": "Electronics",
        "totalItems": 4,
        "totalQuantity": 96,
        "totalStockValue": 343904,
        "avgPrice": 5636.5
      }
    ]
  }
  ```

---

## Error Handling

All errors are routed through `middleware/errorHandler.js` and return a standardized JSON response:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| HTTP Status | Scenario |
| :--- | :--- |
| `400 Bad Request` | Missing required fields, negative price/quantity, duplicate SKU, insufficient stock, or malformed MongoDB ObjectId |
| `404 Not Found` | Product ID does not exist or invalid API route requested |
| `500 Internal Server Error` | Unexpected server or database failure |