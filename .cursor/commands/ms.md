
# Simplify to Microservice Architecture using Composables

## Goal
- Refactor code
- Rules enforced:
  1. Microservices start with `use`
  2. Microservices are initialized before usage
  3. Controller orchestrates only (**0 % business logic**)
  4. Controller is above all microservices in the file

## Example

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

## Context

The context (ctx) helps to communicate between services and controller.

If a microservice needs data from another microservice, the shared data should be added to the context.

```typescript
interface Context {
    userId: string,
    user?: User // will be resolved by useUser
}
```

## Logging

The logging should always follow this structure:

```typescript

interface Context {
    userId: string,
    tasks: TaskResult[]
}

```

TaskResult can be imported from "@nes-base/app/types/rpc"
```typescript
export type TaskResult = {
    success: boolean
    message?: string
    subTasks?: TaskResult[]
    data?: Record<string, unknown>
    error?: Error | string
}
```

### Clientside Log-Output Example

```typescript

    // <Controller>
    useContextExpose('window.userAndOrderContext', ctx)
    // </Controller>

/**
 * Exposes the context to the window-object (on client side)
 * ...
 */
function useContextExpose(name: string, ctx: Context) {
    if (typeof window !== 'undefined') {
        window[name.replace('window.', '')] = ctx
    }
}
```