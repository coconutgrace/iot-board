import {
    ITypeInfo,
    IPostMessage,
    IDatasourceClass,
    IDatasourceState,
    IDatasourcePlugin,
    IDatasourceProps,
    MESSAGE_STATE,
    MESSAGE_INIT,
    MESSAGE_DATA,
    MESSAGE_INITIAL_STATE
} from "../pluginApi/pluginTypes";
import * as React from "react";
import * as URI from "urijs";
import ScriptLoader from "../util/scriptLoader";
import {DatasourceScheduler} from "./datasourceScheduler";

export class FrameDatasourceInstance {
    private typeInfo: ITypeInfo;
    private datasourceClass: IDatasourceClass

    private dsInstance: IDatasourcePlugin
    private dsState: IDatasourceState;
    private data: any[] = [];
    private scheduler: DatasourceScheduler;

    private fetchReplaceData: boolean = false

    constructor(url: string) {
        this.scheduler = new DatasourceScheduler(this);
        window.addEventListener('message',
            (e: MessageEvent) => {
                this.handleMessage(e.data as IPostMessage)
            });

        ScriptLoader.loadScript([url])
            .then(() => {
                if (this.typeInfo === undefined) {
                    throw new Error("Plugin typeInfo not available, did you called registerDatasourcePlugin(...)?")
                }
                return this.loadPluginScriptDependencies(this.typeInfo, url)
            })
            .then(() => {
                this.sendMessage({type: MESSAGE_INIT});
            })
            .catch((e: Error) => {
                console.error("Failed to load datasource plugin from URL", url, e)
            })
    }

    get id(): string {
        return this.dsState.id;
    }

    get type(): string {
        return this.dsState.type;
    }

    initialSetTypeInfo(typeInfo: ITypeInfo) {
        if (this.typeInfo !== undefined) {
            throw new Error("Can not change typeInfo after it was set");
        }
        this.typeInfo = typeInfo;
    }

    initialSetDatasourceClass(datasourceClass: IDatasourceClass) {
        if (this.datasourceClass !== undefined) {
            throw new Error("Can not change datasourceClass after it was set");
        }
        this.datasourceClass = datasourceClass;
    }

    initializePluginInstance() {
        const props = {
            state: this.dsState,
            setFetchInterval: (ms: number) => this.setFetchInterval(ms),
            setFetchReplaceData: (replace: boolean) => this.setFetchReplaceData(replace),
            pushData: (data: any[]) => this.fetchedDatasourceData(data)
        };

        const pluginInstance = new this.datasourceClass();
        this.dsInstance = pluginInstance;

        pluginInstance.props = props;

        // Bind API functions to instance
        if (_.isFunction(pluginInstance.datasourceWillReceiveProps)) {
            pluginInstance.datasourceWillReceiveProps = pluginInstance.datasourceWillReceiveProps.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.datasourceWillReceiveSettings)) {
            pluginInstance.datasourceWillReceiveSettings = pluginInstance.datasourceWillReceiveSettings.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.dispose)) {
            pluginInstance.dispose = pluginInstance.dispose.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.fetchData)) {
            pluginInstance.fetchData = pluginInstance.fetchData.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.initialize)) {
            pluginInstance.initialize = pluginInstance.initialize.bind(pluginInstance);
            this.dsInstance.initialize(props);
        }

        this.scheduler.start();
    }

    // Called by scheduler when data should be fetched.
    // Execution by underlying datasource instance
    fetchData(resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) {
        if (!this.dsInstance.fetchData) {
            console.warn("fetchData(resolve, reject) is not implemented in Datasource ", this.dsInstance);
            reject(new Error("fetchData(resolve, reject) is not implemented in Datasource " + this.dsState.id))
        }
        this.dsInstance.fetchData(resolve, reject);
    }

    fetchedDatasourceData(data: any) {
        if (!_.isArray(data)) {
            data = [data];
        }

        if (!this.fetchReplaceData) {
            data = this.data.concat(data)
        }

        let maxValues = Math.max(1, this.dsState.settings.maxValues)
        data = _.takeRight(data, maxValues);

        this.data = data;
        this.sendDataToApp()
    }

    private sendDataToApp() {
        this.sendMessage({
            type: MESSAGE_DATA,
            payload: this.data
        })
    }

    private setFetchInterval(intervalMs: number) {
        this.scheduler.fetchInterval = intervalMs;
    }

    private setFetchReplaceData(replace: boolean) {
        this.fetchReplaceData = replace;
    }

    private updateInstanceWithState(newState: IDatasourceState) {
        const oldProps = this.dsInstance.props;
        const newProps = _.assign({}, oldProps, {state: newState})

        this.datasourceWillReceiveProps(newProps);
        this.dsInstance.props = newProps;
        if (!_.isEqual(newProps.state.settings, oldProps.state.settings)) {
            this.scheduler.forceUpdate();
        }

    }

    private sendMessage(msg: IPostMessage) {
        window.parent.postMessage(msg, '*');
    }

    private handleMessage(msg: IPostMessage) {
            switch (msg.type) {
                case MESSAGE_INITIAL_STATE: {
                    this.dsState = msg.payload;
                    this.initializePluginInstance()
                    break;
                }
                case MESSAGE_STATE: {
                    this.dsState = msg.payload;
                    this.updateInstanceWithState(this.dsState)
                    break;
                }
                default:
                    console.log("frame got unknown message", msg)
                    break;
            }
    }

    private datasourceWillReceiveProps(newProps: IDatasourceProps) {
        if (newProps.state.settings !== this.dsState.settings) { // TODO: Does this optimization helps with iFrames?
            if (_.isFunction(this.dsInstance.datasourceWillReceiveSettings)) {
                this.dsInstance.datasourceWillReceiveSettings(newProps.state.settings);
            }
        }

        if (_.isFunction(this.dsInstance.datasourceWillReceiveProps)) {
            this.dsInstance.datasourceWillReceiveProps(newProps);
        }
    }

    private loadPluginScriptDependencies(typeInfo: ITypeInfo, url: string): Promise<any> {

        const dependencies: string[] = typeInfo.dependencies;
        if (_.isArray(dependencies) && dependencies.length !== 0) {
            const dependencyPaths = dependencies.map(dependency => {
                return URI(dependency).absoluteTo(url).toString();
            });

            console.log("Loading Dependencies for Plugin", dependencyPaths);
            return ScriptLoader.loadScript(dependencyPaths);
        }
        else {
            return Promise.resolve();
        }
    }
}
