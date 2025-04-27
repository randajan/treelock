# @randajan/treelock

[![NPM](https://img.shields.io/npm/v/@randajan/treelock.svg)](https://www.npmjs.com/package/@randajan/treelock) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


**TreeLock** is a minimalist and deterministic locking mechanism for JavaScript that organizes asynchronous operations into a hierarchical, tree-like structure. Each lock node cooperates with its root and its branches to ensure that tasks are executed in the correct order — peacefully, predictably, and without deadlocks.

> _“I shall wait until I am calm, my root is calm, and all my branches are calm.”_  
> — TreeLock, probably

## Why TreeLock?

Because sometimes, simple promises and semaphores aren't enough. You need:

- 🧠 Smart queueing based on hierarchy  
- 🌿 Elegant dependency propagation  
- 🔒 Synchronized task execution across nested contexts  
- ☯️ Inner peace in your asynchronous flows

## Features

- Deterministic task order based on time of registration
- Propagated locking from root to branches
- Automatically delays conflicting operations
- Lightweight and dependency-free (except for a `@randajan/sleep` helper)
- Perfect for nested resource management or transactional consistency

## Installation

```bash
npm install @your-scope/TreeLock
```

## Usage

```js
import { TreeLock } from "@your-scope/TreeLock";

const root = new TreeLock();
const A = root.sub();
const B = root.sub();

await Promise.all([
    root.run(() => sleep(100)),
    A.run(() => sleep(100)),
    B.run(() => sleep(100))
]);
```

This guarantees that:
1. Tasks run in order of registration
2. No two conflicting branches will run simultaneously
3. Root tasks block all branches, but branches can run in parallel if root is free

## Options

You can pass the following options to the `TreeLock` constructor or the `.sub()` method:

- `name` (`string`, optional): Just a label, useful for logging/debugging.
- `ttl` (`number`, optional): Timeout in milliseconds for each task. Tasks exceeding this limit are cancelled.
- `on` (`function(lock, status, result)`, optional): A callback for each lock event: `enter`, `start`, `done`, `timeout`, `error`.
- `sup` (`TreeLock`, optional): Used to attach a children to a parent (sub to sup)

## Properties

Each `TreeLock` instance exposes the following properties:

- `name`: The name of this lock.
- `sup`: The parent `TreeLock` instance (if any).
- `subs`: Array of child `TreeLock` instances.
- `ram`: Number of currently running tasks in this lock.
- `ramSup`: Number of currently running tasks in all parent locks.
- `ramSub`: Number of currently running tasks in all child locks.
- `queue`: A Promise that resolves once all currently enqueued tasks are done.

## API

### `run(fn, ttl?, ...args): Promise<void>`

Runs a task within the lock. Waits for its turn based on the lock tree structure.

- `fn`: Function to execute.
- `ttl`: Optional timeout in milliseconds.
- `...args`: Arguments to pass to `fn`.

Returns a promise that resolves when the task finishes or rejects on timeout/error.

### `wrap(fn, ttl?): (...args) => Promise<void>`

Wraps a function with the lock logic. Useful for passing locked functions around.

- `fn`: Function to wrap.
- `ttl`: Optional timeout in milliseconds.

Returns a new function that automatically runs inside the lock.

### `sub(options?): TreeLock`

Creates a child `TreeLock` bound to this one.
Main benefits:
1. Any task scheduled on this child will wait for all parent locks to be free.
2. Any task scheduled at parent will also lock it's subtree

- `options`: Same options as constructor (except `sup`, which is inherited).

Returns a new `TreeLock` instance.


## License

MIT