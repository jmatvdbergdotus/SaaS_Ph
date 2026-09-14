# Inventory management

The inventory page now loads the signed-in store's Supabase inventory, matching
the dashboard data source. Add products with a name, optional SKU, PHP price,
initial stock, and restock threshold. Edit details, restock by adding a quantity,
or correct stock by entering the counted total. History shows the latest 50
changes, including quantities and notes. Saving requires an internet connection.

Apply migration `013_inventory_management.sql` before using the new interface:

```text
pnpm db:migrate
```

The linked project reported INACTIVE during implementation. Its migration could
not be applied remotely. Restore the project before running the migration.

The save function checks store ownership, locks the product, rejects stale edits,
and saves quantities and movement history in one transaction. Direct browser
writes to inventory and movement records are revoked. Future sales/sync features
must use a controlled transaction as well.

Database types include the migration contract; regenerate them after applying
the migration. Reload the page if an edit is rejected because another save
changed the product.

## Verification

`packages/db/tests/inventory.sql` runs in an EMPTY disposable PostgreSQL database.
It creates a minimal Supabase auth fixture and applies the actual inventory
migrations. Run with `psql -v ON_ERROR_STOP=1 -f packages/db/tests/inventory.sql`.
It checks initial stock, restocking, correction history, stale writes, negative
stock, ownership enforcement, and direct-write privileges. Never run this test
against the hosted application database.
