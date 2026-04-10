/**
 * Plugin Event Extension for Worklist Filter & Sort
 */
sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/dm/dme/plugins/worklistPlugin/controller/extensions/PluginEventExtensionConstants"
], function (PluginControllerExtension, OverrideExecution, PluginEventConstants) {
    "use strict";

    return PluginControllerExtension.extend("rits.ext.custom.plugins.PluginEventExtension", {
        constructor: function (oExtensionUtilities) {
            this._oExtensionUtilities = oExtensionUtilities;
        },

        getOverrideExecution: function (sOverrideMember) {
            if (sOverrideMember === PluginEventConstants.ON_WORKLIST_REFRESH_SUCCESS) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_WORKLIST_DATA_LOADED) {
                return OverrideExecution.After;
            }
            return null;
        },

        getExtensionName: function () {
            return PluginEventConstants.EXTENSION_NAME;
        },

        onWorklistRefreshSuccess: function (oResponse) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onWorklistRefreshSuccess");
        },

        onWorklistDataLoaded: function (oTable, aData) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onWorklistDataLoaded: " + 
                                                  (aData ? aData.length : 0) + " items");
        }
    });
});