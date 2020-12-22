export class Mutex {
  currentLock: Promise<void>;

  constructor() {
    this.currentLock = Promise.resolve();
  }

  lock() {
    let removeLock: () => void;
    const newLock = new Promise<void>((resolve) => {
      removeLock = () => resolve();
    });
    const unlock = this.currentLock.then(() => removeLock);
    this.currentLock = newLock;
    return unlock;
  }
}
