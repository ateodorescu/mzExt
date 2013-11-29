/**
 * @author Adrian Teodorescu (ateodorescu@gmail.com)
 */
Ext.define('Ext.ux.grid.feature.MultiGroupingSummary', {

    extend: 'Ext.ux.grid.feature.MultiGrouping',

    alias: 'feature.multigroupingsummary',

    showSummaryRow: true,

    vetoEvent: function (record, row, rowIndex, e) {
        var result = this.callParent(arguments);
        if (result !== false) {
            if (e.getTarget(this.summaryRowSelector)) {
                result = false;
            }
        }
        return result;
    }
});