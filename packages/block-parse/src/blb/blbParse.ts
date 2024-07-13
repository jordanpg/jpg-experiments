import { Readable } from "stream";

function __fromString(str: string) {
    const lines = str.split(/\n/gm);
}

export default async function blbParse(
    content: string | NodeJS.ReadableStream,
) {
    // If we've been pased a Readable, then read it out and then parse the whole thing.
    // TODO: since BLB files are completely linear we can probably process the stream as it comes in...
    if (typeof content !== "string" && Readable.isReadable(content)) {
        const chunks: Buffer[] = [];
        for await (const chunk of content) {
            chunks.push(Buffer.from(chunk));
        }
        return __fromString(Buffer.concat(chunks).toString("utf-8"));
    }
}
