type Function<Result> = () => void | Promise<Result>

export async function withTime<Result>(func: Function<Result>) {
    const start = performance.now();

    const result = await func()

    const end = performance.now();

    const seconds = (end - start) / 1000;

    const time = Number(seconds.toFixed(3))

    return { time, result }
}