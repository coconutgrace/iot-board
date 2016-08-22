# Architecture

Some words about the architecture.

## Plugins

For Plugins there is a certain terminology for different parts.

* `Plugin` is the name of the part that is loaded dynamically at runtime and consists of the `PluginClass` and `TYPE_INFO`. Usually represented by a single JavaScript file / module
* A `PluginRegistry` takes care of the loading of the Plugin.
* When a `Plugin` is loaded internally by the `PluginRegistry` a `PluginFactory` is created based on the `PluginClass` and `TYPE_INFO`
* Using the `PluginFactory` a new `PluginInstance` is created that takes care of the actual lifecycle of a Widget or Datasource.
* Inside the Dashboard state we also have a `PluginState` for the `PluginFactory` and a `DatasourceState` / `WidgetState` for the actual `PluginInstance`

If we take a look at the lifecycle of the classes it means:

* `Plugin`: No Lifecycle, just declaration
* `PluginRegistry`: Singleton, same as the whole application
* `PluginFactory`: Created when Plugin is loaded, destroyed when the Plugin is removed
* `PluginInstance`: Created when a Datasource or Widget is added by the user. Destroyed when it is removed or the Plugin is removed.



