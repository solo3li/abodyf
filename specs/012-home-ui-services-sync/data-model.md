# Data Model: Home UI Enhancement and Data Sync

## Entities

### Service (Existing)
Represents a task offered by an executor.
- **Fields**:
  - `Id`: UUID (Primary Key)
  - `Title`: String
  - `Description`: String
  - `BasePrice`: Decimal
  - `CategoryId`: UUID (Foreign Key)
  - `ExecutorId`: UUID (Foreign Key)
  - `ImageUrl`: String
  - `Status`: String ("Active", "Inactive")
  - `Rating`: Decimal

### User (Existing - as Executor)
Represents the service provider.
- **Fields**:
  - `Id`: UUID (Primary Key)
  - `FullName`: String
  - `ProfilePicture`: String
  - `Rating`: Decimal
  - `CompletedOrdersCount`: Integer
  - `IsExecutor`: Boolean
  - `Bio`: String

### Category (Existing)
- **Fields**:
  - `Id`: UUID (Primary Key)
  - `Name`: String
  - `Icon`: String

## State Model (Frontend)

### Catalog State (`catalogSlice`)
- `services`: `Service[]`
- `executors`: `User[]`
- `categories`: `Category[]`
- `loading`: `boolean`
- `error`: `string | null`

## Relationships
- `Service` belongs to `Category`.
- `Service` belongs to `User` (Executor).
- `User` has many `Service` offerings.
