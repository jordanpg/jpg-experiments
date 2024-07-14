import { readFile } from "fs/promises";
import path from "path";

export interface TestDataOptions {
    dataExt?: string;
    targets?: Record<string, string>;
    resolveTarget?(absolutePath: string): Promise<any>;
}

export type TestDataResult<TOptions extends TestDataOptions> = {
    [target in keyof TOptions["targets"]]: any;
} & {
    name: string;
    content: string;
};

const defaultTestDataOptions = {
    dataExt: "txt",
    targets: { expected: "json" },
} as const;

export async function testData<
    TOptions extends TestDataOptions = typeof defaultTestDataOptions,
>(paths: string[], options?: TOptions): Promise<TestDataResult<TOptions>[]> {
    const { dataExt, targets, resolveTarget } = {
        ...defaultTestDataOptions,
        ...options,
    };
    const toReturn = [] as TestDataResult<TOptions>[];

    await Promise.all(
        paths.map(async (p) => {
            const r = {
                name: path.basename(p),
            } as TestDataResult<TOptions>;
            const basePath = p;
            r.content = await readFile(`${basePath}.${dataExt}`, {
                encoding: "utf-8",
            });
            await Promise.all(
                Object.keys(targets).map(async (t) => {
                    const resolvedName = `${basePath}.${targets[t]}`;
                    if (resolveTarget) {
                        r[t] = await resolveTarget(resolvedName);
                        return;
                    }
                    // Fall back to dynamic import
                    r[t] = (await import(resolvedName).then(
                        (module) => module.default,
                    )) as string[][];
                }),
            );
            toReturn.push(r);
        }),
    );

    return toReturn;
}
