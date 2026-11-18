# Context for what and why this is.

Well, first off, I took my hands off writing code around 8 months ago. I started using AI. I let it do too much and I feel my skills started to rot. I wanna get my hands dirty again.

Second, I wanna test some new stuff. I want to build a data-intensive application, and get to experience with securing it, optimising performance, scaling, and so on.

I am thinking of a back-end for a multi-tenant e-commerce platform.

I will come back and update this as I progress.

Peace


# Issues I have been through while building this:

1. When seeding, trying to insert 1 million rows at a time, I found out that TypeORM's `manager.save()` function does all the persistence checks (cascades, dependency sorting, insert/update by default, e.t.c.), and at such a volume, it throws a Maximum call stack size exceeded. Even with 100k there was an issue - speed - because `manager.save` sends one INSERT command per entity, which is slow.
The *solution* was to use `insert` instead of `save`. That uses a classic INSERT without doing all the checks that take a lot of time and are not useful in this scenario. Without batching, this is still slow - 18s. Batching with 10k entities, it takes 9.8seconds. Good