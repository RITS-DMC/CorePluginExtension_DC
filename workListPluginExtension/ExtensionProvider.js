/**
 * Worklist Filter & Sort Extension Provider
 */
sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginExtensionProvider",
    "rits/ext/custom/plugins/workListPluginExtension/LifecycleExtension",
    "rits/ext/custom/plugins/workListPluginExtension/CreateExtension",
    "rits/ext/custom/plugins/workListPluginExtension/PluginEventExtension",
    "rits/ext/custom/plugins/workListPluginExtension/PropertyEditorExtension",
    "rits/ext/custom/plugins/workListPluginExtension/ExtensionUtilities"
], function (PluginExtensionProvider, LifecycleExtension, CreateExtension, 
             PluginEventExtension, PropertyEditorExtension, ExtensionUtilities) {
    "use strict";

    console.log("=== WorklistFilterSort ExtensionProvider LOADED ===");

    return PluginExtensionProvider.extend("rits.ext.custom.plugins.ExtensionProvider", {
        constructor: function () {
            console.log("=== WorklistFilterSort ExtensionProvider CONSTRUCTOR ===");
            this.oExtensionUtilities = new ExtensionUtilities();
            this.oExtensionUtilities.setLogToConsole(true);
        },

        getExtensions: function () {
            console.log("=== WorklistFilterSort getExtensions CALLED ===");
            return [
                new CreateExtension(this.oExtensionUtilities),
                new LifecycleExtension(this.oExtensionUtilities),
                new PluginEventExtension(this.oExtensionUtilities),
                new PropertyEditorExtension(this.oExtensionUtilities)
            ];
        }
    });
});