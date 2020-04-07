import * as async from 'async';
import {
    JobStepDelegate,
    ProxyStepDelegate,
    CallbackDelegate,
} from './delegates';

export class BaseAyncJob {
    public jobResult: any;
    public jobSteps = new Array<JobStepDelegate>();

    private currentStepName = '';
    private jobCallStack = new Array<string>();

    performRun(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const proxySteps = this.createProxySteps();
                async.waterfall(proxySteps, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    appendJobStep(jobStep: JobStepDelegate): void {
        this.jobSteps.push(jobStep);
    }

    handleExceptionDuringJobStep(exception: any, callback: any): void {
        try {
            const exceptionDescription = {
                exceptionInMethod: this.currentStepName,
                exception,
                jobCallStack: this.jobCallStack,
            };

            callback(exceptionDescription);
        } catch (ex) {
            callback(ex);
        }
    }

    completeRun(possibleError: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (possibleError) {
                reject(possibleError);
            } else {
                resolve(this.jobResult);
            }
        });
    }

    private getClassNameFromConstructor(constructorText: string): string {
        let childClassName = '';

        try {
            const funcNameRegex = /function (.{1,})\(/;
            const results = funcNameRegex.exec(constructorText);
            childClassName =
                results && results.length > 1 ? results[1] : 'Unknown';
        // tslint:disable-next-line:no-empty
        } catch (ex) {}
        return childClassName;
    }

    private getClassAndMethodName(method: (...args: any[]) => any): string {
        let classAndMethodName = '';

        try {
            const calleeMethodText = method.toString();
            const methodsOnThis = Object.getPrototypeOf(this);
            let methodName = '';

            for (const methodOnThis in methodsOnThis) {
                if (calleeMethodText === methodsOnThis[methodOnThis]) {
                    methodName = methodOnThis;
                    break;
                }
            }
            methodName = methodName === '?' ? 'anonymous' : methodName;
            const constructorText = methodsOnThis.constructor;
            const className = this.getClassNameFromConstructor(constructorText);
            classAndMethodName = `${className}.${methodName}()`;
        // tslint:disable-next-line:no-empty
        } catch (ex) {}
        return classAndMethodName;
    }

    private proxyStep(
        actualStep: JobStepDelegate,
        callback: CallbackDelegate
    ): void {
        this.currentStepName = this.getClassAndMethodName(actualStep);
        try {
            this.jobCallStack.push(this.currentStepName);
            actualStep.bind(this)(callback);
        } catch (ex) {
            this.handleExceptionDuringJobStep(ex, callback);
        }
    }

    private createProxySteps(): ProxyStepDelegate[] {
        const proxySteps = new Array<ProxyStepDelegate>();

        this.jobSteps.forEach((jobStep: JobStepDelegate) => {
            const proxyStep = this.proxyStep.bind(this, jobStep);
            proxySteps.push(proxyStep);
        });

        return proxySteps;
    }
}
