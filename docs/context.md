# Delivo Project Context

Delivo is a full-stack, microservices-based last-mile delivery platform built as a monorepo.

The MVP focuses on a rider-offer delivery model:

1. Customer creates an order.
2. Order is broadcast to available riders.
3. Riders submit delivery fee offers.
4. Customer selects one rider offer.
5. Delivery is assigned to the selected rider.
6. Rider updates delivery status.
7. Customer pays using cash only.

This is not an Uber-style automatic matching system. The platform does not calculate delivery fees for now. Riders choose their own delivery fees, and customers select the preferred offer.

## Tech Stack

Frontend:
- React
- Vite
- TypeScript
- Role-based dashboards for customer, merchant, rider, and admin

Backend:
- Node.js
- TypeScript
- Express
- PostgreSQL
- Redis planned for fast temporary state
- JWT session tokens
- Refresh tokens
- API Gateway
- Microservices architecture

## Existing Services

- user-service: authentication, users, roles, refresh tokens
- product-service: merchant products and inventory
- order-service: customer orders and order lifecycle
- delivery-service: rider offers and delivery status
- payment-service: cash payment records only for MVP
- notification-service: planned for order/rider alerts
- admin-service: platform management

## Existing Tables

### users

Stores all platform users.

Roles:
- customer
- merchant
- rider
- admin

Important fields:
- id
- email
- password
- name
- role
- is_active
- google_id
- created_at

### refresh_tokens

Stores refresh tokens for authenticated sessions.

Important fields:
- id
- user_id
- token
- expires_at
- created_at

### products

Stores merchant products.

Important fields:
- id
- name
- description
- price
- category
- stock
- merchant_id
- created_at
- updated_at

## Recommended MVP Tables

### merchant_profiles

Stores merchant business information.

Fields:
- id
- user_id
- business_name
- phone
- address
- latitude
- longitude
- is_verified
- created_at

### customer_addresses

Stores customer saved delivery addresses.

Fields:
- id
- customer_id
- label
- address
- latitude
- longitude
- is_default
- created_at

### orders

Main order table.

Fields:
- id
- customer_id
- merchant_id
- pickup_address
- pickup_latitude
- pickup_longitude
- drop_address
- drop_latitude
- drop_longitude
- item_total
- selected_delivery_fee
- status
- notes
- created_at
- updated_at

Order statuses:
- pending
- waiting_for_rider_offers
- rider_selected
- accepted_by_merchant
- preparing
- ready_for_pickup
- picked_up
- delivered
- cancelled

### order_items

Stores products/items inside an order.

Important:
Store product_name and unit_price as snapshots so old orders do not change when products are updated.

Fields:
- id
- order_id
- product_id
- product_name
- quantity
- unit_price
- created_at

### delivery_offers

Stores rider-submitted delivery fee offers.

This is a core MVP table.

Fields:
- id
- order_id
- rider_id
- delivery_fee
- estimated_minutes
- status
- created_at

Delivery offer statuses:
- pending
- selected
- rejected
- expired
- cancelled

Business rule:
A rider can submit only one offer per order.

### deliveries

Created after the customer selects a rider offer.

Fields:
- id
- order_id
- rider_id
- selected_offer_id
- delivery_fee
- status
- picked_up_at
- delivered_at
- created_at
- updated_at

Delivery statuses:
- assigned
- heading_to_pickup
- picked_up
- on_the_way
- delivered
- cancelled

### payments

Cash-only MVP payment record.

No card payments, no Stripe, no online payment gateway for now.

Fields:
- id
- order_id
- method
- status
- item_total
- delivery_fee
- total_amount
- paid_at
- created_at

Payment methods:
- cash

Payment statuses:
- pending
- paid
- failed
- cancelled

### ratings

Optional MVP table for rating rider and merchant after delivery.

Fields:
- id
- order_id
- customer_id
- rider_id
- merchant_id
- rider_rating
- merchant_rating
- created_at

## Redis Usage

Use Redis only for temporary fast state.

Use Redis for:
- rider online/offline state
- rider live location
- active socket connection IDs
- order broadcast windows
- temporary offer countdowns

Do not store permanent business data only in Redis.

Example Redis keys:
- rider:online:{riderId}
- rider:location:{riderId}
- order:broadcast:{orderId}
- order:offers:live:{orderId}

## Main MVP Flow

Customer:
1. Login
2. Browse products or create manual delivery request
3. Create order
4. Wait for rider offers
5. Select rider offer
6. Receive delivery
7. Pay cash
8. Rate rider/merchant

Rider:
1. Login
2. Set online
3. Receive nearby order
4. Submit delivery fee offer
5. Wait for customer selection
6. If selected, complete delivery
7. Mark delivery as delivered

Merchant:
1. Login
2. Manage products
3. Receive orders
4. Accept or reject order
5. Prepare order
6. Mark ready for pickup

Admin:
1. Manage users
2. View orders
3. Resolve issues
4. Monitor basic platform stats

## Important API Endpoints

Customer/order endpoints:
- POST /orders
- GET /orders/:id
- GET /orders/:id/offers
- POST /orders/:id/select-offer
- GET /orders/my-orders

Rider endpoints:
- POST /delivery-offers
- GET /rider/available-orders
- GET /rider/my-deliveries
- PATCH /deliveries/:id/status

Merchant endpoints:
- POST /products
- PATCH /products/:id
- GET /merchant/orders
- PATCH /orders/:id/status

Admin endpoints:
- GET /admin/users
- PATCH /admin/users/:id/status
- GET /admin/orders

## Coding Guidelines

Use TypeScript everywhere.

Prefer:
- clear service/controller/repository separation
- shared error classes
- shared types from common packages
- role-based authorization middleware
- DTO validation
- PostgreSQL transactions for multi-step operations

Important transaction example:
When customer selects a rider offer:
1. Mark selected offer as selected.
2. Mark other offers as rejected.
3. Create delivery record.
4. Update order selected_delivery_fee.
5. Update order status to rider_selected.
6. Create pending cash payment record.

These steps should happen in one database transaction.

## MVP Priority

Do not overbuild.

Focus on:
1. Orders
2. Delivery offers
3. Selecting rider
4. Delivery status
5. Cash payment record

Avoid for MVP:
- card payments
- complex route optimization
- AI matching
- subscriptions
- wallet system
- advanced analytics
- live map tracking unless basic Redis state is already ready
- don't change api gateway without asking