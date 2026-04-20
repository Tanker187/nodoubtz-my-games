# 1. Define the BigQuery Dataset
resource "google_bigquery_dataset" "nodoubtz_sales" {
  dataset_id                  = "sales_data"
  friendly_name               = "NFT and Payment Sales"
  description                 = "Ledger for nodoubtz NFT transactions and Stripe payments"
  location                    = "US"
  delete_contents_on_destroy  = false
}

# 2. Define the NFT Sales Ledger Table
resource "google_bigquery_table" "nft_sales_ledger" {
  dataset_id = google_bigquery_dataset.nodoubtz_sales.dataset_id
  table_id   = "nft_sales_ledger"
  deletion_protection = false

  time_partitioning {
    type  = "DAY"
    field = "event_timestamp"
  }

  clustering = ["wallet_address", "transaction_id"]

  schema = <<EOF
[
  {"name": "transaction_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "event_timestamp", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "user_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "amount_usd", "type": "FLOAT", "mode": "REQUIRED"},
  {"name": "wallet_address", "type": "STRING", "mode": "REQUIRED"},
  {"name": "token_id", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "mint_status", "type": "STRING", "mode": "REQUIRED"},
  {"name": "transaction_hash", "type": "STRING", "mode": "NULLABLE"},
  {"name": "metadata", "type": "JSON", "mode": "NULLABLE"}
]
EOF
}

# 3. Cloud Function for the "Hook" (Payment -> NFT Mint -> BQ)
resource "google_cloudfunctions2_function" "nft_mint_hook" {
  name        = "stripe-nft-mint-hook"
  location    = "us-central1"
  description = "Triggers on successful Stripe payment to mint NFT and log to BigQuery"

  build_config {
    runtime     = "nodejs20"
    entry_point = "onSuccessfulPayment"
    source {
      storage_source {
        bucket = "nodoubtz-source-code"
        object = "functions-source.zip"
      }
    }
  }

  service_config {
    max_instance_count = 10
    available_memory   = "256M"
    timeout_seconds    = 60
    
    # Securely pulling your keys from Secret Manager
    secret_environment_variables {
      key        = "STRIPE_SECRET"
      project_id = "nodoubtz"
      secret     = "STRIPE_SECRET_KEY"
      version    = "latest"
    }
  }
}
