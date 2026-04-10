/**
 * Lifecycle Extension for Worklist Filter & Sort
 */
sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/dm/dme/podfoundation/controller/extensions/LifecycleExtensionConstants"
], function (PluginControllerExtension, OverrideExecution, LifecycleConstants) {
    "use strict";

    return PluginControllerExtension.extend("rits.ext.custom.plugins.LifecycleExtension", {
        constructor: function (oExtensionUtilities) {
            this._oExtensionUtilities = oExtensionUtilities;
        },

        getOverrideExecution: function (sOverrideMember) {
            if (sOverrideMember === LifecycleConstants.ON_BEFORE_RENDERING) {
                return OverrideExecution.After;
            } else if (sOverrideMember === LifecycleConstants.ON_BEFORE_RENDERING_PLUGIN) {
                return OverrideExecution.After;
            } else if (sOverrideMember === LifecycleConstants.ON_AFTER_RENDERING) {
                return OverrideExecution.After;
            } else if (sOverrideMember === LifecycleConstants.ON_EXIT) {
                return OverrideExecution.After;
            }
            return null;
        },

        getExtensionName: function () {
            return LifecycleConstants.EXTENSION_NAME;
        },

        onBeforeRendering: function (oData) {
            this._oExtensionUtilities.logMessage("LifecycleExtension.onBeforeRendering");
        },

        onBeforeRenderingPlugin: function (oData) {
            this._oExtensionUtilities.logMessage("LifecycleExtension.onBeforeRenderingPlugin");
        },

        onAfterRendering: function (oData) {
            this._oExtensionUtilities.logMessage("LifecycleExtension.onAfterRendering");
        },

        onExit: function (oEvent) {
            this._oExtensionUtilities.logMessage("LifecycleExtension.onExit: Cleaning up");
            this._oExtensionUtilities.setCurrentStatusFilter("ALL");
            this._oExtensionUtilities.setCurrentSortField("sfc");
            this._oExtensionUtilities.setSortDescending(false);
        }
    });
});