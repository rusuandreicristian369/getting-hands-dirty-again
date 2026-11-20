# Context for what and why this is.

Well, first off, I took my hands off writing code around 8 months ago. I started using AI. I let it do too much and I feel my skills started to rot. I wanna get my hands dirty again.

Second, I wanna test some new stuff. I want to build a data-intensive application, and get to experience with securing it, optimising performance, scaling, and so on.

I am thinking of a back-end for a multi-tenant e-commerce platform.

I will come back and update this as I progress.

Peace

# How I use AI for this project
I use it to research a scenario that I am hitting and help me with syntax, *never to write*, just to *tell me*.
For example, I didn't know the syntax for creating relationships between entities in TypeORM, so I asked that, understood, then built.


# Modeling

I will keep it simple. Tenants have one store. A store has multiple products.

The first thing I wanna implement is a lot of buyers requesting the same product, and making sure that only the first to request gets it, never two people (i.e. no race conditions).

# Decisions

When an order happens, I reserve the product and create an order. Reserving a product means I decrement the stock of that product, and by creating an order I also know where that stock is (in case the order fails, and I have to make the stock available again).

# Issues I have been through while building this:

1. When seeding, trying to insert 1 million rows at a time, I found out that TypeORM's `manager.save()` function does all the persistence checks (cascades, dependency sorting, insert/update by default, e.t.c.), and at such a volume, it throws a Maximum call stack size exceeded. Even with 100k there was an issue - speed - because `manager.save` sends one INSERT command per entity, which is slow.
The *solution* was to use `insert` instead of `save`. That uses a classic INSERT without doing all the checks that take a lot of time and are not useful in this scenario. Without batching, this is still slow - 18s. Batching with 10k entities, it takes 9.8seconds. Good


# Observations

AI is not acting like a senior even when you ask it to. I asked it to come with the correct solution for the fact that my order e2e spec test was not using the `StandardSchemaValidationPipe`. Then it told me to use `app.useGlobalPipes` in the test. Good I knew that there has to be a better way, a way to provide it globally in the module. Otherwise, I would've trusted "senior advice". This is how code can get messy when you let AI code :)

# Right now:
- I am aware that the way we test now is not the best, since these are e2e tests, you would need the database in a state where you're 100% sure you can arrive through e2e usage, right? But for now, I am raw inserting in the database. Will revisit this when I add logic for the rest.