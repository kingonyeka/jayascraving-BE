# Jayascravings Backend — API Guide

**Complete reference for all REST endpoints and GraphQL operations.**  
Built by Techillionaire Solutions Ltd. for Jayascravings.

---

## 1. Base Configuration & Authentication

### Base URL

```
Development:  http://localhost:3000/api
Production:   https://jaya-y1gr.onrender.com/api
GraphQL:      https://jaya-y1gr.onrender.com/graphql
```

### Content-Type Headers

All REST requests must include:

```
Content-Type: application/json
```

File upload endpoints use:

```
Content-Type: multipart/form-data
```

GraphQL requests must include:

```
Content-Type: application/json
```

### Authentication

This API uses JWT Bearer token authentication. After logging in via `googleAuth`, include the access token on every protected request:

```
Authorization: Bearer <accessToken>
```

**Token lifecycle:**
- Access token expires in **15 minutes**
- Refresh token is stored in an `httpOnly` cookie named `refreshToken`, valid for the duration of `JWT_REFRESH_EXPIRES_IN` (default **30 days**) — the cookie's `maxAge`, the JWT's own expiry, and the DB record's expiry are all derived from this single config value, so they can no longer drift out of sync with each other
- Call `mutation { refreshToken }` to get a new access token — the cookie is sent automatically by the browser. This mutation is now properly authenticated against the refresh-token cookie server-side (previously it accepted the request without actually validating the cookie)

**Service-to-service calls** require an additional API key header:

```
x-api-key: <INTERNAL_API_KEY>
```

### Standard Error Response Format

All errors return the following JSON shape:

```json
{
  "statusCode": 401,
  "message": ["Unauthorized"],
  "error": "UNAUTHENTICATED",
  "path": "/api/payments/webhook",
  "timestamp": "2026-07-13T10:00:00.000Z"
}
```

GraphQL errors return:

```json
{
  "errors": [
    {
      "message": "Access token is missing or invalid",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "statusCode": 401
      }
    }
  ],
  "data": null
}
```

### User Roles

| Role | Description |
|---|---|
| `CUSTOMER` | Default role for all registered users |
| `ADMIN` | Full access to all admin features |
| `SALES` | Can manage orders and customers |
| `BAKER` | Can view and update production queue |
| `DELIVERY` | Can view and update delivery status |
| `VIEWER` | Read-only dashboard access |

---

## 2. REST Endpoints

### 2.1 Payments

#### POST /api/payments/webhook

Paystack calls this endpoint automatically when a payment event occurs. Do not call this manually.

**Auth:** None (verified via HMAC-SHA512 signature over the raw request body)  
**Headers:**
```
x-paystack-signature: <hmac_sha512_hash>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "live",
    "status": "success",
    "reference": "JC-ABC123456789",
    "amount": 1500000,
    "gateway_response": "Successful",
    "paid_at": "2026-07-13T10:00:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "customer": {
      "id": 987,
      "email": "customer@example.com"
    }
  }
}
```

**Success Response (200):**
```json
{
  "status": "ok"
}
```

> **Note:** signature verification is computed over the exact raw request bytes (not a re-serialized copy of the parsed body), using a constant-time comparison. This endpoint accepts any extra fields Paystack includes beyond what's documented above — the payload isn't strictly whitelisted, since Paystack's real payloads carry more fields than any fixed schema would predict.

---

### 2.2 Media

All `/api/media/*` endpoints below now require authentication (`Authorization: Bearer <accessToken>`). Guest/anonymous access has been removed.

#### POST /api/media/presign

Get a presigned S3 URL to upload a file directly from the browser. The file never passes through the API server.

**Auth:** Required — any authenticated role  
**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mimeType": "image/jpeg",
  "category": "PRODUCT"
}
```

**Available categories:** `PRODUCT`, `REVIEW`, `CUSTOM_ORDER`, `CUSTOM_ORDER_PROOF`, `AVATAR`, `CATEGORY`

**Success Response (200):**
```json
{
  "uploadUrl": "https://jayascravings-bucket.s3.amazonaws.com/products/uuid.jpg?X-Amz-...",
  "key": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "publicUrl": "https://cdn.jayascravings.com/products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "folder": "products"
}
```

**Upload flow:**
1. Call `POST /api/media/presign` to get the `uploadUrl`
2. PUT the file directly to `uploadUrl` from the browser
3. Call `POST /api/media/confirm` with the returned `key`

---

#### POST /api/media/confirm

Confirm a completed S3 upload and save the media record to the database.

**Auth:** Required — any authenticated role  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "key": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "originalName": "red-velvet-cake.jpg",
  "mimeType": "image/jpeg",
  "size": 245760,
  "category": "PRODUCT",
  "referenceId": "prod-uuid-here"
}
```

**Success Response (201):**
```json
{
  "id": "media-uuid-1",
  "uploadedBy": "user-uuid-1",
  "key": "products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "url": "https://cdn.jayascravings.com/products/550e8400-e29b-41d4-a716-446655440000.jpg",
  "originalName": "red-velvet-cake.jpg",
  "mimeType": "image/jpeg",
  "size": 245760,
  "fileType": "IMAGE",
  "category": "PRODUCT",
  "referenceId": "prod-uuid-here",
  "createdAt": "2026-07-13T10:00:00.000Z"
}
```

> **Tip:** for products, you don't need to call `confirm` and then separately attach media — `createProduct`/`updateProduct` (see §3.3) now accept `mediaKeys`/`mediaUrls` directly and save the `ProductMedia` records atomically with the product itself.

---

#### GET /api/media/:id

Get a media record by ID.

**Auth:** Required — any authenticated role

**Success Response (200):**
```json
{
  "id": "media-uuid-1",
  "uploadedBy": "user-uuid-1",
  "key": "products/550e8400.jpg",
  "url": "https://cdn.jayascravings.com/products/550e8400.jpg",
  "originalName": "red-velvet-cake.jpg",
  "mimeType": "image/jpeg",
  "size": 245760,
  "fileType": "IMAGE",
  "category": "PRODUCT",
  "referenceId": "prod-uuid-here",
  "createdAt": "2026-07-13T10:00:00.000Z"
}
```

---

#### DELETE /api/media/:id

Delete your own media record and its S3 object.

**Auth:** Required — owner only (the uploader's `userId` must match)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true
}
```

---

#### DELETE /api/media/:id/admin  🆕

Force-delete any media record, regardless of who uploaded it (e.g. removing a policy-violating review photo). Bypasses the ownership check used by the regular delete endpoint above.

**Auth:** Admin, Sales  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true
}
```

---

### 2.3 Analytics (Live Dashboard)

#### GET /api/analytics/live

Server-Sent Events stream for the real-time admin dashboard. Opens a persistent connection and pushes events as they happen.

**Auth:** Admin, Sales  
**Headers:**
```
Authorization: Bearer <accessToken>
Accept: text/event-stream
```

**Frontend usage:**
```js
const es = new EventSource('/api/analytics/live', { withCredentials: true });

es.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'SNAPSHOT') {
    // initial dashboard state
    console.log(data.payload.todayOrders);
    console.log(data.payload.todayRevenue);
    console.log(data.payload.pendingOrders);
    console.log(data.payload.totalCustomers);
  }

  if (data.type === 'NEW_ORDER') {
    console.log(data.payload.orderNumber);
    console.log(data.payload.total);
  }

  if (data.type === 'PAYMENT_RECEIVED') {
    console.log(data.payload.amount);
  }

  if (data.type === 'ORDER_STATUS_CHANGED') {
    console.log(data.payload.status);
  }

  if (data.type === 'NEW_CUSTOMER') {
    console.log(data.payload.email);
  }

  if (data.type === 'HEARTBEAT') {
    // connection keep-alive, no action needed
  }
};

// close on component unmount
es.close();
```

**Initial SNAPSHOT event payload:**
```json
{
  "type": "SNAPSHOT",
  "payload": {
    "todayOrders": 12,
    "todayRevenue": 185000,
    "pendingOrders": 4,
    "totalCustomers": 238
  },
  "timestamp": "2026-07-13T10:00:00.000Z"
}
```

**NEW_ORDER event:**
```json
{
  "type": "NEW_ORDER",
  "payload": {
    "orderId": "order-uuid-1",
    "orderNumber": "JC-000042",
    "total": 25000,
    "userId": "user-uuid-1"
  },
  "timestamp": "2026-07-13T10:05:00.000Z"
}
```

