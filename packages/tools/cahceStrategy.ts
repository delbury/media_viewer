// 先进先出
export class FIFO<T> {
  #maxSize: number = 0;
  #caches: Map<string, T> = new Map();
  #cachePromises: Map<string, Promise<T>> = new Map();

  constructor(size: number) {
    this.#maxSize = size;
  }

  public async get(key: string) {
    if (this.#caches.has(key)) return this.#caches.get(key);
    if (this.#cachePromises.has(key)) return await this.#cachePromises.get(key);
    return null;
  }

  public set(key: string, data: T) {
    if (!this.#caches.has(key) && this.#caches.size > this.#maxSize) {
      const k = this.#caches.keys().next().value;
      if (k) this.#caches.delete(k);
    }
    this.#caches.set(key, data);
  }

  // 创建异步任务
  public async setAsync(key: string, dataPromise: Promise<T>) {
    if (!this.#cachePromises.has(key) && !this.#caches.has(key)) {
      this.#cachePromises.set(key, dataPromise);
      await dataPromise
        .then(data => {
          this.set(key, data);
        })
        .finally(() => {
          this.#cachePromises.delete(key);
        });
    }
  }

  public clear() {
    this.#caches.clear();
  }
}
