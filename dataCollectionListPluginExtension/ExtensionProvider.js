 sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginExtensionProvider",
    "rits/ext/custom/plugins/dataCollectionListPluginExtension/LifecycleExtension",
    "rits/ext/custom/plugins/dataCollectionListPluginExtension/PluginEventExtension",
    "rits/ext/custom/plugins/dataCollectionListPluginExtension/PropertyEditorExtension",
    "rits/ext/custom/plugins/utils/ExtensionUtilities"
], function (PluginExtensionProvider, LifecycleExtension, PluginEventExtension, 
             PropertyEditorExtension, ExtensionUtilities) {
    "use strict";
    return PluginExtensionProvider.extend("rits.ext.custom.plugins.dataCollectionListPluginExtension.ExtensionProvider", {
        constructor: function () {
            this.oExtensionUtilities = new ExtensionUtilities();
        },
        getExtensions: function () {
           return [
               new LifecycleExtension(this.oExtensionUtilities),
               new PluginEventExtension(this.oExtensionUtilities),
               new PropertyEditorExtension(this.oExtensionUtilities)
           ];
        }
    })
});
