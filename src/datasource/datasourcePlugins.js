
export class PluginRegistry {

    constructor() {
        this.datasources = {}
    }

    register(module) {
        console.assert(module.TYPE_INFO, "Missing TYPE_INFO on datasource module. Every module must export TYPE_INFO");
        this.datasources[module.TYPE_INFO.type] = {
            ...module.TYPE_INFO,
            datasource: module.Datasource,
            configDialog: module.ConfigDialog ? module.ConfigDialog : null
        }
    }

    getDatasource(type:String) {
        return this.datasources[type];
    }
}


const DatasourcePlugins = new PluginRegistry();
export default DatasourcePlugins;