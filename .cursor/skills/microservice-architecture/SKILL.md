---
name: microservice-architecture
description: Structures code using composable microservice architecture with use* pattern. Use when creating new functions, organizing business logic, or when the user requests microservice architecture.
---

# Microservice Architecture

Structures code using composable microservice pattern following strict architectural rules.

## Core Rules

1. **Microservices start with `use`** prefix
2. **Microservices initialized before usage**
3. **Controller orchestrates only (0% business logic)**
4. **Controller appears above all microservices in file**

## Pattern Structure

### Controller (Top of File)

```typescript
/**
 * Controller: Fetch user and their orders in parallel
 * Uses composable microservices `useUser` and `useOrder`
 * @param userId - ID of the user
 * @returns object with `user` and `orders`
 */
export async function getUserWithOrders(userId: string) {
  try {
    const ctx: Context = { userId } // context for services

    const user = useUser(ctx)
    const order = useOrder(ctx)

    const [u, o] = await Promise.all([
      user.getUser(),
      order.getOrdersByUser(),
    ])

    return { user: u, orders: o }
  } catch (e: any) {
    throw new Error("getUserWithOrders failed: " + e.message)
  }
}
```

**Controller responsibilities:**
- Initialize context
- Initialize microservices
- Orchestrate parallel/sequential execution
- Handle top-level errors
- **Zero business logic**

### Microservices (Below Controller)

```typescript
/**
 * Microservice: User
 * Provides user-related operations
 * @param ctx - context containing `userId`
 */
function useUser(ctx: { userId: string }) {
  const getUser = async () => {
    try {
      return await db.users.find(ctx.userId)
    } catch (e: any) {
      throw new Error("getUser failed: " + e.message)
    }
  }

  return { getUser }
}

/**
 * Microservice: Order
 * Provides order-related operations
 * @param ctx - context containing `userId`
 */
function useOrder(ctx: { userId: string }) {
  const getOrdersByUser = async () => {
    try {
      return await db.orders.findByUser(ctx.userId)
    } catch (e: any) {
      throw new Error("getOrdersByUser failed: " + e.message)
    }
  }

  return { getOrdersByUser }
}
```

**Microservice responsibilities:**
- Contain domain-specific business logic
- Accept context object
- Return methods/state object
- Handle domain-specific errors
- Name with `use` prefix

## Context Pattern

Context communicates between services and controller.

**Basic context:**
```typescript
interface Context {
  userId: string
}
```

**Shared data context:**
```typescript
interface Context {
  userId: string
  user?: User // resolved by useUser, used by other services
}
```

**If a microservice needs data from another microservice, add shared data to context.**

## Logging Pattern

Context includes task results for logging:

```typescript
interface Context {
  userId: string
  tasks: TaskResult[]
}
```

**TaskResult type:**
```typescript
export type TaskResult = {
  success: boolean
  message?: string
  subTasks?: TaskResult[]
  data?: Record<string, unknown>
  error?: Error | string
}
```

### Client-side Log Exposure

```typescript
// In controller
useContextExpose('window.userAndOrderContext', ctx)

/**
 * Exposes the context to the window-object (on client side)
 */
function useContextExpose(name: string, ctx: Context) {
  if (typeof window !== 'undefined') {
    window[name.replace('window.', '')] = ctx
  }
}
```

## Implementation Steps

When creating new code:

1. **Identify business logic domains** (user, order, payment, etc.)
2. **Create Context interface** with shared data
3. **Create microservices:**
   - Name with `use` prefix
   - Accept context
   - Return methods object
   - Include error handling
4. **Create controller:**
   - Place at top of file
   - Initialize context
   - Initialize microservices
   - Orchestrate execution
   - Zero business logic
5. **Place microservices below controller**

## Bad vs Good Example

### ❌ Bad: Monolithic

```typescript
export async function getUserWithOrders(userId: string) {
  // Mixed concerns, no separation
  const user = await db.users.find(userId)
  const orders = await db.orders.findByUser(userId)
  const processedOrders = orders.map(o => ({
    ...o,
    total: o.items.reduce((sum, i) => sum + i.price, 0)
  }))
  return { user, orders: processedOrders }
}
```

### ✅ Good: Microservice Architecture

```typescript
// Controller (orchestration only)
export async function getUserWithOrders(userId: string) {
  try {
    const ctx: Context = { userId }
    
    const user = useUser(ctx)
    const order = useOrder(ctx)
    
    const [u, o] = await Promise.all([
      user.getUser(),
      order.getOrdersWithTotals(),
    ])
    
    return { user: u, orders: o }
  } catch (e: any) {
    throw new Error("getUserWithOrders failed: " + e.message)
  }
}

// Microservices (business logic)
function useUser(ctx: { userId: string }) {
  const getUser = async () => {
    try {
      return await db.users.find(ctx.userId)
    } catch (e: any) {
      throw new Error("getUser failed: " + e.message)
    }
  }
  return { getUser }
}

function useOrder(ctx: { userId: string }) {
  const getOrdersWithTotals = async () => {
    try {
      const orders = await db.orders.findByUser(ctx.userId)
      return orders.map(o => ({
        ...o,
        total: o.items.reduce((sum, i) => sum + i.price, 0)
      }))
    } catch (e: any) {
      throw new Error("getOrdersWithTotals failed: " + e.message)
    }
  }
  return { getOrdersWithTotals }
}
```

## File Structure

```typescript
// 1. Exports and interfaces at top
export interface Context { /* ... */ }

// 2. Controller (exported, orchestrates)
export async function controllerName() { /* ... */ }

// 3. Microservices (non-exported, business logic)
function useServiceOne() { /* ... */ }
function useServiceTwo() { /* ... */ }
function useServiceThree() { /* ... */ }
```

## Verification Checklist

After implementation:

- [ ] All microservices start with `use` prefix
- [ ] All microservices initialized before usage
- [ ] Controller has 0% business logic (only orchestration)
- [ ] Controller appears above all microservices
- [ ] Context interface defined
- [ ] Each microservice handles domain-specific errors
- [ ] File structure follows pattern (exports → controller → microservices)
