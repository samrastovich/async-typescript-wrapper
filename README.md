# Async.js Typescript Wrapper 

This repository is an extension of [AsyncJS](https://caolan.github.io/async/v3/) and requires it as a peer dependency. This package extends the functionality to work well with TypeScript and allows a more readable / approachable method to working with Async.  

## Usage 

Extend the **BaseAsyncJob** in your classes to utilize the library. Call **appendJobStep** on each function you want to add to the call stack.  

```typescript
import { BaseAsyncJob, CallbackDelegate } from 'async-typescript-wrapper';

class HelloWorldJob extends BaseAsyncJob {

    constructor() {
        this.initialize();
    }

    run(): Promise<any> {
        return this.performRun();
    }

    private initialize(): void {
        this.appendJobStep(this.logHello);
        this.appendJobStep(this.logWorld);
    }

    private logHello(callback: CallbackDelegate): void {
        console.log("Hello");
        callback();
    }

    private logWorld(callback: CallbackDelegate): void {
        console.log("World!");
        callback();
    }
}
```


