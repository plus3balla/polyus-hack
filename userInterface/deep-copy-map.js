function deepCopyArray(src) {
    const target = [];
    for (let i = 0; i < src.length; i++) {
        const v = src[i];
        if (v) {
            if (typeof v === "object") {
                target[i] = deepCopyArray(v);
            }
            else {
                target[i] = v;
            }
        }
        else {
            target[i] = v;
        }
    }
    return target;
}
export default function deepCopyMap(src) { return new Map(deepCopyArray(Array.from(src))); }
