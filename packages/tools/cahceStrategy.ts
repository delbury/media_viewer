// 先进先出
export class FIFO<T> {
  #maxSize: number = 0;
  #caches: Map<string, T> = new Map();

  constructor(size: number) {
    this.#maxSize = size;
  }

  public get(key: string) {
    return this.#caches.get(key);
  }

  public set(key: string, data: T) {
    if (!this.#caches.has(key) && this.#caches.size > this.#maxSize) {
      const k = this.#caches.keys().next().value;
      if (k) this.#caches.delete(k);
    }
    this.#caches.set(key, data);
  }

  public clear() {
    this.#caches.clear();
  }
}
