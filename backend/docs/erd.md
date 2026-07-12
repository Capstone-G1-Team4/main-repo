# Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string phone
        enum role "customer | admin"
        bool is_active
        datetime created_at
        datetime updated_at
    }

    categories {
        int id PK
        string name
        string slug UK
        text description
        int parent_id FK "self-reference"
    }

    products {
        uuid id PK
        string name
        string slug UK
        text description
        jsonb specifications
        numeric price
        string currency
        int stock_quantity
        bool is_available
        jsonb image_urls
        int category_id FK
        string brand
        string sku UK
        datetime created_at
        datetime updated_at
    }

    orders {
        uuid id PK
        uuid user_id FK "nullable (guest checkout)"
        enum status "pending..cancelled"
        string customer_name
        string customer_phone
        enum payment_method "cash_on_delivery | card | wallet"
        numeric subtotal
        numeric delivery_fee
        numeric total
        uuid delivery_location_id FK
        uuid conversation_id FK "nullable"
        text notes
        datetime created_at
        datetime updated_at
    }

    order_items {
        int id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        numeric unit_price "snapshot"
        numeric line_total
    }

    delivery_locations {
        uuid id PK
        uuid user_id FK "nullable"
        text raw_input
        float latitude
        float longitude
        text formatted_address
        string place_id
        string city
        string zone
        bool is_within_delivery_area
        datetime created_at
    }

    saved_addresses {
        int id PK
        uuid user_id FK
        string label
        uuid delivery_location_id FK
        bool is_default
    }

    conversations {
        uuid id PK
        uuid user_id FK "nullable (guests)"
        string session_token UK
        enum status "active | closed"
        datetime created_at
        datetime updated_at
    }

    chat_messages {
        int id PK
        uuid conversation_id FK
        enum role "user | assistant | system | tool"
        text content
        jsonb metadata
        datetime created_at
    }

    categories ||--o{ categories : "parent of"
    categories ||--o{ products : contains
    users ||--o{ orders : places
    orders ||--|{ order_items : contains
    products ||--o{ order_items : "snapshotted in"
    users ||--o{ delivery_locations : owns
    delivery_locations ||--o{ orders : "delivers to"
    users ||--o{ saved_addresses : saves
    delivery_locations ||--o{ saved_addresses : "referenced by"
    users ||--o{ conversations : starts
    conversations ||--o{ chat_messages : contains
    conversations ||--o{ orders : "created from"
```

Notes:

- Prices/totals are `NUMERIC(10,2)`; the API serializes them as decimal strings.
- `order_items.unit_price` is a snapshot at purchase time; later price changes do not affect past orders.
- JSONB columns fall back to plain JSON on SQLite (tests only).
- Migrations live in `alembic/versions` and are append-only.