**PAYMENT_RECEIVED event:**
```json
{
  "type": "PAYMENT_RECEIVED",
  "payload": {
    "paymentId": "payment-uuid-1",
    "amount": 25000,
    "orderId": "order-uuid-1"
  },
  "timestamp": "2026-07-13T10:06:00.000Z"
}
```

**ORDER_STATUS_CHANGED event:**
```json
{
  "type": "ORDER_STATUS_CHANGED",
  "payload": {
    "orderId": "order-uuid-1",
    "orderNumber": "JC-000042",
    "status": "BAKING"
  },
  "timestamp": "2026-07-13T10:10:00.000Z"
}
```

**NEW_CUSTOMER event 🆕:**
```json
{
  "type": "NEW_CUSTOMER",
  "payload": {
    "id": "user-uuid-2",
    "email": "newcustomer@example.com"
  },
  "timestamp": "2026-07-13T10:12:00.000Z"
}
```

> **Note:** this stream now requires the `ADMIN` or `SALES` role specifically (previously any authenticated user, including plain customers, could open it).

---

### 2.4 Health

#### GET /api/health

Full health check — tests database connectivity, Redis connectivity, heap memory and RSS memory.

**Auth:** None  
**Success Response (200):**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

**Degraded Response (503):**
```json
{
  "status": "error",
  "info": {
    "redis": { "status": "up" }
  },
  "error": {
    "database": { "status": "down", "message": "Connection refused" }
  }
}
```

---

#### GET /api/health/live

Liveness probe — confirms the Node.js process is running. Used by Docker HEALTHCHECK and Render.

**Auth:** None  
**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-07-13T10:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

---

#### GET /api/health/ready

Readiness probe — confirms the database is connected and the app is ready to serve traffic.

**Auth:** None  
**Success Response (200):**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

---

## 3. GraphQL API

**Endpoint:** `POST /graphql`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>   (for protected operations)
```

**Request format:**
```json
{
  "query": "mutation { googleAuth(input: { idToken: \"...\" }) { accessToken user { id email } } }",
  "variables": {}
}
```

> **Note:** GraphQL introspection (schema browsing via tools like GraphQL Playground/Voyager) is only enabled when `NODE_ENV !== 'production'`. In production, use this guide or your own schema copy rather than relying on introspection.

---

### 3.1 Auth

#### mutation googleAuth

Sign in or register using a Google ID token obtained from Google Sign-In on the frontend. Creates a new user account automatically on first login.

**Auth:** None (public) — rate-limited to 10 requests/minute/IP

**Operation:**
```graphql
mutation GoogleAuth($input: GoogleAuthInput!) {
  googleAuth(input: $input) {
    accessToken
    user {
      id
      email
      fullName
      avatarUrl
      role
      createdAt
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
}
```

**Response:**
```json
{
  "data": {
    "googleAuth": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "customer@example.com",
        "fullName": "Jane Doe",
        "avatarUrl": "https://lh3.googleusercontent.com/...",
        "role": "CUSTOMER",
        "createdAt": "2026-07-13T10:00:00.000Z"
      }
    }
  }
}
```

**Note:** The refresh token is automatically set as an `httpOnly` cookie named `refreshToken`. The browser sends it automatically on subsequent requests. The Google ID token is now also required to have `email_verified: true` in its payload — a token for an unverified Google email will be rejected.

---

#### mutation refreshToken

Get a new access token using the refresh token cookie. Call this when the access token expires (after 15 minutes).

**Auth:** None (uses httpOnly cookie automatically) — rate-limited to 10 requests/minute/IP

**Operation:**
```graphql
mutation {
  refreshToken {
    accessToken
    user {
      id
      email
      role
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "refreshToken": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "customer@example.com",
        "role": "CUSTOMER"
      }
    }
  }
}
```

---

#### mutation logout

Log out from the current device. Revokes the refresh token and clears the cookie.

**Auth:** Customer, Admin, any authenticated role

**Operation:**
```graphql
mutation {
  logout
}
```

**Response:**
```json
{
  "data": {
    "logout": true
  }
}
```

---

#### mutation logoutAll

Log out from all devices. Revokes all refresh tokens for the user.

**Auth:** Customer, Admin, any authenticated role

**Operation:**
```graphql
mutation {
  logoutAll
}
```

**Response:**
```json
{
  "data": {
    "logoutAll": true
  }
}
```

---

### 3.2 Users

#### query me

Get the currently authenticated user's profile.

**Auth:** Any authenticated role

**Operation:**
```graphql
query {
  me {
    id
    email
    fullName
    avatarUrl
    phone
    role
    isActive
    lastLoginAt
    createdAt
    updatedAt
  }
}
```

**Response:**
```json
{
  "data": {
    "me": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "customer@example.com",
      "fullName": "Jane Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "phone": "08012345678",
      "role": "CUSTOMER",
      "isActive": true,
      "lastLoginAt": "2026-07-13T10:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-07-13T10:00:00.000Z"
    }
  }
}
```

---

#### mutation updateProfile

Update the current user's profile details.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation UpdateProfile($input: UpdateUserInput!) {
  updateProfile(input: $input) {
    id
    fullName
    phone
    avatarUrl
    updatedAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "fullName": "Jane Adeyemi",
    "phone": "08098765432",
    "avatarUrl": "https://cdn.jayascravings.com/avatars/new-avatar.jpg"
  }
}
```

**Response:**
```json
{
  "data": {
    "updateProfile": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "Jane Adeyemi",
      "phone": "08098765432",
      "avatarUrl": "https://cdn.jayascravings.com/avatars/new-avatar.jpg",
      "updatedAt": "2026-07-13T11:00:00.000Z"
    }
  }
}
```

---

#### mutation updateFcmToken  🆕

