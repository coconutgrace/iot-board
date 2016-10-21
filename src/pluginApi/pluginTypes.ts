/**
 * After a plugin was registered, we create a PluginFactory to store and create instances of the loaded Plugin
 */
export interface IPluginFactory<TPlugin extends IPlugin> {
    getInstance(id: string): TPlugin
    dispose(): void
}

/**
 * Describes an actual instance of a Plugin
 */
export interface IPlugin {
}

/**
 * The plugin that is registered to the Dashboard
 */
export interface IPluginModule {
    TYPE_INFO: ITypeInfo
}


export interface ITypeInfo {
    type: string // The name of the type - must be unique
    kind?: "datasource" | "widget" // The kind of a plugin, is it a datasource or a widget
    author?: string // The creator of the plugin
    version?: string // The version of the plugin, use semantic versioning (e.g. 1.4.2)
    name?: string // The user friendly name of the Plugin
    description?: string // A user friendly description that explains the Plugin
    dependencies?: string[] // A list of URL's to load external scripts from. Some scripts like jQuery will be available by default in future
    settings?: ISetting[] // A list of settings that can be changed by the user when the Plugin is initialized
}

export interface ISetting {
    id: string // Technical id, used to receive the value later
    name: string // User friendly string to describe the value
    type: string // Defines how the setting is rendered, validated and interpreted
    description?: string // User friendly description with detail information about the value
    defaultValue?: any // The default value that is preset when a new Plugin is configured, currently must be a string
    required?: boolean // true when the setting is required
}

/**
 * Message to send data between the Dashboard and the Widget iFrame
 */
export interface IPostMessage {
    type: string
    payload?: any
}

// The message types
export const MESSAGE_INIT = "init"; // iframe -> app :: iFrame is ready
export const MESSAGE_INITIAL_STATE = "initialState"; // app -> iFrame :: send initial state to iFrame
export const MESSAGE_STATE = "state"; // app -> iFrame :: send state to iFrame
export const MESSAGE_DATA = "data"; // app <-> iFrame :: transfer datasource data from datasource or to widget
export const MESSAGE_UPDATE_SETTING = "updateSetting"; // iFrame -> app :: The plugin wants to update a setting

/*
 * Datasource
 */

export interface IDatasourceState {
    id: string
    type: string
    settings: any
    isLoading: boolean
}

export interface IDatasourceClass extends IDatasourcePlugin {
    new(): IDatasourcePlugin
}

export interface IDatasourceProps {
    state: IDatasourceState
    setFetchInterval: (intervalInMs: number) => void
    setFetchReplaceData: (replace: boolean) => void
}

export interface IDatasourcePlugin extends IPlugin {
    props?: IDatasourceProps
    datasourceWillReceiveProps?: (newProps: IDatasourceProps) => void
    datasourceWillReceiveSettings?: (nextSettings: any) => void
    dispose?: () => void
    initialize?(props: IDatasourceProps): () => void
    fetchData?<T>(resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void): void
}

/*
 * Widget
 */

export interface GetDataFunction {
    (dsId: string): any[]
}

export interface IWidgetProps {
    state?: IWidgetState | any
    data: {[dsId: string]: any[]}
    getData?: GetDataFunction
    updateSetting?: (settingId: string, value: any) => void
}

export interface IWidgetPosition {
    row: number;
    col: number;
    width: number;
    height: number;
}

export interface IWidgetState extends IWidgetPosition {
    id: string;
    type: string;
    settings: any;
    availableHeightPx: number;
}
