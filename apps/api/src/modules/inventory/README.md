# Inventory — Mustafa

Implements GET/POST `/api/pharmacist/medicines`, PATCH `/api/pharmacist/medicines/:id`, POST `/api/pharmacist/medicines/:id/batches`, and PATCH `/api/pharmacist/batches/:id`.

Medicine creation also accepts an optional nested `initialBatch` with the same validated fields as `CreateBatchDto`. A nested Prisma create inside the existing inventory transaction saves the medicine, batch and inventory timestamp together. A failed batch insert rolls back the entire save. Scientific name is optional; omission or an empty string is stored as an empty string without a schema migration. The API retains the numeric reorder threshold for compatibility and existing calculations; the UI hides it, uses zero for new medicines and preserves existing values on edit. Existing standalone medicine/batch endpoints remain available.

JWT/role guards protect every endpoint; identifiers are scoped to the current actor's pharmacy. Inactive subscriptions may read but not write. Every mutation and inventoryUpdatedAt write share one Prisma transaction. DTOs reject unknown fields, immutable batch fields and invalid quantities/costs; the service validates real calendar dates. Display names are normalized for uniqueness within a pharmacy; batch numbers are unique within a medicine.

See [implementation and verification](../../../../../docs/MUSTAFA-IMPLEMENTATION.md) and `src/inventory.integration.spec.ts`.