Register (or clear) this device's Firebase Cloud Messaging token so the user can receive push notifications for order updates, payment confirmations, and custom-order quotes. Call this after the user grants notification permission in your mobile/web app, and again on logout with `fcmToken: null` to stop sending pushes to that device.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation UpdateFcmToken($fcmToken: String) {
  updateFcmToken(fcmToken: $fcmToken)
}
```

**Variables (register):**
```json
{
  "fcmToken": "dGhpcyBpcyBhIGZha2UgZmNtIHRva2Vu..."
}
```

**Variables (clear on logout):**
```json
{
  "fcmToken": null
}
```

**Response:**
```json
{
  "data": {
    "updateFcmToken": true
  }
}
```

---

#### query myAddresses

Get all saved delivery addresses for the current user.

**Auth:** Any authenticated role

**Operation:**
```graphql
query {
  myAddresses {
    id
    label
    recipientName
    phone
    street
    city
    state
    postalCode
    isDefault
    createdAt
  }
}
```

**Response:**
```json
{
  "data": {
    "myAddresses": [
      {
        "id": "addr-uuid-1",
        "label": "Home",
        "recipientName": "Jane Doe",
        "phone": "08012345678",
        "street": "12 Cake Street",
        "city": "Lagos",
        "state": "Lagos",
        "postalCode": "100001",
        "isDefault": true,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### mutation addAddress

Add a new delivery address.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation AddAddress($input: CreateAddressInput!) {
  addAddress(input: $input) {
    id
    label
    recipientName
    phone
    street
    city
    state
    isDefault
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "label": "Office",
    "recipientName": "Jane Doe",
    "phone": "08012345678",
    "street": "5 Business Avenue",
    "city": "Lagos",
    "state": "Lagos",
    "postalCode": "100002",
    "isDefault": false
  }
}
```

**Response:**
```json
{
  "data": {
    "addAddress": {
      "id": "addr-uuid-2",
      "label": "Office",
      "recipientName": "Jane Doe",
      "phone": "08012345678",
      "street": "5 Business Avenue",
      "city": "Lagos",
      "state": "Lagos",
      "isDefault": false,
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  }
}
```

---

#### mutation setDefaultAddress

Set an address as the default delivery address.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation SetDefaultAddress($addressId: ID!) {
  setDefaultAddress(addressId: $addressId) {
    id
    label
    isDefault
  }
}
```

**Variables:**
```json
{
  "addressId": "addr-uuid-2"
}
```

**Response:**
```json
{
  "data": {
    "setDefaultAddress": {
      "id": "addr-uuid-2",
      "label": "Office",
      "isDefault": true
    }
  }
}
```

---

#### mutation deleteAddress

Delete a saved address.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation DeleteAddress($addressId: ID!) {
  deleteAddress(addressId: $addressId)
}
```

**Variables:**
```json
{
  "addressId": "addr-uuid-2"
}
```

**Response:**
```json
{
  "data": {
    "deleteAddress": true
  }
}
```

---

#### mutation suspendUser

Suspend a customer account. Admin and Sales only.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation SuspendUser($userId: ID!) {
  suspendUser(userId: $userId) {
    id
    email
    isActive
  }
}
```

**Variables:**
```json
{
  "userId": "user-uuid-1"
}
```

**Response:**
```json
{
  "data": {
    "suspendUser": {
      "id": "user-uuid-1",
      "email": "customer@example.com",
      "isActive": false
    }
  }
}
```

---

#### mutation activateUser

Reactivate a suspended customer account.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation ActivateUser($userId: ID!) {
  activateUser(userId: $userId) {
    id
    email
    isActive
  }
}
```

**Variables:**
```json
{
  "userId": "user-uuid-1"
}
```

**Response:**
```json
{
  "data": {
    "activateUser": {
      "id": "user-uuid-1",
      "email": "customer@example.com",
      "isActive": true
    }
  }
}
```

---

### 3.3 Products

#### query products

Get paginated list of available products with optional filters.

**Auth:** None (public)

**Operation:**
```graphql
query Products($filter: ProductFilterInput, $pagination: PaginationInput) {
  products(filter: $filter, pagination: $pagination) {
    data {
      id
      name
      slug
      description
      basePrice
      isAvailable
      isFeatured
      stockCount
      category {
        id
        name
        slug
      }
      media {
        id
        url
        fileType
        isPrimary
        sortOrder
      }
      variants {
        id
        name
        type
        additionalPrice
        isAvailable
      }
      customisationOptions {
        id
        name
        type
        options
        additionalPrice
        isRequired
      }
      createdAt
    }
    total
    page
    limit
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
```

**Variables:**
```json
{
  "filter": {
    "search": "velvet",
    "categoryId": "cat-uuid-1",
    "minPrice": 5000,
    "maxPrice": 50000,
    "isAvailable": true,
    "isFeatured": false
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

**Response:**
```json
{
  "data": {
    "products": {
      "data": [
        {
          "id": "prod-uuid-1",
          "name": "Red Velvet Cake",
          "slug": "red-velvet-cake",
          "description": "Moist red velvet with cream cheese frosting",
          "basePrice": 15000,
          "isAvailable": true,
          "isFeatured": true,
          "stockCount": 10,
          "category": {
            "id": "cat-uuid-1",
            "name": "Cakes",
            "slug": "cakes"
          },
          "media": [
            {
              "id": "media-uuid-1",
              "url": "https://cdn.jayascravings.com/products/red-velvet.jpg",
              "fileType": "IMAGE",
              "isPrimary": true,
              "sortOrder": 0
            }
          ],
          "variants": [
            {
              "id": "var-uuid-1",
              "name": "6 inch",
              "type": "size",
              "additionalPrice": 0,
              "isAvailable": true
            },
            {
              "id": "var-uuid-2",
              "name": "8 inch",
              "type": "size",
              "additionalPrice": 5000,
              "isAvailable": true
            }
          ],
          "customisationOptions": [
            {
              "id": "opt-uuid-1",
              "name": "Message Inscription",
              "type": "text",
              "options": null,
              "additionalPrice": 500,
              "isRequired": false
            }
          ],
          "createdAt": "2026-01-01T00:00:00.000Z"
        }
      ],
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

#### query product

Get a single product by ID.

**Auth:** None (public)

**Operation:**
```graphql
query Product($id: ID!) {
  product(id: $id) {
    id
    name
    slug
    description
    basePrice
    isAvailable
    isFeatured
    stockCount
    metaTitle
    metaDescription
    category {
      id
      name
    }
    media {
      id
      url
      fileType
      isPrimary
    }
    variants {
      id
      name
      type
      additionalPrice
    }
    customisationOptions {
      id
      name
      type
      options
      additionalPrice
      isRequired
    }
  }
}
```

**Variables:**
```json
{
  "id": "prod-uuid-1"
}
```

---

#### query productBySlug

Get a single product by its URL slug.

**Auth:** None (public)

**Operation:**
```graphql
query ProductBySlug($slug: String!) {
  productBySlug(slug: $slug) {
    id
    name
    slug
    basePrice
    isAvailable
    category {
      id
      name
    }
    media {
      url
      isPrimary
    }
    variants {
      id
      name
      type
      additionalPrice
    }
  }
}
```

**Variables:**
```json
{
  "slug": "red-velvet-cake"
}
```

---

#### query featuredProducts

Get up to 10 featured products for the homepage.

**Auth:** None (public)

**Operation:**
```graphql
query {
  featuredProducts {
    id
    name
    slug
    basePrice
    media {
      url
      isPrimary
    }
    category {
      name
    }
  }
}
```

---

#### query categories

Get all active product categories.

**Auth:** None (public)

**Operation:**
```graphql
query {
  categories {
    id
    name
    slug
    description
    imageUrl
    isActive
    sortOrder
  }
}
```

**Response:**
```json
{
  "data": {
    "categories": [
      {
        "id": "cat-uuid-1",
        "name": "Cakes",
        "slug": "cakes",
        "description": "Custom and standard cakes for every occasion",
        "imageUrl": "https://cdn.jayascravings.com/categories/cakes.jpg",
        "isActive": true,
        "sortOrder": 0
      }
    ]
  }
}
```

---

#### mutation createProduct

Create a new product, optionally attaching photos in the same call. Admin and Sales only.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    slug
    basePrice
    isAvailable
    media {
      id
      url
      isPrimary
      sortOrder
    }
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Chocolate Lava Cake",
    "description": "Warm chocolate cake with molten centre",
    "basePrice": 12000,
    "categoryId": "cat-uuid-1",
    "isAvailable": true,
    "isFeatured": false,
    "stockCount": 20,
    "metaTitle": "Chocolate Lava Cake | Jayascravings",
    "metaDescription": "Order our famous chocolate lava cake for delivery in Lagos",
    "mediaKeys": [
      "products/lava-cake-1.jpg",
      "products/lava-cake-2.jpg"
    ],
    "mediaUrls": [
      "https://cdn.jayascravings.com/products/lava-cake-1.jpg",
      "https://cdn.jayascravings.com/products/lava-cake-2.jpg"
    ]
  }
}
```

> **🆕 `mediaKeys` / `mediaUrls`:** upload each image first via `POST /api/media/presign` + a direct PUT to S3 (see §2.2), then pass the resulting `key`/CDN URL pairs here — same index in both arrays = same file. The product and its photos are saved atomically in one DB transaction. The first entry becomes the primary image. Both arrays are optional; omit them to create a product with no photos yet. They must be the same length (max 20 entries) or the mutation throws a `BAD_REQUEST`.

---

#### mutation updateProduct

Update an existing product. Can also add new photos or wholesale-replace existing ones.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation UpdateProduct($input: UpdateProductInput!) {
  updateProduct(input: $input) {
    id
    name
    basePrice
    isAvailable
    media {
      id
      url
      isPrimary
      sortOrder
    }
    updatedAt
  }
}
```

**Variables (add photos, keep existing ones):**
```json
{
  "input": {
    "id": "prod-uuid-1",
    "name": "Red Velvet Celebration Cake",
    "basePrice": 18000,
    "isAvailable": true,
    "mediaKeys": ["products/red-velvet-new-angle.jpg"],
    "mediaUrls": ["https://cdn.jayascravings.com/products/red-velvet-new-angle.jpg"]
  }
}
```

**Variables (wholesale replace all photos):**
```json
{
  "input": {
    "id": "prod-uuid-1",
    "mediaKeys": ["products/reshoot-1.jpg", "products/reshoot-2.jpg"],
    "mediaUrls": [
      "https://cdn.jayascravings.com/products/reshoot-1.jpg",
      "https://cdn.jayascravings.com/products/reshoot-2.jpg"
    ],
    "replaceMedia": true
  }
}
```

> **🆕 `mediaKeys` / `mediaUrls` / `replaceMedia`:** by default (`replaceMedia: false` or omitted), any `mediaKeys`/`mediaUrls` passed are **appended** after the product's existing photos. Set `replaceMedia: true` to delete all existing photos first, then insert the new set (the first of the new set becomes primary). All other fields are optional — only send what you're changing.

---

#### mutation deleteProduct

Permanently delete a product. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id)
}
```

**Variables:**
```json
{
  "id": "prod-uuid-1"
}
```

---

#### mutation toggleProductAvailability

Toggle a product between available and unavailable.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation ToggleProductAvailability($id: ID!) {
  toggleProductAvailability(id: $id) {
    id
    name
    isAvailable
  }
}
```

---

#### mutation toggleProductFeatured

Toggle a product's featured status.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation ToggleProductFeatured($id: ID!) {
  toggleProductFeatured(id: $id) {
    id
    name
    isFeatured
  }
}
```

---

#### mutation createCategory

Create a product category. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation CreateCategory($name: String!, $description: String, $imageUrl: String) {
  createCategory(name: $name, description: $description, imageUrl: $imageUrl) {
    id
    name
    slug
    createdAt
  }
}
```

**Variables:**
```json
{
  "name": "Cupcakes",
  "description": "Mini cakes perfect for parties",
  "imageUrl": "https://cdn.jayascravings.com/categories/cupcakes.jpg"
}
```

---

#### mutation addProductVariant

Add a size or flavour variant to a product.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation AddProductVariant(
  $productId: ID!
  $name: String!
  $type: String!
  $additionalPrice: Float
) {
  addProductVariant(
    productId: $productId
    name: $name
    type: $type
    additionalPrice: $additionalPrice
  ) {
    id
    name
    type
    additionalPrice
    isAvailable
  }
}
```

**Variables:**
```json
{
  "productId": "prod-uuid-1",
  "name": "Strawberry",
  "type": "flavour",
  "additionalPrice": 2000
}
```

---

#### mutation addCustomisationOption

Add a customisation option (inscription, colour, tier count) to a product.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation AddCustomisationOption(
  $productId: ID!
  $name: String!
  $type: String!
  $additionalPrice: Float
  $isRequired: Boolean
  $options: String
) {
  addCustomisationOption(
    productId: $productId
    name: $name
    type: $type
    additionalPrice: $additionalPrice
    isRequired: $isRequired
    options: $options
  ) {
    id
    name
    type
    options
    additionalPrice
    isRequired
  }
}
```

**Variables:**
```json
{
  "productId": "prod-uuid-1",
  "name": "Cake Colour",
  "type": "select",
  "additionalPrice": 0,
  "isRequired": false,
  "options": "[\"Red\",\"Pink\",\"White\",\"Blue\",\"Gold\"]"
}
```

---

### 3.4 Cart

#### query myCart

Get the current user's cart. Pass `sessionId` for guest users.

**Auth:** None (public — works for both guests and logged-in users)

**Operation:**
```graphql
query MyCart($sessionId: String) {
  myCart(sessionId: $sessionId) {
    id
    userId
    sessionId
    subtotal
    items {
      id
      productId
      productName
      unitPrice
      quantity
      totalPrice
      variantId
      variantName
      customisations
      specialInstructions
    }
    createdAt
    updatedAt
  }
}
```

**Variables (guest):**
```json
{
  "sessionId": "guest-session-uuid"
}
```

**Variables (logged in — no sessionId needed):**
```json
{}
```

**Response:**
```json
{
  "data": {
    "myCart": {
      "id": "cart-uuid-1",
      "userId": "user-uuid-1",
      "sessionId": null,
      "subtotal": 20000,
      "items": [
        {
          "id": "item-uuid-1",
          "productId": "prod-uuid-1",
          "productName": "Red Velvet Cake",
          "unitPrice": 15000,
          "quantity": 1,
          "totalPrice": 15000,
          "variantId": "var-uuid-1",
          "variantName": "size: 6 inch",
          "customisations": "{\"Message Inscription\": \"Happy Birthday John\"}",
          "specialInstructions": "Please add extra cream cheese frosting"
        }
      ]
    }
  }
}
```

---

#### mutation addToCart

Add a product to cart. Works for both guests and logged-in users. If the user is logged in, adding an item now also schedules an abandoned-cart recovery email for ~3 hours later if checkout hasn't happened by then.

**Auth:** None (public)

**Operation:**
```graphql
mutation AddToCart(
  $productId: ID!
  $quantity: Int
  $variantId: ID
  $customisations: String
  $specialInstructions: String
  $sessionId: String
) {
  addToCart(
    productId: $productId
    quantity: $quantity
    variantId: $variantId
    customisations: $customisations
    specialInstructions: $specialInstructions
    sessionId: $sessionId
  ) {
    id
    subtotal
    items {
      id
      productName
      quantity
      unitPrice
      totalPrice
      variantName
    }
  }
}
```

**Variables:**
```json
{
  "productId": "prod-uuid-1",
  "quantity": 1,
  "variantId": "var-uuid-1",
  "customisations": "{\"Message Inscription\": \"Happy Birthday John\"}",
  "specialInstructions": "Extra frosting please"
}
```

---

#### mutation updateCartItem

Update the quantity of a cart item. Set quantity to 0 to remove it.

**Auth:** None (public)

**Operation:**
```graphql
mutation UpdateCartItem($cartItemId: ID!, $quantity: Int!, $sessionId: String) {
  updateCartItem(cartItemId: $cartItemId, quantity: $quantity, sessionId: $sessionId) {
    id
    subtotal
    items {
      id
      productName
      quantity
      totalPrice
    }
  }
}
```

**Variables:**
```json
{
  "cartItemId": "item-uuid-1",
  "quantity": 2
}
```

---

#### mutation removeFromCart

Remove a specific item from cart.

**Auth:** None (public)

**Operation:**
```graphql
mutation RemoveFromCart($cartItemId: ID!, $sessionId: String) {
  removeFromCart(cartItemId: $cartItemId, sessionId: $sessionId) {
    id
    subtotal
    items {
      id
      productName
      quantity
    }
  }
}
```

---

#### mutation clearCart

Remove all items from cart.

**Auth:** None (public)

**Operation:**
```graphql
mutation ClearCart($sessionId: String) {
  clearCart(sessionId: $sessionId)
}
```

---

#### mutation mergeCart

Merge a guest cart into the logged-in user's cart after Google Sign-In. Call this immediately after `googleAuth`.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation MergeCart($sessionId: String!) {
  mergeCart(sessionId: $sessionId) {
    id
    subtotal
    items {
      id
      productName
      quantity
      totalPrice
    }
  }
}
```

**Variables:**
```json
{
  "sessionId": "guest-session-uuid-stored-in-localstorage"
}
```

---

### 3.5 Orders

#### query myOrders

Get the current user's order history with pagination.

**Auth:** Any authenticated role

**Operation:**
```graphql
query MyOrders($pagination: PaginationInput) {
  myOrders(pagination: $pagination) {
    data {
      id
      orderNumber
      status
      deliveryType
      subtotal
      deliveryFee
      discount
      total
      promoCode
      deliveryRecipientName
      deliveryPhone
      deliveryStreet
      deliveryCity
      deliveryState
      deliveryDate
      deliveryTimeSlot
      notes
      paymentReference
      items {
        id
        productId
        productName
        unitPrice
        quantity
        totalPrice
        variantName
        customisations
        specialInstructions
      }
      createdAt
      updatedAt
    }
    total
    page
    limit
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
```

**Variables:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

---

#### query order

Get a single order by ID.

**Auth:** Any authenticated role

**Operation:**
```graphql
query Order($id: ID!) {
  order(id: $id) {
    id
    orderNumber
    status
    deliveryType
    subtotal
    deliveryFee
    total
    items {
      productName
      quantity
      unitPrice
      totalPrice
    }
    createdAt
  }
}
```

---

#### query orderByNumber

Get an order by its human-readable order number (e.g. JC-000042).

**Auth:** Any authenticated role

**Operation:**
```graphql
query OrderByNumber($orderNumber: String!) {
  orderByNumber(orderNumber: $orderNumber) {
    id
    orderNumber
    status
    total
    createdAt
  }
}
```

**Variables:**
```json
{
  "orderNumber": "JC-000042"
}
```

> **Note:** order numbers are now generated from a Postgres sequence rather than a row count, so they're guaranteed unique even under concurrent checkouts.

---

#### query allOrders

Get all orders with filters. Admin dashboard use.

**Auth:** Admin, Sales, Baker, Delivery

**Operation:**
```graphql
query AllOrders($filter: OrderFilterInput, $pagination: PaginationInput) {
  allOrders(filter: $filter, pagination: $pagination) {
    data {
      id
      orderNumber
      userId
      status
      deliveryType
      total
      deliveryDate
      adminNotes
      items {
        productName
        quantity
      }
      createdAt
    }
    total
    page
    totalPages
  }
}
```

**Variables:**
```json
{
  "filter": {
    "status": "PENDING",
    "deliveryType": "DELIVERY",
    "fromDate": "2026-07-01",
    "toDate": "2026-07-13",
    "search": "JC-000"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

---

#### mutation createOrder

Create an order from the current cart. Automatically clears the cart, schedules auto-cancel, applies and records any promo code usage, cancels the pending abandoned-cart recovery email, sends an order confirmation email, and pushes a live event to the admin analytics dashboard.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    status
    deliveryType
    subtotal
    deliveryFee
    discount
    total
    createdAt
  }
}
```

**Variables (pickup):**
```json
{
  "input": {
    "deliveryType": "PICKUP",
    "notes": "Will collect on Saturday morning"
  }
}
```

**Variables (delivery, with promo code):**
```json
{
  "input": {
    "deliveryType": "DELIVERY",
    "deliveryRecipientName": "Jane Doe",
    "deliveryPhone": "08012345678",
    "deliveryStreet": "12 Cake Street",
    "deliveryCity": "Lagos",
    "deliveryState": "Lagos",
    "deliveryDate": "2026-07-20",
    "deliveryTimeSlot": "10:00 - 12:00",
    "promoCode": "CAKE20",
    "notes": "Please call before delivery"
  }
}
```

**Response:**
```json
{
  "data": {
    "createOrder": {
      "id": "order-uuid-1",
      "orderNumber": "JC-000042",
      "status": "PENDING",
      "deliveryType": "DELIVERY",
      "subtotal": 15000,
      "deliveryFee": 2000,
      "discount": 4000,
      "total": 13000,
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  }
}
```

> **Note:** `promoCode` is now actually applied to the order total (previously it was accepted but ignored — `discount` was always `0`). If the code is invalid, expired, past its usage limit, or the order doesn't meet its minimum value, this mutation returns a `BAD_REQUEST` error explaining why. Order creation (order + items + promo redemption) is atomic — it either all succeeds or all rolls back.

---

#### mutation cancelOrder

Cancel a PENDING or CONFIRMED order.

**Auth:** Any authenticated role (own orders only)

**Operation:**
```graphql
mutation CancelOrder($orderId: ID!) {
  cancelOrder(orderId: $orderId) {
    id
    orderNumber
    status
  }
}
```

---

#### mutation reorder

Re-add all items from a past order to cart and create a new order.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation Reorder($orderId: ID!) {
  reorder(orderId: $orderId) {
    id
    orderNumber
    status
    total
  }
}
```

---

#### mutation updateOrderStatus

Update an order's status. Automatically emails and (if push is set up — see `updateFcmToken`) notifies the customer of the change, and pushes a live event to the admin dashboard. Admin dashboard use.

**Auth:** Admin, Sales, Baker, Delivery

**Operation:**
```graphql
mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
  updateOrderStatus(input: $input) {
    id
    orderNumber
    status
    adminNotes
    updatedAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "orderId": "order-uuid-1",
    "status": "BAKING",
    "adminNotes": "Started baking at 9am"
  }
}
```

**Available statuses:** `PENDING`, `CONFIRMED`, `PROCESSING`, `BAKING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `PICKED_UP`, `CANCELLED`, `REFUNDED`

---

### 3.6 Payments

#### mutation initiatePayment

Initiate a Paystack payment for an order. Returns the authorization URL to redirect the customer to.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation InitiatePayment($input: InitiatePaymentInput!) {
  initiatePayment(input: $input) {
    authorizationUrl
    reference
    payment {
      id
      amount
      status
      method
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "orderId": "order-uuid-1",
    "method": "CARD"
  }
}
```

**Available methods:** `CARD`, `BANK_TRANSFER`, `USSD`, `PAY_WITH_TRANSFER`

**Response:**
```json
{
  "data": {
    "initiatePayment": {
      "authorizationUrl": "https://checkout.paystack.com/p/abc123",
      "reference": "JC-ABC123456789",
      "payment": {
        "id": "payment-uuid-1",
        "amount": 17000,
        "status": "PENDING",
        "method": "CARD"
      }
    }
  }
}
```

**Frontend flow:**
1. Call `initiatePayment` to get `authorizationUrl`
2. Redirect customer to `authorizationUrl`
3. Paystack redirects back to `FRONTEND_URL/orders/verify?reference=JC-ABC123456789`
4. Call `verifyPayment` with the reference on that page

> **Note:** behind the scenes, a fallback verification job now runs automatically ~1 minute after initiation (in case Paystack's webhook never arrives), and the payment is auto-marked as failed if it's still pending 30 minutes later. Both are safe to fire alongside the webhook and the manual `verifyPayment` call below — whichever one confirms the payment first "wins," and the others become safe no-ops.

---

#### mutation verifyPayment

Manually verify a payment by reference. Use this on the callback page after Paystack redirect. On success, sends a receipt email, notifies the customer in-app/push, and pushes a live event to the admin dashboard — same as the webhook path.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation VerifyPayment($reference: String!) {
  verifyPayment(reference: $reference) {
    id
    status
    amount
    paidAt
    channel
  }
}
```

**Variables:**
```json
{
  "reference": "JC-ABC123456789"
}
```

---

### 3.7 Delivery

#### query deliveryZones

Get all active delivery zones and their fees.

**Auth:** None (public)

**Operation:**
```graphql
query {
  deliveryZones {
    id
    name
    description
    areas
    deliveryFee
    isActive
    sortOrder
  }
}
```

**Response:**
```json
{
  "data": {
    "deliveryZones": [
      {
        "id": "zone-uuid-1",
        "name": "Lagos Island",
        "description": "Victoria Island, Ikoyi, Lekki Phase 1",
        "areas": ["Victoria Island", "Ikoyi", "Lekki Phase 1", "Oniru"],
        "deliveryFee": 3000,
        "isActive": true,
        "sortOrder": 0
      }
    ]
  }
}
```

---

#### query deliverySlots

Get available delivery time slots, optionally filtered by day.

**Auth:** None (public)

**Operation:**
```graphql
query DeliverySlots($day: String) {
  deliverySlots(day: $day) {
    id
    label
    startTime
    endTime
    maxOrders
    availableDays
    isActive
  }
}
```

**Variables:**
```json
{
  "day": "SAT"
}
```

**Response:**
```json
{
  "data": {
    "deliverySlots": [
      {
        "id": "slot-uuid-1",
        "label": "Morning (9am - 12pm)",
        "startTime": "09:00",
        "endTime": "12:00",
        "maxOrders": 10,
        "availableDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        "isActive": true
      }
    ]
  }
}
```

---

#### query deliveryZoneByArea

Find the delivery zone and fee for a specific area.

**Auth:** None (public)

**Operation:**
```graphql
query DeliveryZoneByArea($area: String!) {
  deliveryZoneByArea(area: $area) {
    id
    name
    deliveryFee
    areas
  }
}
```

**Variables:**
```json
{
  "area": "Lekki Phase 1"
}
```

---

#### mutation createDeliveryZone

Create a delivery zone. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation CreateDeliveryZone(
  $name: String!
  $deliveryFee: Float!
  $areas: [String!]!
  $description: String
) {
  createDeliveryZone(
    name: $name
    deliveryFee: $deliveryFee
    areas: $areas
    description: $description
  ) {
    id
    name
    deliveryFee
    areas
  }
}
```

**Variables:**
```json
{
  "name": "Lagos Mainland",
  "deliveryFee": 2000,
  "areas": ["Surulere", "Yaba", "Mushin", "Oshodi"],
  "description": "Lagos Mainland areas"
}
```

---

#### mutation createDeliverySlot

Create a delivery time slot. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation CreateDeliverySlot(
  $label: String!
  $startTime: String!
  $endTime: String!
  $maxOrders: Int
  $availableDays: [String!]!
) {
  createDeliverySlot(
    label: $label
    startTime: $startTime
    endTime: $endTime
    maxOrders: $maxOrders
    availableDays: $availableDays
  ) {
    id
    label
    startTime
    endTime
    maxOrders
    availableDays
  }
}
```

**Variables:**
```json
{
  "label": "Afternoon (1pm - 4pm)",
  "startTime": "13:00",
  "endTime": "16:00",
  "maxOrders": 8,
  "availableDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
}
```

---

### 3.8 Promotions

#### query validatePromoCode

Validate a promo code and preview the discount before applying. Does not record usage.

**Auth:** Any authenticated role

**Operation:**
```graphql
query ValidatePromoCode(
  $code: String!
  $orderSubtotal: Float!
  $deliveryFee: Float
) {
  validatePromoCode(
    code: $code
    orderSubtotal: $orderSubtotal
    deliveryFee: $deliveryFee
  ) {
    promoCode {
      id
      code
      discountType
      discountValue
      minimumOrderValue
    }
    discountAmount
    finalTotal
  }
}
```

**Variables:**
```json
{
  "code": "CAKE20",
  "orderSubtotal": 20000,
  "deliveryFee": 2000
}
```

**Response:**
```json
{
  "data": {
    "validatePromoCode": {
      "promoCode": {
        "id": "promo-uuid-1",
        "code": "CAKE20",
        "discountType": "PERCENTAGE",
        "discountValue": 20,
        "minimumOrderValue": 10000
      },
      "discountAmount": 4000,
      "finalTotal": 18000
    }
  }
}
```

> This query only **previews** the discount — it doesn't reserve/record usage against the code's limits. Usage is only actually recorded when the code is used on `createOrder` (see §3.5), inside a single locked transaction, so two customers redeeming the last unit of a limited code at the same moment can't both succeed.

---

#### mutation createPromoCode

Create a promo code. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation CreatePromoCode(
  $code: String!
  $discountType: DiscountType!
  $discountValue: Float!
  $description: String
  $minimumOrderValue: Float
  $maximumDiscount: Float
  $usageLimit: Int
  $perUserLimit: Int
  $startsAt: String
  $expiresAt: String
) {
  createPromoCode(
    code: $code
    discountType: $discountType
    discountValue: $discountValue
    description: $description
    minimumOrderValue: $minimumOrderValue
    maximumDiscount: $maximumDiscount
    usageLimit: $usageLimit
    perUserLimit: $perUserLimit
    startsAt: $startsAt
    expiresAt: $expiresAt
  ) {
    id
    code
    discountType
    discountValue
    isActive
    createdAt
  }
}
```

**Variables:**
```json
{
  "code": "BIRTHDAY30",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "description": "30% off for birthday orders",
  "minimumOrderValue": 15000,
  "maximumDiscount": 8000,
  "usageLimit": 50,
  "perUserLimit": 1,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

---

#### mutation togglePromoCode

Activate or deactivate a promo code. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation TogglePromoCode($id: ID!) {
  togglePromoCode(id: $id) {
    id
    code
    isActive
  }
}
```

---

#### mutation broadcastPromoCode  🆕

Announce an **active** promo code to every active customer — sends an in-app notification to each one and pushes to any device subscribed to the `promotions` FCM topic.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation BroadcastPromoCode($promoCodeId: ID!, $title: String!, $body: String!) {
  broadcastPromoCode(promoCodeId: $promoCodeId, title: $title, body: $body) {
    promoCode {
      id
      code
    }
    notifiedCount
  }
}
```

**Variables:**
```json
{
  "promoCodeId": "promo-uuid-1",
  "title": "20% off this weekend! 🎂",
  "body": "Use code CAKE20 at checkout — this weekend only."
}
```

**Response:**
```json
{
  "data": {
    "broadcastPromoCode": {
      "promoCode": {
        "id": "promo-uuid-1",
        "code": "CAKE20"
      },
      "notifiedCount": 412
    }
  }
}
```

> Throws a `BAD_REQUEST` if the promo code is currently inactive — activate it first via `togglePromoCode`. `notifiedCount` reflects how many active customers received the in-app notification; the push side goes to an FCM topic, so it isn't counted per-device here.

---

### 3.9 Reviews

#### query productReviews

Get approved reviews for a product.

**Auth:** None (public)

**Operation:**
```graphql
query ProductReviews($productId: ID!, $pagination: PaginationInput) {
  productReviews(productId: $productId, pagination: $pagination) {
    data {
      id
      userId
      rating
      comment
      mediaUrls
      adminResponse
      isVerifiedPurchase
      createdAt
    }
    total
    page
    totalPages
  }
}
```

**Variables:**
```json
{
  "productId": "prod-uuid-1",
  "pagination": { "page": 1, "limit": 10 }
}
```

---

#### query productRatingSummary

Get the rating summary (average, total, star breakdown) for a product.

**Auth:** None (public)

**Operation:**
```graphql
query ProductRatingSummary($productId: ID!) {
  productRatingSummary(productId: $productId) {
    average
    total
    breakdown {
      star
      count
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "productRatingSummary": {
      "average": 4.7,
      "total": 42,
      "breakdown": [
        { "star": 5, "count": 30 },
        { "star": 4, "count": 8 },
        { "star": 3, "count": 3 },
        { "star": 2, "count": 1 },
        { "star": 1, "count": 0 }
      ]
    }
  }
}
```

---

#### mutation createReview

Submit a product review. Must have ordered the product.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation CreateReview(
  $productId: ID!
  $orderId: ID!
  $rating: Int!
  $comment: String
  $mediaUrls: [String!]
  $mediaKeys: [String!]
) {
  createReview(
    productId: $productId
    orderId: $orderId
    rating: $rating
    comment: $comment
    mediaUrls: $mediaUrls
    mediaKeys: $mediaKeys
  ) {
    id
    rating
    comment
    status
    isVerifiedPurchase
    createdAt
  }
}
```

**Variables:**
```json
{
  "productId": "prod-uuid-1",
  "orderId": "order-uuid-1",
  "rating": 5,
  "comment": "Absolutely delicious! The red velvet was moist and the cream cheese frosting was perfect.",
  "mediaUrls": ["https://cdn.jayascravings.com/reviews/my-cake.jpg"],
  "mediaKeys": ["reviews/my-cake.jpg"]
}
```

---

#### mutation approveReview

Approve a pending review. Admin and Sales only.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation ApproveReview($reviewId: ID!) {
  approveReview(reviewId: $reviewId) {
    id
    status
  }
}
```

---

#### mutation respondToReview

Add an admin response to a review.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation RespondToReview($reviewId: ID!, $response: String!) {
  respondToReview(reviewId: $reviewId, response: $response) {
    id
    adminResponse
    respondedAt
  }
}
```

**Variables:**
```json
{
  "reviewId": "review-uuid-1",
  "response": "Thank you so much for your kind words, Jane! We are delighted you enjoyed your cake. We look forward to baking for you again! 🎂"
}
```

---

### 3.10 Custom Orders

#### mutation createCustomOrder

Submit a custom cake order request with reference images or videos. Automatically emails the customer a confirmation and alerts the admin team of the new request.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation CreateCustomOrder(
  $input: CreateCustomOrderInput!
  $mediaUrls: [String!]
  $mediaKeys: [String!]
) {
  createCustomOrder(input: $input, mediaUrls: $mediaUrls, mediaKeys: $mediaKeys) {
    id
    requestNumber
    occasion
    status
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "occasion": "Wedding",
    "description": "5-tier white and gold wedding cake with floral decorations and gold drip. Serves approximately 200 guests. Flavour: vanilla sponge with strawberry filling.",
    "approximateBudget": "₦150,000 - ₦200,000",
    "preferredDeliveryDate": "2026-09-15",
    "preferredDeliveryTime": "Morning",
    "customerNotes": "Please see reference images attached. The gold should be edible gold leaf."
  },
  "mediaUrls": [
    "https://cdn.jayascravings.com/custom-orders/reference1.jpg",
    "https://cdn.jayascravings.com/custom-orders/reference2.jpg"
  ],
  "mediaKeys": [
    "custom-orders/reference1.jpg",
    "custom-orders/reference2.jpg"
  ]
}
```

**Response:**
```json
{
  "data": {
    "createCustomOrder": {
      "id": "custom-uuid-1",
      "requestNumber": "JC-CUS-000001",
      "occasion": "Wedding",
      "status": "SUBMITTED",
      "createdAt": "2026-07-13T10:00:00.000Z"
    }
  }
}
```

> **Note:** `requestNumber` (and the agreement number generated later in this flow) are now generated from dedicated Postgres sequences, same fix as order numbers — guaranteed unique under concurrent submissions.

---

#### query myCustomOrders

Get the current user's custom order requests.

**Auth:** Any authenticated role

**Operation:**
```graphql
query MyCustomOrders($pagination: PaginationInput) {
  myCustomOrders(pagination: $pagination) {
    data {
      id
      requestNumber
      occasion
      description
      approximateBudget
      preferredDeliveryDate
      mediaUrls
      status
      adminNotes
      createdAt
    }
    total
    page
    totalPages
  }
}
```

---

#### query customOrderQuotes

Get all quotes for a custom order request.

**Auth:** Any authenticated role (own requests only)

**Operation:**
```graphql
query CustomOrderQuotes($requestId: ID!) {
  customOrderQuotes(requestId: $requestId) {
    id
    version
    totalAmount
    lineItems
    message
    terms
    validUntil
    status
    customerResponse
    respondedAt
    createdAt
  }
}
```

---

#### mutation respondToQuote

Accept, reject or negotiate a quote.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation RespondToQuote($input: RespondToQuoteInput!) {
  respondToQuote(input: $input) {
    id
    status
    customerResponse
    respondedAt
  }
}
```

**Variables (accept):**
```json
{
  "input": {
    "quoteId": "quote-uuid-1",
    "response": "ACCEPT",
    "message": "I am happy with the quote, please proceed."
  }
}
```

**Variables (negotiate):**
```json
{
  "input": {
    "quoteId": "quote-uuid-1",
    "response": "NEGOTIATE",
    "message": "Could we reduce the price slightly if I collect in person instead of delivery?"
  }
}
```

---

#### mutation createQuote

Admin sends a price quote to the customer. Automatically emails the customer and notifies them in-app/push that a quote is ready.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation CreateQuote($input: CreateQuoteInput!) {
  createQuote(input: $input) {
    id
    version
    totalAmount
    lineItems
    message
    status
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "requestId": "custom-uuid-1",
    "totalAmount": 175000,
    "lineItems": [
      "{\"description\": \"5-tier wedding cake (vanilla sponge, strawberry filling)\", \"amount\": 120000}",
      "{\"description\": \"Edible gold leaf decorations\", \"amount\": 25000}",
      "{\"description\": \"Fresh floral arrangement\", \"amount\": 20000}",
      "{\"description\": \"Delivery to venue\", \"amount\": 10000}"
    ],
    "message": "Thank you for your request! We would love to create your dream wedding cake. Please find our quote below.",
    "terms": "50% deposit required to confirm booking. Balance due 7 days before the wedding date.",
    "validUntil": "2026-07-27T23:59:59.000Z"
  }
}
```

---

#### mutation uploadTransferProof

Customer uploads bank transfer proof for manual payment.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation UploadTransferProof(
  $paymentId: ID!
  $proofUrl: String!
  $proofKey: String!
  $transferReference: String
) {
  uploadTransferProof(
    paymentId: $paymentId
    proofUrl: $proofUrl
    proofKey: $proofKey
    transferReference: $transferReference
  ) {
    id
    status
    transferProofUrl
    transferReference
  }
}
```

**Variables:**
```json
{
  "paymentId": "payment-uuid-1",
  "proofUrl": "https://cdn.jayascravings.com/custom-orders/proofs/receipt.jpg",
  "proofKey": "custom-orders/proofs/receipt.jpg",
  "transferReference": "FBN2026071300123456"
}
```

---

#### mutation confirmManualTransfer

Admin confirms a manual bank transfer. Moves request to IN_PRODUCTION.

**Auth:** Admin, Sales

**Operation:**
```graphql
mutation ConfirmManualTransfer($paymentId: ID!, $adminNote: String) {
  confirmManualTransfer(paymentId: $paymentId, adminNote: $adminNote) {
    id
    status
    confirmedAt
  }
}
```

---

### 3.11 Analytics

#### query dashboardSummary

Get the full admin dashboard summary for a date range.

**Auth:** Admin, Sales

**Operation:**
```graphql
query DashboardSummary($from: String!, $to: String!) {
  dashboardSummary(from: $from, to: $to) {
    revenue {
      totalRevenue
      totalTransactions
    }
    orders {
      totalOrders
      byStatus {
        status
        count
      }
      fulfilmentRate
      cancelledOrders
      averageOrderValue
    }
    customers {
      totalCustomers
      newCustomers
      returningCustomers
    }
    abandonedCarts
    topProducts {
      productId
      productName
      totalSold
      totalRevenue
    }
  }
}
```

**Variables:**
```json
{
  "from": "2026-07-01T00:00:00.000Z",
  "to": "2026-07-13T23:59:59.000Z"
}
```

**Response:**
```json
{
  "data": {
    "dashboardSummary": {
      "revenue": {
        "totalRevenue": 2850000,
        "totalTransactions": 187
      },
      "orders": {
        "totalOrders": 203,
        "byStatus": [
          { "status": "DELIVERED", "count": 145 },
          { "status": "CONFIRMED", "count": 28 },
          { "status": "PENDING", "count": 12 },
          { "status": "CANCELLED", "count": 18 }
        ],
        "fulfilmentRate": 71,
        "cancelledOrders": 18,
        "averageOrderValue": 15240
      },
      "customers": {
        "totalCustomers": 892,
        "newCustomers": 43,
        "returningCustomers": 78
      },
      "abandonedCarts": 12,
      "topProducts": [
        { "productId": "prod-uuid-1", "productName": "Red Velvet Cake", "totalSold": 48, "totalRevenue": 720000 }
      ]
    }
  }
}
```

---

#### query revenueByPeriod

Get revenue broken down by day, week or month.

**Auth:** Admin, Sales

**Operation:**
```graphql
query RevenueByPeriod($period: String!, $from: String!, $to: String!) {
  revenueByPeriod(period: $period, from: $from, to: $to) {
    period
    revenue
    transactions
  }
}
```

**Variables:**
```json
{
  "period": "daily",
  "from": "2026-07-01T00:00:00.000Z",
  "to": "2026-07-13T23:59:59.000Z"
}
```

**Available periods:** `daily`, `weekly`, `monthly`

---

#### query queueStats  🆕

Job counts (waiting/active/completed/failed/delayed) for every background queue — order, payment, inventory, and abandoned-cart. Useful for verifying the background job pipeline is healthy without needing direct Redis/Bull Board access.

**Auth:** Admin

**Operation:**
```graphql
query {
  queueStats {
    order {
      waiting
      active
      completed
      failed
      delayed
    }
    payment {
      waiting
      active
      completed
      failed
      delayed
    }
    inventory {
      waiting
      active
      completed
      failed
      delayed
    }
    cart {
      waiting
      active
      completed
      failed
      delayed
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "queueStats": {
      "order": { "waiting": 0, "active": 0, "completed": 1204, "failed": 2, "delayed": 6 },
      "payment": { "waiting": 0, "active": 1, "completed": 890, "failed": 0, "delayed": 3 },
      "inventory": { "waiting": 0, "active": 0, "completed": 340, "failed": 0, "delayed": 1 },
      "cart": { "waiting": 0, "active": 0, "completed": 210, "failed": 0, "delayed": 45 }
    }
  }
}
```

> A growing `failed` count or persistently high `waiting`/`delayed` numbers on any queue is worth investigating — it usually means a processor is erroring out or the worker process isn't running.

---

### 3.12 Staff

#### query validateInviteToken

Validate a staff invite token before showing the Google Sign-In button. Call this on the `/accept-invite` page.

**Auth:** None (public)

**Operation:**
```graphql
query ValidateInviteToken($token: String!) {
  validateInviteToken(token: $token) {
    id
    email
    fullName
    role
    department
    expiresAt
    status
  }
}
```

**Variables:**
```json
{
  "token": "a3f8c2e1d4b7a9f0e5c8d2b6a1f4e7c0d3b8a5f2e9c6d1b4"
}
```

---

#### mutation acceptStaffInvite  ⚠️ signature changed

Accept a staff invite after Google Sign-In. Creates the user account and staff record.

**⚠️ Breaking change from earlier versions of this guide:** this mutation used to accept `googleEmail`, `googleId`, `fullName`, and `avatarUrl` as plain string arguments supplied directly by the client. That trusted whatever the client claimed about its Google identity with **no verification** — anyone who obtained a valid invite `token` could self-provision a staff/admin account with a fabricated Google ID. It now takes a single `googleIdToken` — the raw Google ID token from Google Sign-In — and verifies it server-side (checking signature, audience, and `email_verified`) before trusting any identity claim. `fullName`, `avatarUrl`, and the email match against the invite are all derived from the verified token payload, not client input.

**Auth:** None (public — staff has no account yet)

**Operation:**
```graphql
mutation AcceptStaffInvite($token: String!, $googleIdToken: String!) {
  acceptStaffInvite(token: $token, googleIdToken: $googleIdToken) {
    staff {
      id
      fullName
      email
      role
      department
    }
    user {
      id
      email
      role
    }
  }
}
```

**Variables:**
```json
{
  "token": "a3f8c2e1d4b7a9f0e5c8d2b6a1f4e7c0",
  "googleIdToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:**
```json
{
  "data": {
    "acceptStaffInvite": {
      "staff": {
        "id": "staff-uuid-1",
        "fullName": "Emmanuel Okafor",
        "email": "baker@jayascravings.com",
        "role": "BAKER",
        "department": "Production"
      },
      "user": {
        "id": "user-uuid-3",
        "email": "baker@jayascravings.com",
        "role": "BAKER"
      }
    }
  }
}
```

Rejects with `FORBIDDEN` if the Google account's email doesn't match the invited email, and with `UNAUTHORIZED` if the Google ID token fails verification or its email isn't marked `email_verified` by Google.

---

#### mutation sendStaffInvite

Send a staff invite email to a new team member. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation SendStaffInvite(
  $email: String!
  $fullName: String!
  $role: UserRole!
  $department: String
) {
  sendStaffInvite(
    email: $email
    fullName: $fullName
    role: $role
    department: $department
  ) {
    id
    email
    fullName
    role
    department
    status
    expiresAt
    createdAt
  }
}
```

**Variables:**
```json
{
  "email": "baker@jayascravings.com",
  "fullName": "Emmanuel Okafor",
  "role": "BAKER",
  "department": "Production"
}
```

---

#### query auditLogs

Get admin audit logs with optional filters.

**Auth:** Admin

**Operation:**
```graphql
query AuditLogs($entity: String, $performedBy: String, $pagination: PaginationInput) {
  auditLogs(entity: $entity, performedBy: $performedBy, pagination: $pagination) {
    data {
      id
      performedBy
      performedByName
      action
      entity
      entityId
      before
      after
      createdAt
    }
    total
    page
    totalPages
  }
}
```

**Variables:**
```json
{
  "entity": "Order",
  "pagination": { "page": 1, "limit": 20 }
}
```

---

### 3.13 Settings

#### query publicSettings

Get non-secret app settings. Used by the frontend to configure itself (business name, hours, social links).

**Auth:** None (public)

**Operation:**
```graphql
query {
  publicSettings {
    key
    value
    type
    label
    group
  }
}
```

**Response:**
```json
{
  "data": {
    "publicSettings": [
      { "key": "business.name", "value": "Jayascravings", "type": "STRING", "label": "Business Name", "group": "business" },
      { "key": "business.email", "value": "hello@jayascravings.com", "type": "STRING", "label": "Business Email", "group": "business" },
      { "key": "hours.open", "value": "08:00", "type": "STRING", "label": "Opening Time", "group": "hours" },
      { "key": "hours.close", "value": "20:00", "type": "STRING", "label": "Closing Time", "group": "hours" },
      { "key": "hours.days", "value": "[\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\",\"SAT\"]", "type": "JSON", "label": "Operating Days", "group": "hours" },
      { "key": "social.instagram", "value": "https://instagram.com/jayascravings", "type": "STRING", "label": "Instagram URL", "group": "social" }
    ]
  }
}
```

---

#### mutation updateSetting

Update a single setting. Admin only.

**Auth:** Admin

**Operation:**
```graphql
mutation UpdateSetting($key: String!, $value: String!) {
  updateSetting(key: $key, value: $value) {
    key
    value
    updatedBy
    updatedAt
  }
}
```

**Variables:**
```json
{
  "key": "delivery.flat_fee",
  "value": "2500"
}
```

---

#### mutation bulkUpdateSettings

Update multiple settings in one call (e.g. saving a settings page form).

**Auth:** Admin

**Operation:**
```graphql
mutation BulkUpdateSettings($keys: [String!]!, $values: [String!]!) {
  bulkUpdateSettings(keys: $keys, values: $values) {
    key
    value
    updatedAt
  }
}
```

**Variables:**
```json
{
  "keys": ["business.name", "business.email", "business.phone"],
  "values": ["Jayascravings", "hello@jayascravings.com", "+2348012345678"]
}
```

---

### 3.14 Notifications (In-App)

#### query myNotifications

Get the current user's notification bell items with pagination.

**Auth:** Any authenticated role

**Operation:**
```graphql
query MyNotifications($pagination: PaginationInput) {
  myNotifications(pagination: $pagination) {
    data {
      id
      type
      title
      body
      referenceId
      referenceType
      actionUrl
      isRead
      readAt
      createdAt
    }
    total
    page
    totalPages
    hasNextPage
  }
}
```

---

#### query notificationSummary

Get the unread notification count for the bell icon badge.

**Auth:** Any authenticated role

**Operation:**
```graphql
query {
  notificationSummary {
    unreadCount
  }
}
```

**Response:**
```json
{
  "data": {
    "notificationSummary": {
      "unreadCount": 3
    }
  }
}
```

---

#### mutation markNotificationRead

Mark a single notification as read.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation MarkNotificationRead($notificationId: ID!) {
  markNotificationRead(notificationId: $notificationId) {
    id
    isRead
    readAt
  }
}
```

---

#### mutation markAllNotificationsRead

Mark all notifications as read. Returns the count of notifications marked.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation {
  markAllNotificationsRead
}
```

**Response:**
```json
{
  "data": {
    "markAllNotificationsRead": 3
  }
}
```

---

#### mutation clearReadNotifications

Delete all read notifications to keep the list clean.

**Auth:** Any authenticated role

**Operation:**
```graphql
mutation {
  clearReadNotifications
}
```

---

### 3.15 Ping

#### query ping

Simple liveness check for GraphQL. Returns "pong".

**Auth:** None (public)

**Operation:**
```graphql
query {
  ping
}
```

**Response:**
```json
{
  "data": {
    "ping": "pong"
  }
}
```

---

## 4. Common Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No token or invalid token |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `BAD_REQUEST` | 400 | Invalid input or business rule violation |
| `CONFLICT` | 409 | Duplicate resource (e.g. promo code already exists) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## 5. Rate Limits

| Endpoint type | Limit |
|---|---|
| General (all endpoints) | 60 requests per minute per IP |
| Auth endpoints (`googleAuth`, `refreshToken`) | 10 requests per minute per IP — now actually enforced with a dedicated throttle tier (previously configured but not applied to these mutations) |
| File upload (media/presign, media/confirm) | 20 requests per minute per IP |

When exceeded, the API returns:
```json
{
  "statusCode": 429,
  "message": ["Too many requests"],
  "error": "TOO_MANY_REQUESTS"
}
```

> **Note:** rate limiting now derives the client IP from Express's `req.ip`, which only trusts `X-Forwarded-For` up to `TRUST_PROXY_HOPS` (env var, default `1`) hops deep — set this to match your actual number of reverse proxies/load balancers in front of the app, or IP-based limiting can be bypassed by a spoofed header.

---

## 6. Changelog

**Since the last revision of this guide**, a full security and architecture audit was completed. Highlights relevant to API consumers:

- `acceptStaffInvite` — **breaking change**, see §3.12. Update any integration using the old `googleEmail`/`googleId`/`fullName`/`avatarUrl` arguments.
- `/api/media/*` — all endpoints now require authentication; guest uploads are no longer possible. New `DELETE /api/media/:id/admin` endpoint for admin/sales force-delete.
- `createProduct` / `updateProduct` — new `mediaKeys`/`mediaUrls` (and `replaceMedia` on update) fields for attaching photos in the same call.
- `createOrder` — `promoCode` is now actually applied to the total; previously accepted but silently ignored.
- New: `broadcastPromoCode` mutation, `queueStats` query, `updateFcmToken` mutation.
- `/api/analytics/live` — now requires `ADMIN`/`SALES` role, not just any authenticated user; adds a `NEW_CUSTOMER` event type.
- Auth-endpoint rate limiting is now actually enforced (10/min), not just configured.
- Webhook signature verification, order/promo-code race conditions, and several access-control gaps were fixed at the infrastructure level — no API contract changes, but worth knowing checkout and payment confirmation are now materially more reliable under concurrent load and safer against forged webhook calls.

---

*Last updated: July 2026 — Techillionaire Solutions Ltd.*