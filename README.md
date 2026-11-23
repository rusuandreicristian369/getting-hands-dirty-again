# Context for what and why this is.

Well, first off, I took my hands off writing code around 8 months ago. I started using AI. I let it do too much and I feel my skills started to rot. I wanna get my hands dirty again.

Second, I wanna test some new stuff. I want to build a data-intensive application, and get to experience with securing it, optimising performance, scaling, and so on.

I am thinking of a back-end for a multi-tenant e-commerce platform.

I will come back and update this as I progress.

Peace

# Conventions

_Arguments_: one domain input first, then the manager (if the ,method is meant to run in a transaction). Soon will have a `ctx` argument with the tenant / buyer & other stuff.

# How I use AI for this project

I use it to research a scenario that I am hitting and help me with syntax, _never to write_, just to _tell me_.
For example, I didn't know the syntax for creating relationships between entities in TypeORM, so I asked that, understood, then built.

I asked for help plumbing the outbox/relay/rabbitmq part. I didn't take the code for granted and I challenged its findings. It came up with a solution for a 'parked' queue, and I smelled that there might be a solution already built-in rabbitmq - and that was _right_.

# Modeling

I will keep it simple. Tenants have one store. A store has multiple products.

The first thing I wanna implement is a lot of buyers requesting the same product, and making sure that only the first to request gets it, never two people (i.e. no race conditions).

# High-level Decisions

When an order happens, I reserve the product and create an order. Reserving a product means I decrement the stock of that product, and by creating an order I also know where that stock is (in case the order fails, and I have to make the stock available again).

I have tested the e2e orders having just one instance of the application running, and it's fine. Next up is to test it having multiple processes of the node.js backend, to simulate a distributed system.
_UPDATE_: I have updated the e2e test to use three instances of the back-end, and I tested sending requests to all three instances with a round-robin method, assessing there is still no overselling / underselling when in a distributed environment.

For _async event processing_, I chose to implement an outbox, with the relayer as a different process, and rabbitmq for consuming the events. The reason is the environment (distributed), scalability and reliability.
Since this is going to run on multiple node instances, we can't use in-memory events. Clear.
The outbox is storing the events in the same database, in the same transaction where an action happens - so we know these two are tied - if an action happens, its event is also stored, or neither happens. Never out-of-sync.

# Low-level decisions

The configuration files use `registerAs` from `@nestjs/config` and schema validation from `zod`.

I created a decorator to be used for writing `OnStripeEvent` and `OnMessage` - to have type safety on `topics` and the payloads expected, and to wrap the error handling in one place, instead of doing it in every method that used these decorators (i.e. see `parsePayload`). I thought that it's best to do so.

# Issues I have been through while building this:

1. When seeding, trying to insert 1 million rows at a time, I found out that TypeORM's `manager.save()` function does all the persistence checks (cascades, dependency sorting, insert/update by default, e.t.c.), and at such a volume, it throws a Maximum call stack size exceeded. Even with 100k there was an issue - speed - because `manager.save` sends one INSERT command per entity, which is slow.
   The _solution_ was to use `insert` instead of `save`. That uses a classic INSERT without doing all the checks that take a lot of time and are not useful in this scenario. Without batching, this is still slow - 18s. Batching with 10k entities, it takes 9.8seconds. Good

# AI Observations - where it went wrong.

AI is not acting like a senior even when you ask it to. I asked it to come with the correct solution for the fact that my order e2e spec test was not using the `StandardSchemaValidationPipe`. Then it told me to use `app.useGlobalPipes` in the test. Good I knew that there has to be a better way, a way to provide it globally in the module. Otherwise, I would've trusted "senior advice". This is how code can get messy when you let AI code :)

When I asked about Stripe, it proposed a `Cancelled` status for the order. I challenged it, knowing that Stripe's hosted checkout sessions do not offer the possibility to "cancel" - you pay and get `payment.failed` or `payment.succeeded`, or `checkout.session.expired`. AI didn't know this, yet it was very confident.

It tried to explain to me how it's best to guard the creating of the checkout session in `order.service.ts` - after creating the session, guard that the order still has `AWAITING_PAYMENT` status, otherwise, throw an error. But the only real moment when that would happen is if the order would expire right before the checkout would be created. How does that have any logic? And this was generated with `Fable 5.2` on `high`. If that's the reasoning quality it produces in such a small codebase, I am worried for anything bigger than this project. Then imagine coding like this an entire application and having to wonder "what's the meaning of this?" :)

Then it tried to create types and zod schemas for Stripe events. I knew that Stripe offers this, in a `Stripe.Event` discriminated union on `type`, so I was amazed. Also had to flag it back.

So far, most of the work were my ideas + fable 5.2's code that I had to give back 3-4 times and, in the end, simply write it like I would've. Because otherwise it would've became messy.

When I created the decorators for `OnMessage` and `OnStripeEvent`, it suggested a handbook decorator, so to speak - copying every metadataKey on the new value, and so on. Ignoring the existence of `@nestjs/common` module that can easily do this with `applyDecorators` and `UsePipes`. Lol

# Right now:

- I am aware that the way we test now is not the best, since these are e2e tests, you would need the database in a state where you're 100% sure you can arrive through e2e usage, right? But for now, I am raw inserting in the database. Will revisit this when I add logic for the rest.

# Things I learned

- I was thinking about how would things work if I were to add database _replicas_. I understood that replicas are helpful for the read part. The writes would still remain on the master node. So if reads become a bottleneck, and we want to scale reading or improve availability, having replicas can help with that.
- But then I thought: what if the read is not the bottleneck, but writing? Then I understood that the solution would be to _shard_ the database around some shard key (e.g. by tenant), essentially creating multiple _master_ nodes for writing, and having replicas for each of them. Makes sense :)
